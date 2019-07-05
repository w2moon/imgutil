import * as rf from "remotefile";
import { ImgUtilParams } from "../ImgUtilServer";
import tinify from "tinify";
import uuidv1 from "uuid/v1";
import path from "path";
import fs from "fs";

import {MD5Storage} from "md5storage";

interface TinyPngParams extends ImgUtilParams{

}

export  class TinyPng{
    private keys:string[] = [];
    private curKeyIndex:number = 0;
    private storage:MD5Storage;
    constructor(keys:string[],folder:string = "tinypng"){
        this.storage = new MD5Storage(folder);
        this.keys = keys;
        tinify.key = this.keys[0];
    }
    private changeKey(){
        this.curKeyIndex = (this.curKeyIndex+1)%this.keys.length;
        tinify.key = this.keys[this.curKeyIndex];
    }
    private async _processFile(file:string,toFile:string,retryNum:number){
        return new Promise((resolve,reject)=>{
            tinify.fromFile(file).toFile(toFile,(err)=>{
                if(err){
                    if (err instanceof tinify.AccountError) {
                        
                        if(retryNum >= this.keys.length){
                            reject("accounterr");
                        }
                        else{
                            resolve(false);
                        }
                        
                      } else if (err instanceof tinify.ClientError) {
                          reject("imgerr");
                      } else if (err instanceof tinify.ServerError) {
                        reject("tmperr");
                      } else if (err instanceof tinify.ConnectionError) {
                        reject("neterr");
                      } else {
                        reject("othererr");
                      }
                }
                else{
                    resolve(true);
                }
                
                
            });
        });
    }
    private getFileName(file:string){
        let newpath = path.resolve(path.dirname(file),uuidv1());
        while(fs.existsSync(newpath)){
            newpath = path.resolve(path.dirname(file),uuidv1());
        }
        return newpath;
    }
    async processFile(file:string,toFile?:string){
        let md5path = this.storage.getValidPath(file);
       if(md5path){
           return md5path;
       }
       let tempFile = toFile || this.getFileName(file);
       let retryNum = 0;
       try{
            while(!await this._processFile(file,tempFile,retryNum)){
                this.changeKey();
                retryNum++;
        }
       }
       catch(e){
           throw e;
       }
       this.storage.saveOther(file,tempFile);
       return tempFile;
    }

    async process(files:rf.FileDict,params:ImgUtilParams):Promise<rf.RemoteFileResInfo>{
        let info:rf.RemoteFileResInfo = {
            err:"",
            files:{},
        }
        for(let fieldname in files){
            try{
                let file = await this.processFile(files[fieldname]);
                if(file){
                    info.files[fieldname] = file;
                }
            }
            catch(e){
                info.err += `error ${fieldname} ${e}`;
            }
            
        }
        return info;
    
    }
}


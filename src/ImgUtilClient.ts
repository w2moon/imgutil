import * as rf from "remotefile";
import path from "path";
import { UtilType } from "./ImgUtilServer";
export default class ImgUtilClient{
    private client:rf.RemoteFileClient;
    constructor(url:string){
        this.client = new rf.RemoteFileClient(url);
    }

    async tinypng(file:string){
        let fieldname = path.basename(file);
        let dict:any = {};
        dict[fieldname] = file;
        return await this.client.process(dict,{
            type:UtilType.TinyPng
        });
    }
}
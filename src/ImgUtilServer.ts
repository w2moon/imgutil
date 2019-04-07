import * as rf from "remotefile";
export interface ImgUtilParams{

    type:UtilType;
}
export enum UtilType{
    TexturePacker = 0,
    TinyPng,
}
interface Processor{
     process(files:rf.FileDict,params:ImgUtilParams):Promise<rf.RemoteFileResInfo>;
}
export class ImgUtilServer{
    private server:rf.RemoteFileServer;
    private processor:Processor[];
    constructor(port:number,uploadFolder:string = "upload/"){
        this.server = new rf.RemoteFileServer(port,this.process.bind(this),{uploadFolder});

        this.processor = [];
    }

    registerType(type:UtilType,processor:Processor){
        this.processor[type] = processor;
    }

    private async process(files:rf.FileDict,params:ImgUtilParams):Promise<rf.RemoteFileResInfo>{
        if(!this.processor[params.type]){
            throw `need init type ${params.type}`;
        }
        return await this.processor[params.type].process(files,params);
    }

    close(){
        this.server.close();
    }
}
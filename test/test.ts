

import { expect } from "chai";

import {ImgUtilClient} from "../src/ImgUtilClient";
import {ImgUtilServer,  UtilType } from "../src/ImgUtilServer";
import {TinyPng} from "../src/processor/TinyPng";
const PORT = 9999;
describe("测试",()=>{

    it("测试tinypng",()=>{

        let server = new ImgUtilServer(PORT);
        let tinypng = new TinyPng(["Ax7hsXHJj2TYy2mN82rVozNUSfMcuEJX","76D9LDLthfBGZbn92NDrFQ885f4Rsh9k"]);
        server.registerType(UtilType.TinyPng,tinypng);

        setTimeout(async ()=>{
            let client = new ImgUtilClient(`http://127.0.0.1:${PORT}`);
            let info = await client.tinypng("./test/test.png");
            expect(info.err).equal("");

            server.close();
        },1000);
    });

    
});
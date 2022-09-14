import "dotenv/config";
import { BoxRepository } from "./src/repositories/box.repository";
import * as back4app from "./src/config/back4app";
import axios from "axios";
import { ToyoRepository } from "./src/repositories/toyo.repository";
import { Metadata } from "./src/models/toyo/metadata";
import { tokenIdWithObservation, generateFiles } from "./src/utils/index";
import { OnchainRepository } from "./src/repositories/onchain";
import { TokenOwnerEntities } from "./src/models/onchain/tokenOwnerEntities";
import * as fs from 'fs';

back4app.config();

const boxRepository = new BoxRepository();
const toyoRepository = new ToyoRepository();
const onchainRepository = new OnchainRepository

const main = async () =>{
    let boxes = await boxRepository.findOpenBoxesWithObservation();
    const msgList:string[] = [];
    for (const item of boxes){
        const tokenId = tokenIdWithObservation(item.observation);
        const toyo = await toyoRepository.findByTokenId(tokenId);
        const onChain:TokenOwnerEntities =await onchainRepository.getTokenSwappedEntitiesByWalletAndTokenId(tokenId);
        const urlData = "https://toyoverse.com/nft_metadata/toyos/"+tokenId+".json";
        const result = await axios.get(urlData)
        .then(async (result)=>{
            if (result.data){
                const metadata: Metadata = result.data;
                if (toyo && toyo.name !== metadata.name){
                    toyoRepository.updateToyo(toyo, metadata)//TO DO
                }
                console.log(result.statusText);
                console.log(metadata.name);
            }else if(toyo){
                msgList.push("TokenId: "+tokenId+" metadata undefined, but found in the db");
            }else if(onChain){
                msgList.push("TokenId: "+tokenId+" metadata undefined, but found in the onChain");
            }else{
                msgList.push("TokenId: "+tokenId+" metadata undefined");
            }
        })
        .catch(async (err)=>{
            if (toyo){
                console.log(err.response.status);
                console.log(err.response.statusText);
                msgList.push("TokenId: "+tokenId+ " Not found metadata, but found in the db");
            }else if(onChain) {
                msgList.push("TokenId: "+tokenId+ " Not found metadata, but found in the onChain")
            } else {
                msgList.push("TokenId: "+tokenId+ " Not found metadata")
            }
        });
        
    }
    generateFiles(msgList);
};
main();
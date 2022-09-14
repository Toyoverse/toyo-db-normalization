import * as Parse from "parse/node";
import { Metadata } from "src/models/toyo/metadata";
import { Toyo, ToyoPersona } from "../models/toyo";
import { ToyoPart } from "../models/toyo/part";

export class ToyoRepository{
    ParseCls = Parse.Object.extend("Toyo", Toyo);

    async findByTokenId(tokenId: string): Promise<Toyo>{
        const toyoQuery = new Parse.Query(this.ParseCls);
        toyoQuery.equalTo("tokenId", tokenId);

        const result = await toyoQuery.include('parts').first();

        if(result) return this.toModel(result);
        return undefined;
    }
    
    async updateToyo(toyo:Toyo, metadata: Metadata){
        const toyoQuery = new Parse.Query(this.ParseCls);
        toyoQuery.equalTo("tokenId", toyo.tokenId);
        
        const result = await toyoQuery.include('parts').first();

        const Persona = Parse.Object.extend('ToyoPersona', ToyoPersona);
        const personaQuery = new Parse.Query(Persona);
        personaQuery.equalTo("name", metadata.name);

        const resultPersona = await personaQuery.first();

        result.set('name', metadata.name);
        result.set('toyoPersonaOrigin', resultPersona);
        await this.partUpdatePersona(result.get('parts'), resultPersona);
        console.log(toyo.tokenId + " updated");
    }
    private async partUpdatePersona(parts: Parse.Object<Parse.Attributes>[], persona: Parse.Object<Parse.Attributes>){
        for(const part of parts){
            part.set('toyoPersona', persona);
            await part.save();
        }
    }
    toModel(parseObject: Parse.Object<Parse.Attributes>):Toyo{
        return new Toyo({
            name: parseObject.get("name"),
            toyoPersonaOrigin: parseObject.get("toyoPersonaOrigin"),
            transactionHash: parseObject.get("transactionHash"),
            tokenId: parseObject.get("tokenId"),
            typeId: parseObject.get("typeId"),
            isToyoSelected: parseObject.get("isToyoSelected"),
            hasTenParts: parseObject.get("hasTenParts"),
            toyoMetadata: parseObject.get("toyoMetadata")
        });
    }
}
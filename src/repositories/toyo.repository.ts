import * as Parse from "parse/node";
import { Metadata } from "../models/toyo/metadata";
import { Toyo, ToyoPersona } from "../models/toyo";
import { ToyoPart } from "../models/toyo/part";
import { TokenOwnerEntities } from "../models/onchain/tokenOwnerEntities";
import { BuildParts } from "../metadata/build.parts";

const buildParts = new BuildParts();

export class ToyoRepository{
    ParseCls = Parse.Object.extend("Toyo", Toyo);

    async findByTokenId(tokenId: string): Promise<Toyo>{
        const toyoQuery = new Parse.Query(this.ParseCls);
        toyoQuery.equalTo("tokenId", tokenId);

        const result = await toyoQuery.include('parts').first();

        if(result) return await this.toModel(result);
        return undefined;
    }
    async findById(id:string):Promise<Toyo>{
        const toyoQuery = new Parse.Query(this.ParseCls);
        toyoQuery.equalTo("objectId", id);

        const result = await toyoQuery.include('parts').first();

        if (result) return await this.toModel(result);
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
        //Lembrar de descomentar esses dois comentários
        //await this.partUpdatePersona(result.get('parts'), resultPersona);
        //await result.save();
        console.log(toyo.tokenId + " updated");
    }
    private async partUpdatePersona(parts: Parse.Object<Parse.Attributes>[], persona: Parse.Object<Parse.Attributes>){
        for(const part of parts){
            part.set('toyoPersona', persona);
            await part.save();
        }
    }
    async toModel(parseObject: Parse.Object<Parse.Attributes>):Promise<Toyo>{
        return new Toyo({
            name: parseObject.get("name"),
            toyoPersonaOrigin: parseObject.get("toyoPersonaOrigin"),
            transactionHash: parseObject.get("transactionHash"),
            tokenId: parseObject.get("tokenId"),
            typeId: parseObject.get("typeId"),
            isToyoSelected: parseObject.get("isToyoSelected"),
            hasTenParts: parseObject.get("hasTenParts"),
            toyoMetadata: parseObject.get("toyoMetadata"),
            parts: await this.partsToyo(parseObject.get("parts"))
        });
    }
    async findPartsById(id:string):Promise<ToyoPart>{
        const Part = Parse.Object.extend("ToyoParts", ToyoPart);
        const partQuery = new Parse.Query(Part);
        partQuery.equalTo("objectId", id);

        const result = await partQuery.first();
        return this.toModelPart(result);
    }
    async save(metadata: Metadata, onChain:TokenOwnerEntities) {
        const ParseToyo = Parse.Object.extend("Toyo", Toyo);

        let parseToyo: Parse.Object<Parse.Attributes> = new ParseToyo();
        parseToyo = this.toyoMapper(parseToyo,metadata,onChain);

        const parserPersona = await this.setPersona(metadata.name);
        parseToyo.set("toyoPersonaOrigin", parserPersona);
        const {parts, toyoLevel} = buildParts.buildParts(parserPersona);
        parseToyo.set("level", toyoLevel);
        const partDB = await this.saveParts(parts, parserPersona);
        
        const partsRelation = parseToyo.relation('parts');
        partsRelation.add(partDB);
        
        console.log("salvando o toyo... " + metadata.name);
        await parseToyo.save();
    }
    private async setPersona(name:string):Promise<Parse.Object<Parse.Attributes>>{
        const Persona = Parse.Object.extend("ToyoPersona", ToyoPersona);
        const personaQuery = new Parse.Query(Persona);
        personaQuery.equalTo("name", name);
        return await personaQuery.first();
    }
    private async saveParts(parts: ToyoPart[], parserPersona:Parse.Object<Parse.Attributes>):Promise<Parse.Object<Parse.Attributes>[]>{
        const ToyoParts = Parse.Object.extend("ToyoParts",ToyoPart);
        const partsDB: Parse.Object<Parse.Attributes>[]= []

        for (const part of parts){
            let toyoParts: Parse.Object<Parse.Attributes> = new ToyoParts();
            part.toyoPersona = parserPersona;
            await toyoParts.save(part);
            partsDB.push(toyoParts);
        }
        return partsDB;
    }
    private toyoMapper(toyo: Parse.Object<Parse.Attributes>, metadata:Metadata, onChain: TokenOwnerEntities):Parse.Object<Parse.Attributes>{
        toyo.set("toyoMetadata", metadata);
        toyo.set("name", metadata.name);
        toyo.set("transactionHash", onChain.transactionHash);
        toyo.set("tokenId", onChain.tokenId);
        toyo.set("typeId", onChain.tokenId);
        toyo.set("isToyoSelected", false);
        toyo.set("hasTenParts", true);

        return toyo;
    }
    private async partsToyo(parseObject: Parse.Object<Parse.Attributes>[]):Promise<ToyoPart[]>{
        const parts:ToyoPart[]=[];

        for(const item of parseObject){
            parts.push(await this.findPartsById(item.id));
        }
        return parts;
    }
    toModelPart(parseObject: Parse.Object<Parse.Attributes>):ToyoPart{
        return new ToyoPart({
            objectId: parseObject.id ? parseObject.id : undefined,
            toyoTechnoalloy: parseObject.get("toyoTechnoalloy"),
            toyoPersona: parseObject.get("toyoPersona"),
            toyoPiece: parseObject.get("toyoPiece"),
            stats: parseObject.get("stats"),
            level: parseObject.get("level"),
            rarity: parseObject.get("rarity"),
            rarityId: parseObject.get("rarityId"),
            isNFT: parseObject.get("isNFT")
        });
    }
}
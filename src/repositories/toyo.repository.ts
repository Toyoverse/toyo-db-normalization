import * as Parse from "parse/node";
import { ToyoMetadata } from "../models/toyo/metadata";
import { Toyo, ToyoPersona } from "../models/toyo";
import { ToyoPart } from "../models/toyo/part";
import { TokenOwnerEntities } from "../models/onchain/tokenOwnerEntities";
import { BuildParts, Metadata } from "../metadata/";
import { MetadataRepository } from "./";

const buildParts = new BuildParts();
const metadataClass = new Metadata();
const metadataRepository = new MetadataRepository();

export class ToyoRepository {
  ParseCls = Parse.Object.extend("Toyo", Toyo);

  async findByTokenId(tokenId: string): Promise<Toyo> {
    const toyoQuery = new Parse.Query(this.ParseCls);
    toyoQuery.equalTo("tokenId", tokenId);

    const result = await toyoQuery
      .include("parts")
      .include("toyoPersonaOrigin")
      .first();
    const resultPart = await result.relation("parts").query().find();

    if (result) return await this.toModel(result, resultPart);
    return undefined;
  }
  async findById(id: string): Promise<Toyo> {
    const toyoQuery = new Parse.Query(this.ParseCls);
    toyoQuery.equalTo("objectId", id);

    const result = await toyoQuery.include("parts").first();

    if (result) return await this.toModel(result);
    return undefined;
  }

  async updateToyo(toyo: Toyo, metadata: ToyoMetadata) {
    const toyoQuery = new Parse.Query(this.ParseCls);
    toyoQuery.equalTo("tokenId", toyo.tokenId);

    const result = await toyoQuery.include("parts").first();

    const Persona = Parse.Object.extend("ToyoPersona", ToyoPersona);
    const personaQuery = new Parse.Query(Persona);
    personaQuery.equalTo("name", metadata.name);

    const resultPersona = await personaQuery.first();

    result.set("name", metadata.name);
    result.set("toyoPersonaOrigin", resultPersona);
    const { parts, toyoLevel } = await this.partUpdatePersonaAndPArts(
      result.get("parts"),
      resultPersona
    );
    if (toyoLevel) {
      result.set("level", toyoLevel);
      result.set("oldToyoMetadata", metadata);
      result.set(
        "toyoMetadata",
        metadataClass.generateMetadata(resultPersona, parts, toyoLevel)
      );
      await metadataRepository.save(toyo.tokenId, toyo.toyoMetadata);
    }

    await result.save();
  }
  private async partUpdatePersonaAndPArts(
    partsParse: Parse.Object<Parse.Attributes>[],
    persona: Parse.Object<Parse.Attributes>
  ) {
    try {
      if (partsParse[0].get("rarity") !== persona.get("rarity")) {
        const { parts, toyoLevel } = buildParts.buildParts(persona);
        await this.updateParts(parts, partsParse);
        return { parts, toyoLevel };
      } else {
        for (const part of partsParse) {
          const ToyoParts = Parse.Object.extend("ToyoParts", ToyoPart);
          const toyoPartsQuery = new Parse.Query(ToyoParts);

          toyoPartsQuery.equalTo("objectId", part.id);
          const resultQuery = await toyoPartsQuery.first();

          resultQuery.set("toyoPersona", persona);
          await resultQuery.save();
        }
        return undefined;
      }
    } catch {
      throw new Error("Error saving parts");
    }
  }
  async toModel(
    parseObject: Parse.Object<Parse.Attributes>,
    parseParts?: Parse.Object<Parse.Attributes>[]
  ): Promise<Toyo> {
    return new Toyo({
      name: parseObject.get("name"),
      toyoPersonaOrigin: parseObject.get("toyoPersonaOrigin"),
      transactionHash: parseObject.get("transactionHash"),
      tokenId: parseObject.get("tokenId"),
      typeId: parseObject.get("typeId"),
      isToyoSelected: parseObject.get("isToyoSelected"),
      hasTenParts: parseObject.get("hasTenParts"),
      toyoMetadata: parseObject.get("toyoMetadata"),
      level: parseObject.get("level"),
      parts: parseParts ? await this.partsToyo(parseParts) : undefined,
    });
  }
  async findPartsById(id: string): Promise<ToyoPart> {
    const Part = Parse.Object.extend("ToyoParts", ToyoPart);
    const partQuery = new Parse.Query(Part);
    partQuery.equalTo("objectId", id);

    const result = await partQuery.first();
    return this.toModelPart(result);
  }
  async save(metadata: ToyoMetadata, onChain: TokenOwnerEntities) {
    const ParseToyo = Parse.Object.extend("Toyo", Toyo);

    let parseToyo: Parse.Object<Parse.Attributes> = new ParseToyo();
    parseToyo = this.toyoMapper(parseToyo, metadata, onChain);

    const parserPersona = await this.setPersona(metadata.name);
    parseToyo.set("toyoPersonaOrigin", parserPersona);
    const { parts, toyoLevel } = buildParts.buildParts(parserPersona);
    parseToyo.set("level", toyoLevel);
    parseToyo.set(
      "toyoMetadata",
      metadataClass.generateMetadata(parserPersona, parts, toyoLevel)
    );
    await metadataRepository.save(
      onChain.tokenId,
      parseToyo.get("toyoMetadata")
    );
    const partDB = await this.saveParts(parts, parserPersona);

    const partsRelation = parseToyo.relation("parts");
    partsRelation.add(partDB);

    console.log("salvando o toyo... " + metadata.name);
    await parseToyo.save();
  }
  async saveToyoMetadata(toyo: Toyo, oldToyoMetadata:object , toyoMetadata: object ) {
    try {
      const toyoQuery = new Parse.Query(this.ParseCls);
      toyoQuery.equalTo("tokenId", toyo.tokenId);

      const result = await toyoQuery.first();

      result.set("toyoMetadata", toyoMetadata);
      result.set("oldToyoMetadata", oldToyoMetadata);

      await result.save();
    } catch {
      throw new Error("Error saving metadata");
    }
  }
  private async setPersona(
    name: string
  ): Promise<Parse.Object<Parse.Attributes>> {
    const Persona = Parse.Object.extend("ToyoPersona", ToyoPersona);
    const personaQuery = new Parse.Query(Persona);
    personaQuery.equalTo("name", name);
    return await personaQuery.first();
  }
  private async saveParts(
    parts: ToyoPart[],
    parserPersona: Parse.Object<Parse.Attributes>
  ): Promise<Parse.Object<Parse.Attributes>[]> {
    const ToyoParts = Parse.Object.extend("ToyoParts", ToyoPart);
    const partsDB: Parse.Object<Parse.Attributes>[] = [];

    for (const part of parts) {
      let toyoParts: Parse.Object<Parse.Attributes> = new ToyoParts();
      part.toyoPersona = parserPersona;
      await toyoParts.save(part);
      partsDB.push(toyoParts);
    }
    return partsDB;
  }
  private async updateParts(
    parts: ToyoPart[],
    partsParser: Parse.Object<Parse.Attributes>[]
  ) {
    const ToyoParts = Parse.Object.extend("ToyoParts", ToyoPart);
    const toyoPartsQuery = new Parse.Query(ToyoParts);

    for (const partParser of partsParser) {
      try {
        const result = parts.find((part) => {
          return part.toyoPiece === partParser.get("toyoPiece");
        });
        toyoPartsQuery.equalTo("objectId", partParser.id);
        const resultQuery = await toyoPartsQuery.first();
        if (result) {
          resultQuery.set("level", result.level);
          resultQuery.set("rarityId", result.rarityId);
          resultQuery.set("rarity", result.rarity);
          resultQuery.set("stats", result.stats);
          await resultQuery.save();
        }
      } catch {
        throw new Error("Error saving");
      }
    }
  }
  private toyoMapper(
    toyo: Parse.Object<Parse.Attributes>,
    metadata: ToyoMetadata,
    onChain: TokenOwnerEntities
  ): Parse.Object<Parse.Attributes> {
    toyo.set("oldToyoMetadata", metadata);
    toyo.set("name", metadata.name);
    toyo.set("transactionHash", onChain.transactionHash);
    toyo.set("tokenId", onChain.tokenId);
    toyo.set("typeId", onChain.tokenId);
    toyo.set("isToyoSelected", false);
    toyo.set("hasTenParts", true);

    return toyo;
  }
  private async partsToyo(
    parseObject: Parse.Object<Parse.Attributes>[]
  ): Promise<ToyoPart[]> {
    const parts: ToyoPart[] = [];
    if (parseObject && parseObject.length > 0) {
      for (const item of parseObject) {
        parts.push(await this.findPartsById(item.id));
      }
    }
    return parts;
  }
  toModelPart(parseObject: Parse.Object<Parse.Attributes>): ToyoPart {
    return new ToyoPart({
      objectId: parseObject.id ? parseObject.id : undefined,
      toyoTechnoalloy: parseObject.get("toyoTechnoalloy"),
      toyoPersona: parseObject.get("toyoPersona"),
      toyoPiece: parseObject.get("toyoPiece"),
      stats: parseObject.get("stats"),
      level: parseObject.get("level"),
      rarity: parseObject.get("rarity"),
      rarityId: parseObject.get("rarityId"),
      isNFT: parseObject.get("isNFT"),
    });
  }
}

import * as Parse from "parse/node";
import Box from "../models/box/box";
import { ToyoRepository } from "../repositories/toyo.repository";

const toyoRepository = new ToyoRepository();

export class BoxRepository {
  ParseCls = Parse.Object.extend("Boxes", Box);

  async findOpenBoxesWithObservation(walletAddress?: string): Promise<Box[]> {
    const boxesQuery = new Parse.Query(this.ParseCls);
    boxesQuery.equalTo("isOpen", true);
    boxesQuery.doesNotExist("toyoHash");
    boxesQuery.startsWith("observation", "Toyo with");
    boxesQuery.doesNotExist("toyo");

    const result = await boxesQuery.findAll();

    const box: Box[] = [];
    for (const item of result) {
      box.push(await this.toModel(item));
    }
    return box;
  }
  async findBoxesWithOldToyo(): Promise<Box[]> {
    const boxesQuery = new Parse.Query(this.ParseCls);
    boxesQuery.equalTo("isOpen", true);
    boxesQuery.doesNotExist("toyoHash");
    boxesQuery.exists("toyo");

    const result = await boxesQuery.include("toyo").findAll();
    const box: Box[] = [];
    for (const item of result) {
      box.push(await this.toModel(item));
    }
    return box;
  }
  async findTokenId(tokenId: string): Promise<Box> {
    const boxesQuery = new Parse.Query(this.ParseCls);
    boxesQuery.equalTo("tokenId", tokenId);

    const result = await boxesQuery.include("toyo").include("parts").first();

    return await this.toModel(result);
  }
  async updateMetadataBox(box: Box, msg: string, notUpdateMetadata?: boolean) {
    try {
      const boxesQuery = new Parse.Query(this.ParseCls);
      boxesQuery.equalTo("tokenId", box.tokenId);
      const oldMsg = box.observation;
      const result = await boxesQuery.first();
      result.set(
        "updateMetadata",
        notUpdateMetadata ? notUpdateMetadata : true
      );
      result.set("observation", oldMsg.concat(msg));
      await result.save();
    } catch {
      throw new Error("Erro updating box with metadata");
    }
  }
  async toModel(parseObject: Parse.Object<Parse.Attributes>): Promise<Box> {
    return new Box({
      id: parseObject.id,
      toyoHash: parseObject.get("toyoHash"),
      typeId: parseObject.get("typeId"),
      tokenId: parseObject.get("tokenId"),
      isOpen: parseObject.get("isOpen"),
      observation: parseObject.get("observation"),
      toyo: parseObject.get("toyo")
        ? await toyoRepository.findById(parseObject.get("toyo").id)
        : undefined,
    });
  }
}

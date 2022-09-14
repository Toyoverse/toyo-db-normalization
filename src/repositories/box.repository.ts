import * as Parse from "parse/node";
import Box from "../models/box/box";

export class BoxRepository{
    ParseCls = Parse.Object.extend("Boxes", Box);

    async findOpenBoxesWithObservation(walletAddress?: string): Promise<Box[]> {
        const boxesQuery = new Parse.Query(this.ParseCls);
        boxesQuery.equalTo("isOpen", true);
        boxesQuery.doesNotExist("toyoHash");
        boxesQuery.startsWith("observation","Toyo with");
        

        const result = await boxesQuery.findAll();
        return result.map((item) => {
            return this.toModel(item);
        });
    }
    async findBoxesWithOldToyo(){
        const boxesQuery = new Parse.Query(this.ParseCls);
        boxesQuery.equalTo("isOpen", true);
        boxesQuery.doesNotExist("toyoHash");
        boxesQuery.exists("toyo");

        const result = await boxesQuery.findAll();
        return result.map((item) =>{
            return this.toModel(item);
        });

    }
    toModel(parseObject: Parse.Object<Parse.Attributes>): Box {
        return new Box({
            id: parseObject.id,
            toyoHash: parseObject.get("toyoHash"),
            typeId: parseObject.get("typeId"),
            tokenId: parseObject.get("tokenId"),
            isOpen: parseObject.get("isOpen"),
            observation: parseObject.get("observation"),
        });
    }

}
import { Toyo } from "../toyo";
import { TypeId } from "./types";

export default class Box {
  id?: string;
  toyoHash: string;
  tokenId?: string;
  typeId: TypeId;
  isOpen: boolean;
  tokenIdClosedBox?: string;
  tokenIdOpenBox?: string;
  observation?:string;
  toyo?:Toyo;

  constructor(attrs: {
    id?: string;
    toyoHash: string;
    tokenId?: string;
    typeId: TypeId;
    isOpen: boolean;
    tokenIdClosedBox?: string;
    tokenIdOpenBox?: string;
    observation?: string;
    toyo?:Toyo;
  }) {
    this.id = attrs.id;
    this.toyoHash = attrs.toyoHash;
    this.tokenId = attrs.tokenId;
    this.typeId = attrs.typeId;
    this.isOpen = attrs.isOpen;
    this.tokenIdClosedBox = attrs.tokenIdClosedBox;
    this.tokenIdOpenBox = attrs.tokenIdOpenBox;
    this.observation = attrs.observation;
    this.toyo = attrs.toyo;
  }
}

import { BoxType } from "./types";

export default class Box {
  id?: string;
  toyoHash: string;
  tokenId?: string;
  typeId: BoxType;
  isOpen: boolean;
  tokenIdClosedBox?: string;
  tokenIdOpenBox?: string;

  constructor(attrs: {
    id?: string;
    toyoHash: string;
    tokenId?: string;
    typeId: BoxType;
    isOpen: boolean;
    tokenIdClosedBox?: string;
    tokenIdOpenBox?: string;
  }) {
    this.id = attrs.id;
    this.toyoHash = attrs.toyoHash;
    this.tokenId = attrs.tokenId;
    this.typeId = attrs.typeId;
    this.isOpen = attrs.isOpen;
    this.tokenIdClosedBox = attrs.tokenIdClosedBox;
    this.tokenIdOpenBox = attrs.tokenIdOpenBox;
  }
}

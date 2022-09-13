import { ToyoPart } from "./part";
import { ToyoPersona } from "./persona";

export class Toyo {
    objectId?: string;
    name: string;
    toyoPersonaOrigin: ToyoPersona;
    parts?: ToyoPart[];
    transactionHash?: string;
    tokenId?: string;
    typeId: string;
    isToyoSelected: boolean;
    hasTenParts: boolean;
    toyoMetadata?: any;
    createdAt?: Date;
    updatedAt?: Date;
    level?: number;

    constructor(attrs: {
        name: string;
        toyoPersonaOrigin: ToyoPersona;
        parts?: ToyoPart[];
        transactionHash?: string;
        tokenId?: string;
        typeId: string;
        isToyoSelected: boolean;
        hasTenParts: boolean;
        toyoMetadata?: any;
        createdAt?: Date;
        updatedAt?: Date;
        level?: number;
    }) {
        this.toyoPersonaOrigin = attrs.toyoPersonaOrigin;
        this.name = attrs.name;
        this.parts = attrs.parts;
        this.transactionHash = attrs.transactionHash;
        this.typeId = attrs.typeId;
        this.isToyoSelected = attrs.isToyoSelected;
        this.tokenId = attrs.tokenId;
        this.hasTenParts = attrs.hasTenParts;
        this.toyoMetadata = attrs.toyoMetadata;
        this.createdAt = attrs.createdAt;
        this.updatedAt = attrs.updatedAt;
        this.level = attrs.level;
    }
}

import { ToyoPersona } from "./persona";
import { ToyoPiece } from "./piece";

export class ToyoPart {
    objectId?: string;
    bonusStats?: Object;
    toyoTechnoalloy: string;
    cards?: any[];
    createdAt?: Date;
    updatedAt?: Date;
    toyoPersona: ToyoPersona;
    toyoPiece: ToyoPiece;
    level?: number;
    stats?: Object;
    rarity?: string;
    rarityId?: string;
    isNFT?: boolean;

    constructor(attrs: {
        objectId?: string;
        bonusStats?: Object;
        toyoTechnoalloy: string;
        cards?: any[];
        createdAt?: Date;
        updatedAt?: Date;
        toyoPersona: ToyoPersona;
        toyoPiece: ToyoPiece;
        stats?: Object;
        level?: number;
        rarity?: string;
        rarityId?: string;
        isNFT?: boolean;
    }) {
        this.objectId = attrs.objectId;
        this.bonusStats = attrs.bonusStats;
        this.toyoTechnoalloy = attrs.toyoTechnoalloy;
        this.cards = attrs.cards;
        this.createdAt = attrs.createdAt;
        this.updatedAt = attrs.updatedAt;
        this.toyoPersona = attrs.toyoPersona;
        this.toyoPiece = attrs.toyoPiece;
        this.stats = attrs.stats;
        this.level = attrs.level;
        this.rarity = attrs.rarity;
        this.rarityId = attrs.rarityId;
        this.isNFT = attrs.isNFT;
    }
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitCardCategories = exports.Deck = void 0;
const warno_db_1 = require("@izohek/warno-db");
/// A Warno deck
class Deck {
    constructor() {
        this.country = '';
        this.numberCards = 0;
        this.cards = [];
    }
    /**
     * Order all of the cards by type, i.e. logistics, infantry, etc.
     *
     * @returns OrderedUnitCardSet
     */
    categorized() {
        const set = {
            log: [],
            inf: [],
            art: [],
            tnk: [],
            aa: [],
            rec: [],
            hel: [],
            air: []
        };
        const categories = [];
        this.cards.forEach(element => {
            if (element.category != null && categories.includes(element.category)) {
                set[element.category].push(element);
            }
        });
        return set;
    }
    /**
     * Add unit card to deck by id
     *
     * @param id
     * @returns UnitCard or null if id not found
     */
    addUnitWithId(id, veterancy, transport = null) {
        var _a;
        const unitCard = (0, warno_db_1.findUnitCard)(id);
        if (unitCard == null) {
            return null;
        }
        unitCard.veterancy = Math.min(Math.max(veterancy, 0), 3);
        if (transport != null) {
            unitCard.transport = (_a = (0, warno_db_1.findUnitCard)(transport)) !== null && _a !== void 0 ? _a : undefined;
        }
        this.cards.push(unitCard);
        this.numberCards = this.cards.length;
        return unitCard;
    }
}
exports.Deck = Deck;
const UnitCardCategories = {
    log: 'Logistics',
    inf: 'Infantry',
    art: 'Artillery',
    tank: 'Tank',
    aa: 'Anti-air',
    rec: 'Recon',
    hel: 'Helicopter',
    air: 'Air'
};
exports.UnitCardCategories = UnitCardCategories;
exports.default = Deck;

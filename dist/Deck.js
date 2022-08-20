"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitCardCategories = exports.Deck = void 0;
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

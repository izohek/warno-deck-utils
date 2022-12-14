import { Division, UnitCard } from '@izohek/warno-db';
declare class Deck {
    division?: Division;
    country: string;
    numberCards: number;
    cards: UnitCard[];
    /**
     * Order all of the cards by type, i.e. logistics, infantry, etc.
     *
     * @returns OrderedUnitCardSet
     */
    categorized(): OrderedUnitCardSet;
}
interface OrderedUnitCardSet {
    log: UnitCard[];
    inf: UnitCard[];
    art: UnitCard[];
    tnk: UnitCard[];
    aa: UnitCard[];
    rec: UnitCard[];
    hel: UnitCard[];
    air: UnitCard[];
}
declare const UnitCardCategories: {
    log: string;
    inf: string;
    art: string;
    tank: string;
    aa: string;
    rec: string;
    hel: string;
    air: string;
};
export default Deck;
export { Deck, OrderedUnitCardSet, UnitCardCategories };

import { Division, UnitCard } from "@izohek/warno-db";

/// A Warno deck
class Deck {
    public division?: Division;
    public country: string = "";
    public numberCards: number = 0;
    public cards: UnitCard[] = [];

    /**
     * Order all of the cards by type, i.e. logistics, infantry, etc.
     * 
     * @returns OrderedUnitCardSet
     */
    public categorized(): OrderedUnitCardSet {
        var set = <OrderedUnitCardSet>{};
        var categories: string[] = [];
        Object.keys(UnitCardCategories).forEach(element => {
            set[(element as keyof typeof set)] = [];
            categories.push(element);
        });

        this.cards.forEach(element => {
            if (element.category && categories.includes(element.category)) {
                set[(element.category as keyof typeof set)].push(element);
            }
        });
        
        return set;
    }
}

interface OrderedUnitCardSet {
    log: UnitCard[],
    inf: UnitCard[],
    art: UnitCard[],
    tnk: UnitCard[],
    aa:  UnitCard[],
    rec: UnitCard[],
    hel: UnitCard[],
    air: UnitCard[]
}

const UnitCardCategories = {
    'log': 'Logistics',
    'inf': 'Infantry',
    'art': 'Artillery',
    'tank': 'Tank',
    'aa' : 'Anti-air',
    'rec': 'Recon',
    'hel': 'Helicopter' ,
    'air': 'Air'
};

export default Deck;
export {Deck, OrderedUnitCardSet, UnitCardCategories};

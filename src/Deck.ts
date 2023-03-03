import { Division, UnitCard, findUnitCard } from '@izohek/warno-db'

/// A Warno deck
class Deck {
    public division?: Division
    public country: string = ''
    public numberCards: number = 0
    public cards: UnitCard[] = []
    public modded: boolean = false

    /**
     * Order all of the cards by type, i.e. logistics, infantry, etc.
     *
     * @returns OrderedUnitCardSet
     */
    public categorized (): OrderedUnitCardSet {
        const set: OrderedUnitCardSet = {
            log: [],
            inf: [],
            art: [],
            tnk: [],
            aa: [],
            rec: [],
            hel: [],
            air: []
        }

        const categories: string[] = []

        this.cards.forEach(element => {
            if (element.category != null && categories.includes(element.category)) {
                set[(element.category as keyof typeof set)].push(element)
            }
        })

        return set
    }

    /**
     * Add unit card to deck by id
     *
     * @param id
     * @returns UnitCard or null if id not found
     */
    public addUnitWithId (id: string | number, veterancy: number, transport: string | number | null = null): UnitCard | null {
        const unitCard = findUnitCard(id)

        if (unitCard == null) {
            return null
        }

        unitCard.veterancy = Math.min(Math.max(veterancy, 0), 3)

        if (transport != null) {
            unitCard.transport = findUnitCard(transport) ?? undefined
        }

        this.cards.push(unitCard)

        this.numberCards = this.cards.length

        return unitCard
    }
}

interface OrderedUnitCardSet {
    log: UnitCard[]
    inf: UnitCard[]
    art: UnitCard[]
    tnk: UnitCard[]
    aa: UnitCard[]
    rec: UnitCard[]
    hel: UnitCard[]
    air: UnitCard[]
}

const UnitCardCategories = {
    log: 'Logistics',
    inf: 'Infantry',
    art: 'Artillery',
    tank: 'Tank',
    aa: 'Anti-air',
    rec: 'Recon',
    hel: 'Helicopter',
    air: 'Air'
}

export default Deck
export { Deck, OrderedUnitCardSet, UnitCardCategories }

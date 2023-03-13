import { LookupService } from './types/Parser'

interface Division {
    name: string
    country: string
    alliance: string
    id: number
    descriptor: string
    tags?: string[]
}

interface UnitCard {
    id: number
    veterancy: number
    transport?: UnitCard
    category?: string
    descriptor?: string
}

/// A Warno deck
class Deck {
    public division?: Division
    public country: string = ''
    public numberCards: number = 0
    public cards: UnitCard[] = []
    public modded: boolean = false

    constructor (
        private readonly lookupAdapter: LookupService
    ) { }

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
    public addUnitWithId (id: number, veterancy: number, transport: number | null = null): UnitCard | null {
        const unitCard: UnitCard = {
            id,
            veterancy,
            transport: transport !== null
                ? {
                    id: transport,
                    veterancy
                }
                : undefined,
            descriptor: this.lookupAdapter.unitForId(id)
        }

        if (unitCard.descriptor == null) {
            return null
        }

        unitCard.veterancy = Math.min(Math.max(veterancy, 0), 3)

        if (transport != null) {
            const foundTransportDescriptor = this.lookupAdapter.unitForId(transport)
            unitCard.transport = foundTransportDescriptor !== undefined
                ? {
                    id: transport,
                    veterancy,
                    descriptor: foundTransportDescriptor
                }
                : undefined
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

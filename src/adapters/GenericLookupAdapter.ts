import { LookupService } from '../types/Parser'

/// Basic interface to define unit and division ids with descriptors
export interface GenericLookupAdapterObject {
    id: number
    descriptor: string
}

/**
 * Generic adapter to for deck coding
 */
export class GenericLookupAdapter implements LookupService {
    constructor (
        public units: GenericLookupAdapterObject[],
        public divisions: GenericLookupAdapterObject[]
    ) {}

    /**
     * LookupService interface method
     *
     * @returns largest unit id in database
     */
    public largestUnitId (): number {
        return this.units.reduce(
            (accumulator, currentValue) => Math.max(currentValue.id, accumulator),
            0
        )
    }

    /**
     * Lookup a unit descriptor by its deck parsing id
     *
     * @param id unit id from Decks.ndf
     * @returns unit descriptor or undefined if not found
     */
    public unitForId (id: number): string | undefined {
        return this.units.find(
            u => u.id === id
        )?.descriptor
    }

    /**
     * Lookup a division descriptor by its deck parsing id
     *
     * @param id division id from Decks.ndf
     * @returns division descriptor or undefined if not found
     */
    public divisionForId (id: number): string | undefined {
        return this.divisions.find(
            d => d.id === id
        )?.descriptor
    }
}

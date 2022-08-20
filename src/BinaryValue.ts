import { DECK_FIELD_LENGTH_BITS } from './Constants'

/**
 * Binary value in either string or number format.
 */
export default class BinaryValue {
    value?: number

    constructor (value: string | number | null) {
        if (typeof value === 'string') {
            this.value = parseInt(value, 2)
        } else if (typeof value === 'number') {
            this.value = value
        }
    }

    /**
     * Get the binary represenation as a string with a specific amount of padding.
     *
     * @param pad number of 0s to left-pad
     * @returns
     */
    public string (pad = DECK_FIELD_LENGTH_BITS): string {
        return this.value?.toString(2).padStart(pad, '0') ?? ''
    }

    /**
     * Get the integer represenation of the data.
     *
     * @returns
     */
    public integerString (): number | null {
        if (this.value === null) {
            return parseInt(this.string(), 2)
        } else {
            return null
        }
    }
}

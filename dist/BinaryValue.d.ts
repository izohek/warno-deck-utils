/**
 * Binary value in either string or number format.
 */
export default class BinaryValue {
    value?: number;
    constructor(value: string | number | null);
    /**
     * Get the binary represenation as a string with a specific amount of padding.
     *
     * @param pad number of 0s to left-pad
     * @returns
     */
    string(pad?: number): string;
    /**
     * Get the integer represenation of the data.
     *
     * @returns
     */
    integerString(): number | null;
}

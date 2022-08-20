import BinaryValue from './BinaryValue';
/**
 * Parse a Warno deck string
 *
 * @param deckString
 * @returns DeckParserResults
 */
declare function parseDeckString(deckString: string): DeckParserResults;
/**
 * Results from DeckParser.parse()
 */
declare class DeckParserResults {
    deckString: string;
    decodedString: string;
    steps: DeckField[];
    units: DeckFieldUnit[];
    error: Error | null;
    leftovers: DeckField[];
}
interface ParserPosition {
    start: number;
    end: number;
}
declare type DeckFieldDataType = number | string | null;
/**
 * Represents an encoded piece of data in the deck string.  A deck string is made up
 * of an array of fields that concatenate to build the final string.  A field is defined
 * with the first 5 bits representing the length of the data that follows.
 * [0-5: binary length| 5-length: data]
 */
declare class DeckField {
    length: number;
    data: DeckFieldDataType;
    positions: ParserPosition;
    lengthBinary: BinaryValue;
    dataBinary: BinaryValue;
    constructor(length: number, data: DeckFieldDataType, positions: ParserPosition);
}
/**
 * Warno Unit Card
 */
declare class DeckFieldUnit {
    xp: number;
    id: number;
    transport: number;
    position: ParserPosition;
    constructor(xp: string, id: string, transport: string, position: ParserPosition);
}
export default parseDeckString;
export { parseDeckString, DeckParserResults, DeckField, DeckFieldUnit, BinaryValue };

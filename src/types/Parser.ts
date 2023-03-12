import BinaryValue from "../BinaryValue";

export interface ParserPosition {start: number, end: number}

export type DeckFieldDataType = number | string | null

/**
 * Represents an encoded piece of data in the deck string.  A deck string is made up
 * of an array of fields that concatenate to build the final string.  A field is defined
 * with the first 5 bits representing the length of the data that follows.
 * [0-5: binary length| 5-length: data]
 */
export class DeckField {
    length: number
    data: DeckFieldDataType
    positions: ParserPosition

    lengthBinary: BinaryValue
    dataBinary: BinaryValue

    constructor (length: number, data: DeckFieldDataType, positions: ParserPosition) {
        this.length = length
        this.data = data
        this.positions = positions

        this.lengthBinary = new BinaryValue(this.length)
        this.dataBinary = new BinaryValue(this.data)
    }
}

/**
 * Warno Unit Card
 */
export class DeckFieldUnit {
    xp: number
    id: number
    transport: number
    position: ParserPosition

    constructor (xp: string, id: string, transport: string, position: ParserPosition) {
        this.xp = parseInt(xp, 2)
        this.id = parseInt(id, 2)
        this.transport = parseInt(transport, 2)
        this.position = position
    }
}


/**
 * Results from DeckParser.parse()
 */
export interface DeckParserResults {
    deckString: string
    decodedString: string
    headers: DeckHeaders
    units: DeckFieldUnit[]
}

export interface DeckHeaders {
    eugen: DeckField,
    modded: DeckField,
    division: DeckField,
    numberOfCards: DeckField,
    veterancyFieldSize: DeckField,
    unitIdSize: DeckField
}

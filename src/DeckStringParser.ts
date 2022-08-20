import BinaryValue from "./BinaryValue";
import { DECK_FIELD_LENGTH_BITS } from "./Constants";
import { Buffer } from "node:buffer"

/// * A parser for Warno Deck strings

/**
 * Parse a Warno deck string
 * 
 * @param deckString 
 * @returns DeckParserResults
 */
function parseDeckString(deckString: string): DeckParserResults {
    
    var parserResult = new DeckParserResults();
    parserResult.deckString = deckString;
    
    // Check we have data
    if (!deckString) {
        parserResult.error = new Error("Empty deck string")
        return parserResult;
    }
    
    // Decode base64
    var parsedOutput: string;
    try {
        parsedOutput = atob(deckString);
    } catch (err) {
        parserResult.error = err as Error ?? new Error("Uknown error")
        return parserResult;
    }
    

    const bitstream: string = stringForByteBuffer(parsedOutput);
    parserResult.decodedString = bitstream;
    
    var position: number = 0;

    // Eugen Headers - unknown purpose
    const header1 = parseField(bitstream, position);
    parserResult.steps.push(header1[0]);
    position = header1[1];

    const header2 = parseField(bitstream, position);
    parserResult.steps.push(header2[0]);
    position = header2[1];

    // Division
    const division = parseField(bitstream, position);
    parserResult.steps.push(division[0]);
    position = division[1];

    // Number of cards contained in the deck
    const numCards = parseField(bitstream, position);
    parserResult.steps.push(numCards[0]);
    position = numCards[1];
    
    // Size of the veterancy field for each unit
    const xpSize = parseFixedWidth(bitstream, position);
    parserResult.steps.push(xpSize[0]);
    position = xpSize[1];

    // Size of the unit id field for each unit
    const unitIdSize = parseFixedWidth(bitstream, position);
    parserResult.steps.push(unitIdSize[0]);
    position = unitIdSize[1];

    // Loop for each unit
    // Ignores leftovers for now since if parsed it creates an extra 
    //    incorrect card which shares some IDs with bradleys and such.
    const unitDefTotalLength = xpSize[0].length + unitIdSize[0].length;
    while (position < bitstream.length && position + unitDefTotalLength < bitstream.length) {
        const unit = parseUnitField(bitstream, position, {
            xp: xpSize[0].length,
            unit: unitIdSize[0].length,
        });
        parserResult.units.push(unit);
        position = unit.position.end;
    }

    // TODO: 
    // Left over unused bits.  Parsing is accurate without them, but might be an issue when encoding.
    // All parsed decks end up with an extra card that always has only 1 bit set to on, but a variable position and surrounding 0s.
    // Parses out to some 2^x like 4, 8, 16, 32, 64, 128.
    // Might be some sort of padding used in the encoding.
    // Seems to end in : 000010 with { ending padding of 0s }
    
    return parserResult;
}

/**
 * Parse a field with the expected format:
 * [ {0-5} Length in binary, {5-Length} Data ]
 * 
 * @param buffer string binary represenation string
 * @param position number where to start the field
 * @returns 
 */
function parseField(buffer: string, position: number): [DeckField, number] {
    const lengthDataBoundary = position + DECK_FIELD_LENGTH_BITS;
    const lengthData = buffer.slice(position, lengthDataBoundary);
    const lengthDataInt = parseInt(lengthData, 2);
    const fullFieldBoundary = lengthDataBoundary + lengthDataInt
    const fieldData = buffer.slice(lengthDataBoundary, fullFieldBoundary);

    return [
        new DeckField(lengthDataInt, fieldData, {start: position, end: fullFieldBoundary}), 
        fullFieldBoundary
    ];
}

/**
 * Parse the a specific number of bits from the buffer string.
 * 
 * @param buffer data buffer
 * @param position starting position
 * @param length number of bits to parse
 * @returns 
 */
function parseFixedWidth(buffer: string, position: number, length: number = DECK_FIELD_LENGTH_BITS): [DeckField, number] {
    const boundary = position + length;
    const data = buffer.slice(position, boundary);
    return [
        new DeckField(parseInt(data, 2), null, {start: position, end: boundary}),
        boundary
    ];
}

/**
 * Parse the next setion of bits assuming they represent a unit payload.
 * 
 * Units are defined by two sequential bit fields.  Each length is parsed earlier in the payload.
 * 
 * [{0, xp} = veterancy, {xp, xp+unit} = unit id]
 * 
 * @param buffer 
 * @param position starting position
 * @param lengths bit length for veterancy and unit id fields
 * @returns 
 */
function parseUnitField(buffer: string, position: number, lengths: {xp: number, unit: number}): DeckFieldUnit {

    var currentPosition = position;
    var nextPosition = currentPosition;

    nextPosition += lengths.xp;
    const xp = buffer.slice(currentPosition, nextPosition);
    currentPosition = nextPosition

    nextPosition += lengths.unit;
    const unit = buffer.slice(currentPosition, nextPosition);
    currentPosition = nextPosition

    nextPosition += lengths.unit;
    const transport = buffer.slice(currentPosition, nextPosition);
    currentPosition = nextPosition

    return new DeckFieldUnit(xp, unit, transport, {
        start: position, 
        end: nextPosition,
    });
}
    

/**
 * Convert output from atob to a binary string representation.
 * 
 * @param buffer 
 * @param padding leading zeroes
 * @returns 
 */
function stringForByteBuffer(buffer: string, padding: number = 8): string {
    var len = buffer.length;
    var str = "";
    for (var i = 0; i < len; i++) {
        str += buffer.charCodeAt(i).toString(2).padStart(padding,'0');
    }
    return str;
}


/**
 * Results from DeckParser.parse()
 */
class DeckParserResults {
    deckString: string = "";
    decodedString: string = "";
    steps: DeckField[] = [];
    units: DeckFieldUnit[] = [];
    error: Error | null = null;
    leftovers: DeckField[] = [];
}


interface ParserPosition {start: number, end: number}
type DeckFieldDataType = number | string | null;

/**
 * Represents an encoded piece of data in the deck string.  A deck string is made up
 * of an array of fields that concatenate to build the final string.  A field is defined
 * with the first 5 bits representing the length of the data that follows.
 * [0-5: binary length| 5-length: data]
 */
class DeckField {
    length: number;
    data: DeckFieldDataType;
    positions: ParserPosition;

    lengthBinary: BinaryValue;
    dataBinary: BinaryValue;

    constructor(length: number, data: DeckFieldDataType, positions: ParserPosition) {
        this.length = length;
        this.data = data;
        this.positions = positions;

        this.lengthBinary = new BinaryValue(this.length);
        this.dataBinary = new BinaryValue(this.data);
    }
}

/**
 * Warno Unit Card
 */
class DeckFieldUnit {
    xp: number;
    id: number;
    transport: number;
    position: ParserPosition;

    constructor(xp: string, id: string, transport: string, position: ParserPosition) {
        this.xp = parseInt(xp, 2);
        this.id = parseInt(id, 2);
        this.transport = parseInt(transport, 2);
        this.position = position;
    }
}

export default parseDeckString;
export { parseDeckString, DeckParserResults, DeckField, DeckFieldUnit, BinaryValue }

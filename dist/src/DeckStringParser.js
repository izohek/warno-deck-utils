"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinaryValue = exports.DeckFieldUnit = exports.DeckField = exports.DeckParserResults = exports.parseDeckString = void 0;
const BinaryValue_1 = __importDefault(require("./BinaryValue"));
exports.BinaryValue = BinaryValue_1.default;
const Constants_1 = require("./Constants");
/// * A parser for Warno Deck strings
/**
 * Parse a Warno deck string
 *
 * @param deckString
 * @returns DeckParserResults
 */
function parseDeckString(deckString) {
    var _a;
    const parserResult = new DeckParserResults();
    parserResult.deckString = deckString;
    // Check we have data
    if (deckString === '') {
        parserResult.error = new Error('Empty deck string');
        return parserResult;
    }
    // Decode base64
    let parsedOutput;
    try {
        parsedOutput = atob(deckString);
    }
    catch (err) {
        parserResult.error = (_a = err) !== null && _a !== void 0 ? _a : new Error('Uknown error');
        return parserResult;
    }
    const bitstream = stringForByteBuffer(parsedOutput);
    parserResult.decodedString = bitstream;
    let position = 0;
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
            unit: unitIdSize[0].length
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
exports.parseDeckString = parseDeckString;
/**
 * Parse a field with the expected format:
 * [ {0-5} Length in binary, {5-Length} Data ]
 *
 * @param buffer string binary represenation string
 * @param position number where to start the field
 * @returns
 */
function parseField(buffer, position) {
    const lengthDataBoundary = position + Constants_1.DECK_FIELD_LENGTH_BITS;
    const lengthData = buffer.slice(position, lengthDataBoundary);
    const lengthDataInt = parseInt(lengthData, 2);
    const fullFieldBoundary = lengthDataBoundary + lengthDataInt;
    const fieldData = buffer.slice(lengthDataBoundary, fullFieldBoundary);
    return [
        new DeckField(lengthDataInt, fieldData, { start: position, end: fullFieldBoundary }),
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
function parseFixedWidth(buffer, position, length = Constants_1.DECK_FIELD_LENGTH_BITS) {
    const boundary = position + length;
    const data = buffer.slice(position, boundary);
    return [
        new DeckField(parseInt(data, 2), null, { start: position, end: boundary }),
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
function parseUnitField(buffer, position, lengths) {
    let currentPosition = position;
    let nextPosition = currentPosition;
    nextPosition += lengths.xp;
    const xp = buffer.slice(currentPosition, nextPosition);
    currentPosition = nextPosition;
    nextPosition += lengths.unit;
    const unit = buffer.slice(currentPosition, nextPosition);
    currentPosition = nextPosition;
    nextPosition += lengths.unit;
    const transport = buffer.slice(currentPosition, nextPosition);
    currentPosition = nextPosition;
    return new DeckFieldUnit(xp, unit, transport, {
        start: position,
        end: nextPosition
    });
}
/**
 * Convert output from atob to a binary string representation.
 *
 * @param buffer
 * @param padding leading zeroes
 * @returns
 */
function stringForByteBuffer(buffer, padding = 8) {
    const len = buffer.length;
    let str = '';
    for (let i = 0; i < len; i++) {
        str += buffer.charCodeAt(i).toString(2).padStart(padding, '0');
    }
    return str;
}
/**
 * Results from DeckParser.parse()
 */
class DeckParserResults {
    constructor() {
        this.deckString = '';
        this.decodedString = '';
        this.steps = [];
        this.units = [];
        this.error = null;
        this.leftovers = [];
    }
}
exports.DeckParserResults = DeckParserResults;
/**
 * Represents an encoded piece of data in the deck string.  A deck string is made up
 * of an array of fields that concatenate to build the final string.  A field is defined
 * with the first 5 bits representing the length of the data that follows.
 * [0-5: binary length| 5-length: data]
 */
class DeckField {
    constructor(length, data, positions) {
        this.length = length;
        this.data = data;
        this.positions = positions;
        this.lengthBinary = new BinaryValue_1.default(this.length);
        this.dataBinary = new BinaryValue_1.default(this.data);
    }
}
exports.DeckField = DeckField;
/**
 * Warno Unit Card
 */
class DeckFieldUnit {
    constructor(xp, id, transport, position) {
        this.xp = parseInt(xp, 2);
        this.id = parseInt(id, 2);
        this.transport = parseInt(transport, 2);
        this.position = position;
    }
}
exports.DeckFieldUnit = DeckFieldUnit;
exports.default = parseDeckString;

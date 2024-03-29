import BinaryValue from './BinaryValue'
import { DECK_FIELD_LENGTH_BITS } from './Constants'
import { DeckParserResults, DeckField, DeckFieldUnit, DeckHeaders } from './types/Parser'

/// * A parser for Warno Deck strings

/**
 * Parse a Warno deck string
 *
 * @param deckString
 * @returns DeckParserResults
 */
function parseDeckString (deckString: string): DeckParserResults {
    // Check we have data
    if (deckString === '') {
        throw new Error('Empty deck string')
    }

    // Decode base64
    let parsedOutput: string
    try {
        parsedOutput = atob(deckString)
    } catch (err) {
        throw err as Error ?? new Error('Uknown base 64 error')
    }

    const bitstream: string = stringForByteBuffer(parsedOutput)
    let position: number = 0

    // Eugen Headers - unknown purpose
    const header1 = parseField(bitstream, position)
    position = header1[1]

    // Modded game flag
    const header2 = parseField(bitstream, position)
    position = header2[1]

    // Division
    const division = parseField(bitstream, position)
    position = division[1]

    // Number of cards contained in the deck
    const numCards = parseField(bitstream, position)
    position = numCards[1]

    // Size of the veterancy field for each unit
    const xpSize = parseFixedWidth(bitstream, position)
    position = xpSize[1]

    // Size of the unit id field for each unit
    const unitIdSize = parseFixedWidth(bitstream, position)
    position = unitIdSize[1]

    // Parsed header fields (fields before list of units)
    const deckHeaders: DeckHeaders = {
        eugen: header1[0],
        modded: header2[0],
        division: division[0],
        numberOfCards: numCards[0],
        veterancyFieldSize: xpSize[0],
        unitIdSize: unitIdSize[0]
    }

    // If xpsize and unitidsize are 0 it will cause an infinite loop
    // so we'll bail early instead
    // TODO: As of Mar 2, 23 modded games trigger this due to an issue parsing sizes
    if (xpSize[0].length + unitIdSize[0].length < 1) {
        return {
            deckString,
            decodedString: bitstream,
            headers: deckHeaders,
            units: []
        }
    }

    // Loop for each unit
    // Ignores leftovers for now since if parsed it creates an extra
    //    incorrect card which shares some IDs with bradleys and such.
    const unitDefTotalLength = xpSize[0].length + unitIdSize[0].length
    const units = []
    while (position < bitstream.length && position + unitDefTotalLength < bitstream.length) {
        const unit = parseUnitField(bitstream, position, {
            xp: xpSize[0].length,
            unit: unitIdSize[0].length
        })
        units.push(unit)
        position = unit.position.end
    }

    // TODO:
    // Left over unused bits.  Parsing is accurate without them, but might be an issue when encoding.
    // All parsed decks end up with an extra card that always has only 1 bit set to on, but a variable position and surrounding 0s.
    // Parses out to some 2^x like 4, 8, 16, 32, 64, 128.
    // Might be some sort of padding used in the encoding.
    // Seems to end in : 000010 with { ending padding of 0s }

    return {
        deckString,
        decodedString: bitstream,
        headers: deckHeaders,
        units
    }
}

/**
 * Parse a field with the expected format:
 * [ {0-5} Length in binary, {5-Length} Data ]
 *
 * @param buffer string binary represenation string
 * @param position number where to start the field
 * @returns
 */
function parseField (buffer: string, position: number): [DeckField, number] {
    const lengthDataBoundary = position + DECK_FIELD_LENGTH_BITS
    const lengthData = buffer.slice(position, lengthDataBoundary)
    const lengthDataInt = parseInt(lengthData, 2)
    const fullFieldBoundary = lengthDataBoundary + lengthDataInt
    const fieldData = buffer.slice(lengthDataBoundary, fullFieldBoundary)

    return [
        new DeckField(lengthDataInt, fieldData, { start: position, end: fullFieldBoundary }),
        fullFieldBoundary
    ]
}

/**
 * Parse the a specific number of bits from the buffer string.
 *
 * @param buffer data buffer
 * @param position starting position
 * @param length number of bits to parse
 * @returns
 */
function parseFixedWidth (buffer: string, position: number, length: number = DECK_FIELD_LENGTH_BITS): [DeckField, number] {
    const boundary = position + length
    const data = buffer.slice(position, boundary)
    return [
        new DeckField(parseInt(data, 2), null, { start: position, end: boundary }),
        boundary
    ]
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
function parseUnitField (buffer: string, position: number, lengths: {xp: number, unit: number}): DeckFieldUnit {
    let currentPosition = position
    let nextPosition = currentPosition

    nextPosition += lengths.xp
    const xp = buffer.slice(currentPosition, nextPosition)
    currentPosition = nextPosition

    nextPosition += lengths.unit
    const unit = buffer.slice(currentPosition, nextPosition)
    currentPosition = nextPosition

    nextPosition += lengths.unit
    const transport = buffer.slice(currentPosition, nextPosition)
    currentPosition = nextPosition

    return new DeckFieldUnit(xp, unit, transport, {
        start: position,
        end: nextPosition
    })
}

/**
 * Convert output from atob to a binary string representation.
 *
 * @param buffer
 * @param padding leading zeroes
 * @returns
 */
function stringForByteBuffer (buffer: string, padding: number = 8): string {
    const len = buffer.length
    let str = ''
    for (let i = 0; i < len; i++) {
        str += buffer.charCodeAt(i).toString(2).padStart(padding, '0')
    }
    return str
}

export default parseDeckString
export { parseDeckString, BinaryValue }

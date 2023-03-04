import BinaryValue from './BinaryValue'
import { DECK_FIELD_LENGTH_BITS } from './Constants'

/// * A parser for Warno Deck strings

/**
 * Parse a Warno deck string
 *
 * @param deckString
 * @returns DeckParserResults
 */
function parseDeckString (deckString: string): DeckParserResults {
    const parserResult = new DeckParserResults()
    parserResult.deckString = deckString

    // Check we have data
    if (deckString === '') {
        parserResult.error = new Error('Empty deck string')
        return parserResult
    }

    // Decode base64
    let parsedOutput: string
    try {
        parsedOutput = atob(deckString)
    } catch (err) {
        parserResult.error = err as Error ?? new Error('Uknown error')
        return parserResult
    }

    const bitstream: string = stringForByteBuffer(parsedOutput)
    parserResult.decodedString = bitstream

    let position: number = 0

    // Eugen Headers - unknown purpose
    const header1 = parseField(bitstream, position)
    parserResult.steps.push(header1[0])
    position = header1[1]

    // Modded game flag
    const header2 = parseField(bitstream, position)
    parserResult.steps.push(header2[0])
    position = header2[1]

    // Division
    const division = parseField(bitstream, position)
    parserResult.steps.push(division[0])
    position = division[1]

    // Number of cards contained in the deck
    const numCards = parseField(bitstream, position)
    parserResult.steps.push(numCards[0])
    position = numCards[1]

    // Size of the veterancy field for each unit
    const xpSize = parseFixedWidth(bitstream, position)
    parserResult.steps.push(xpSize[0])
    position = xpSize[1]

    // Size of the unit id field for each unit
    const unitIdSize = parseFixedWidth(bitstream, position)
    parserResult.steps.push(unitIdSize[0])
    position = unitIdSize[1]

    // If xpsize and unitidsize are 0 it will cause an infinite loop 
    // so we'll bail early instead
    // TODO: As of Mar 2, 23 modded games trigger this due to an issue parsing sizes
    if (xpSize[0].length + unitIdSize[0].length < 1) {
        return parserResult
    }
    
    // Loop for each unit
    // Ignores leftovers for now since if parsed it creates an extra
    //    incorrect card which shares some IDs with bradleys and such.
    const unitDefTotalLength = xpSize[0].length + unitIdSize[0].length
    const expectedNumCards = numCards[0].dataBinary.value ?? 0
    while (position < bitstream.length && position + unitDefTotalLength < bitstream.length && parserResult.units.length < expectedNumCards) {
        const unit = parseUnitField(bitstream, position, {
            xp: xpSize[0].length,
            unit: unitIdSize[0].length
        })
        parserResult.units.push(unit)
        position = unit.position.end
    }

    // TODO:
    // This leftover data represents combat groups
    /**
     * Combat Groups Encoding (use the same kind of encoding, with data size and value)
        1) Number of Companies
        2) If there is at least one
        2)a) Max number of Platoon
        2)b) Biggest pack index referenced in a Platoon
        2)c) Biggest number of a pack in a Platoon
        3) Loop through each Company
        3)a) Number of Platoon in this Company
        3)b) Loop through each Platoon
        3)b)a) Number of Pack data in this Platoon
        3)b)b) Loop through each Pack Data
        3)b)c)a) Pack index, for exmple if 3 is encoded, it refers to the 3rd pack encoded in your section 7
        3)b)c)b) Pack number
     */

    // == Combat groups ==

    // number of encoded companies
    console.log("Remaining: ", bitstream.slice(position))
    const numCombatGroups = parseField(bitstream, position)
    parserResult.combatGroups.push(numCombatGroups[0])
    position = numCombatGroups[1]

    const numCombatGroupsInt = numCombatGroups[0].dataBinary.value ?? 0
    if (numCombatGroupsInt < 1) {
        // If no combat groups, we're done
        return parserResult
    }
    
    // a) Max number of Platoon
    const maxPlatoonNum = parseFixedWidth(bitstream, position)
    parserResult.combatGroups.push(maxPlatoonNum[0])
    position = maxPlatoonNum[1]
    
    // 2)b) Biggest pack index referenced in a Platoon
    const maxPlatoonPackIndex = parseFixedWidth(bitstream, position)
    parserResult.combatGroups.push(maxPlatoonPackIndex[0])
    position = maxPlatoonPackIndex[1]

    // 2)c) Biggest number of a pack in a Platoon
    const maxPlatoonPackId = parseFixedWidth(bitstream, position)
    parserResult.combatGroups.push(maxPlatoonPackId[0])
    position = maxPlatoonPackId[1]
    
    console.log("1)# Companies: ",numCombatGroups, numCombatGroups[0].dataBinary.value);
    console.log("2a)Max num of platoon: ", maxPlatoonNum, maxPlatoonNum[0].length);
    console.log("2b)Biggest pack index: ", maxPlatoonPackIndex, maxPlatoonPackIndex[0].length);
    console.log("2)c1) Biggest number of a pack in a Platoon: ", maxPlatoonPackId, maxPlatoonPackId[0].length);

    // TODO:
    // 3) Loop through each Company
    for (let i = 0; i < numCombatGroupsInt; i++) {
        parserResult.companies.push(parseCompanyField(
            bitstream, position, {
                platoons: maxPlatoonNum[0].length,
                packIndex: maxPlatoonPackIndex[0].length,
                packNumber: maxPlatoonPackId[0].length
            }
        ))

    }
    console.log("companies: ", parserResult.companies)

    return parserResult
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

function parseCompanyField (
    buffer: string,
    position: number,
    lengths: {
        platoons: number,
        packIndex: number,
        packNumber: number
    }
): DeckFieldCompany {
    let platoons: DeckFieldPlatoon[] = []
    let currentPosition = position
    let nextPosition = currentPosition

    nextPosition += lengths.platoons
    let numberOfPlatoons = buffer.slice(currentPosition, nextPosition)
    currentPosition = nextPosition
    console.log("!!num platoons: ", numberOfPlatoons)

    for (let i = 0; i < lengths.platoons; i++) {
        const platoonField = parsePlatoonField(
            buffer, 
            currentPosition, 
            lengths
        )

        platoons.push(platoonField)

        currentPosition = platoonField.position.end
    }

    return new DeckFieldCompany(
        platoons, 
        {start: position, end: currentPosition}
    )
}

function parsePlatoonField(
    buffer: string,
    position: number,
    lengths: {
        packIndex: number,
        packNumber: number
    }
): DeckFieldPlatoon {
    let currentPosition = position
    let nextPosition = currentPosition

    nextPosition += lengths.packIndex
    const packIndex = buffer.slice(currentPosition, nextPosition)
    currentPosition = nextPosition

    const numberOfPacksInPlatoon = parseInt(packIndex, 2)

    let platoonPacks: DeckFieldPlatoonPack[] = []
    for (let i = 0; i < numberOfPacksInPlatoon; i++) {
        const packStartIndex = currentPosition
        nextPosition = currentPosition + lengths.packIndex
        const packId = buffer.slice(currentPosition, nextPosition)
        currentPosition = nextPosition

        nextPosition = nextPosition + lengths.packNumber
        const numberOfPack = buffer.slice(currentPosition, nextPosition)
        currentPosition = nextPosition

        platoonPacks.push({
            id: parseInt(packId, 2),
            count: parseInt(numberOfPack, 2),
            position: {
                start: packStartIndex,
                end: currentPosition
            }
        })
    }

    // sanity check since # of packs is encoded it should match our parsed results
    if (numberOfPacksInPlatoon !== platoonPacks.length) {
        throw new Error("combat group platoon inconsistency error: number of platoon packs does not match parsed number of packs")
    }

    return new DeckFieldPlatoon(
        platoonPacks,
        {
            start: position,
            end: nextPosition
        }
    )
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

/**
 * Results from DeckParser.parse()
 */
class DeckParserResults {
    deckString: string = ''
    decodedString: string = ''
    steps: DeckField[] = []
    units: DeckFieldUnit[] = []
    combatGroups: DeckField[] = []
    companies: DeckFieldCompany[] = []
    error: Error | null = null
    leftovers: DeckField[] = []
}

interface ParserPosition {start: number, end: number}
type DeckFieldDataType = number | string | null

/**
 * Represents an encoded piece of data in the deck string.  A deck string is made up
 * of an array of fields that concatenate to build the final string.  A field is defined
 * with the first 5 bits representing the length of the data that follows.
 * [0-5: binary length| 5-length: data]
 */
class DeckField {
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
class DeckFieldUnit {
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

class DeckFieldCompany {
    constructor(
        public platoons: DeckFieldPlatoon[],
        public position: ParserPosition
    ) {}
}

class DeckFieldPlatoon {
    constructor(
        public packs: DeckFieldPlatoonPack[],
        public position: ParserPosition
    ){}
}

interface DeckFieldPlatoonPack {
    id: number,
    count: number,
    position: ParserPosition
}

export default parseDeckString
export { parseDeckString, DeckParserResults, DeckField, DeckFieldUnit, BinaryValue }

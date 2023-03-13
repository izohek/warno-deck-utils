import parseDeckString from './DeckStringParser'
import { DeckParserResults, LookupService } from './types/Parser'
import { SimpleDeck } from './types/SimpleDeck'

/**
 * Decode a Warno deckstring into a Deck
 *
 * @param deckString
 * @returns
 */
export function decodeDeckString (deckString: string, lookup: LookupService): SimpleDeck {
    // Parse and decode
    const parserResults = parseDeckString(deckString)

    return deckFromParser(parserResults, lookup)
}

/**
 * Create a warno deck from DeckParser parse results.
 *
 * @param results DeckParser parse() results
 * @returns
 */
export function deckFromParser (results: DeckParserResults, lookup: LookupService): SimpleDeck {
    // Indicates if deck code was generated from a modded game
    const moddedFlag = parseInt(results.headers.modded.data as string ?? '', 2)
    const modded = moddedFlag === 1

    const divisionValue = parseInt(results.headers.division.data as string ?? '', 2)
    if (divisionValue === undefined) {
        throw new Error('Could not parse division id')
    }

    const division = {
        id: divisionValue,
        descriptor: lookup.divisionForId(divisionValue) ?? undefined
    }

    const numberOfCardsField = results.headers.numberOfCards
    const numberCards = parseInt(numberOfCardsField.data as string ?? '', 2)

    const cards = results.units.slice(0, numberCards).map((cardResult) => {
        return {
            veterancy: cardResult.xp,
            unit: {
                id: cardResult.id,
                descriptor: lookup.unitForId(cardResult.id)
            },
            transport: cardResult.transport > 0
                ? {
                    id: cardResult.transport,
                    descriptor: lookup.unitForId(cardResult.transport)
                }
                : undefined
        }
    })

    return {
        modded,
        division,
        numberCards,
        cards
    }
}

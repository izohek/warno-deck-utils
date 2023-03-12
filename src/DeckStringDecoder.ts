import Deck from './Deck'
import parseDeckString from './DeckStringParser'
import { DeckFieldUnit, DeckParserResults } from './types/Parser';
import { UnitCard, findUnitCard, AllDivisions } from '@izohek/warno-db'

/**
 * Decode a Warno deckstring into a Deck
 *
 * @param deckString
 * @returns
 */
export function decodeDeckString (deckString: string): Deck {
    // Parse and decode
    const parserResults = parseDeckString(deckString)

    return deckFromParser(parserResults)
}

/**
 * Create a warno deck from DeckParser parse results.
 *
 * @param results DeckParser parse() results
 * @returns
 */
export function deckFromParser (results: DeckParserResults): Deck {
    const deck = new Deck()

    // Indicates if deck code was generated from a modded game
    const moddedFlag = parseInt(results.headers.modded.data as string ?? '', 2)
    deck.modded = moddedFlag === 1

    const divisionValue = parseInt(results.headers.division.data as string ?? '', 2)
    if (divisionValue === undefined) {
        throw new Error("Could not parse division id")
    }

    deck.division = AllDivisions.filter(function (item) {
        return item.id === divisionValue
    })[0]

    const numberOfCardsField = results.headers.numberOfCards
    deck.numberCards = parseInt(numberOfCardsField.data as string ?? '', 2)

    results.units.slice(0, deck.numberCards).forEach(cardResult => {
        deck.cards.push(
            cardFromUnitField(cardResult)
        )
    })

    return deck
}

/**
 * Translate a parser unit field into a Warno unit card
 *
 * @param unitField Parser unit field
 * @returns
 */
function cardFromUnitField (unitField: DeckFieldUnit): UnitCard {
    const newCard = findUnitCard(unitField.id) ?? new UnitCard()

    newCard.code = unitField.id
    newCard.veterancy = unitField.xp

    if (unitField.transport != null && unitField.transport > 0) {
        const transportCard = findUnitCard(unitField.transport)
        newCard.transport = transportCard ?? new UnitCard(`transport (${unitField.transport})`, unitField.transport, unitField.xp)
    }

    return newCard
}

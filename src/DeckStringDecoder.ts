import Deck from './Deck'
import parseDeckString, { DeckFieldUnit, DeckParserResults } from './DeckStringParser'
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

    if (results.error != null) {
        return deck
    }

    const divisionValue = parseInt(results.steps[2].data as string ?? '', 2)

    deck.division = AllDivisions.filter(function (item) {
        return item.id === divisionValue
    })[0]

    const numberOfCardsField = results.steps[3]
    deck.numberCards = parseInt(numberOfCardsField.data as string ?? '', 2)

    results.units.forEach(cardResult => {
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

    if (!isNaN(unitField.transport)) {
        const transportCard = findUnitCard(unitField.transport)
        newCard.transport = transportCard ?? new UnitCard(`transport (${unitField.transport})`, unitField.transport, unitField.xp)
    }

    return newCard
}

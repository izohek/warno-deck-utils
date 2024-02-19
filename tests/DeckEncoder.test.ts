import { decodeDeckString } from '../src/DeckStringDecoder'
import { encodeDeck } from '../src/DeckStringEncoder'
import { decks } from './TestData'
import { AllDivisions, AllUnits } from '@izohek/warno-db'
import { GenericLookupAdapter } from '../src/adapters/GenericLookupAdapter'

describe('deck encoder tests', () => {
    const lookupAdapter = new GenericLookupAdapter(AllUnits, AllDivisions)

    test('test-encoding-decks', () => {
        decks.forEach(function (deck) {
            const decodedDeck = decodeDeckString(deck.deckString, lookupAdapter)

            const deckStringFromDecodedDeck = encodeDeck(decodedDeck)

            expect(deckStringFromDecodedDeck).toBe(deck.deckString)
        })
    })

    test('codes-with-combat-groups', () => {
        // combat groups don't parse yet, but they should still create
        // a valid code without the groups encoded in the string
        const codes = [
            ['FhFiOiZDMgAQzIACMyABDPAAIzwAAYQhxA==', 'FhFiOiZDMgAQzIACMyABDPAAIzwAAQA='],
            ['FhFiOiZDMgAQzIACMyABDPAAIzwAAYgioag=', 'FhFiOiZDMgAQzIACMyABDPAAIzwAAQA='],
            ['FhFiOiZDMgAQzIACMyABDPAAIzwAAoQhSFVUQqQ=', 'FhFiOiZDMgAQzIACMyABDPAAIzwAAQA=']
        ]

        for (const [code, expected] of codes) {
            const deck = decodeDeckString(code, lookupAdapter)
            const encoded = encodeDeck(deck)

            expect(encoded).toBe(expected)
        }
    })
})

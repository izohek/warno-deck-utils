import { decodeDeckString } from '../src/DeckStringDecoder'
import { encodeDeck } from '../src/DeckStringEncoder'
import { decks } from './TestData'
import { AllDivisions, AllUnits } from '@izohek/warno-db'
import { GenericLookupAdapter } from '../src/adapters/GenericLookupAdapter'
import { SimpleDeck } from '../src/types/SimpleDeck'

describe('deck encoder tests', () => {
    const lookupAdapter = new GenericLookupAdapter(AllUnits, AllDivisions)

    test('test-encoding-decks', () => {
        decks.forEach(function (deck) {
            const decodedDeck = decodeDeckString(deck.deckString, lookupAdapter)

            const deckStringFromDecodedDeck = encodeDeck(decodedDeck)

            expect(deckStringFromDecodedDeck).toBe(deck.deckString)
        })
    })

    test('failing-waryes-code', () => {
        const deck: SimpleDeck = {
            modded: false,
            division: {
                id: 20
            },
            numberCards: 1,
            cards: [
                {
                    veterancy: 1,
                    unit: {
                        id: 176
                    }
                }
            ]
        }

        const deckString = encodeDeck(deck)

        expect(deckString).toBe('FBFoGFcWAAAg')
    })

    test('codes-with-combat-groups', () => {
        // combat groups don't parse yet, but they should still create
        // a valid code without the groups encoded in the string
        const codes = [
            ['FBE0MS4XgAAwhFo=', 'FBE0MS4XgAAg'],
            ['FBE0MS4XgAAwhDo=', 'FBE0MS4XgAAg'],
            ['FBE0MS4XgAAxBDWg', 'FBE0MS4XgAAg'],
            [
                'FBE80YlsYgAIhjELHyhxUyQsNyQrawAMOgAQEAAQEAAIDwAUrgARCQAQHAATiAAY1QcwGQAMMCbRIgAMc4qUV4iRIgAUuAARtAAUV4iRUgAMPAAJKQ9sRoiRtAAUOCbBSJf0OwAJjYIJjYIJCAAChBDVtb1dHRg=',
                'FBE80YlsYgAIhjELHyhxUyQsNyQrawAMOgAQEAAQEAAIDwAUrgARCQAQHAATiAAY1QcwGQAMMCbRIgAMc4qUV4iRIgAUuAARtAAUV4iRUgAMPAAJKQ9sRoiRtAAUOCbBSJf0OwAJjYIJjYIJCAABAA=='
            ]
        ]

        for (const [code, expected] of codes) {
            const deck = decodeDeckString(code, lookupAdapter)
            const encoded = encodeDeck(deck)

            expect(encoded).toBe(expected)
        }
    })
})

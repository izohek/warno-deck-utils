import { decodeDeckString } from '../src/DeckStringDecoder'
import { encodeDeck } from '../src/DeckStringEncoder'
import { decks } from './TestData'
import { Deck } from '../src/Deck';
import { AllDivisions } from '@izohek/warno-db';

test('test-encoding-decks', () => {
    decks.forEach(function (deck) {
        const decodedDeck = decodeDeckString(deck.deckString)

        const deckStringFromDecodedDeck = encodeDeck(decodedDeck)

        expect(deckStringFromDecodedDeck).toBe(deck.deckString)
    })
})

test('failing-waryes-code', () => {

    const  deck = new Deck();
    deck.division = AllDivisions.find((div) => { return div.id === 20 })
    deck.addUnitWithId(176, 1, null);

    const deckString = encodeDeck(deck);

    expect(deckString).toBe('FBFoGFcWAAAg')

})

test('codes-with-combat-groups', () => {
    // combat groups don't parse yet, but they should still create
    // a valid code without the groups encoded in the string
    const codes = [
        ["FBE0MS4XgAAwhFo=", "FBE0MS4XgAAg"],
        ["FBE0MS4XgAAwhDo=", "FBE0MS4XgAAg"],
        ["FBE0MS4XgAAxBDWg", "FBE0MS4XgAAg"],
        [
            "FBE80YlsYgAIhjELHyhxUyQsNyQrawAMOgAQEAAQEAAIDwAUrgARCQAQHAATiAAY1QcwGQAMMCbRIgAMc4qUV4iRIgAUuAARtAAUV4iRUgAMPAAJKQ9sRoiRtAAUOCbBSJf0OwAJjYIJjYIJCAAChBDVtb1dHRg=", 
            "FBE80YlsYgAIhjELHyhxUyQsNyQrawAMOgAQEAAQEAAIDwAUrgARCQAQHAATiAAY1QcwGQAMMCbRIgAMc4qUV4iRIgAUuAARtAAUV4iRUgAMPAAJKQ9sRoiRtAAUOCbBSJf0OwAJjYIJjYIJCAABAA=="
        ],
    ]

    for (const [code, expected] of codes) {
        const deck = decodeDeckString(code)
        const encoded = encodeDeck(deck)

        expect(encoded).toBe(expected)
    }
})

import { decodeDeckString } from '../src/DeckStringDecoder'
import { encodeDeck } from '../src/DeckStringEncoder'
import { decks } from './TestData'

test('test-encoding-decks', () => {
    decks.forEach(function (deck) {
        const decodedDeck = decodeDeckString(deck.deckString)

        const deckStringFromDecodedDeck = encodeDeck(decodedDeck)

        expect(deckStringFromDecodedDeck).toBe(deck.deckString)
    })
})

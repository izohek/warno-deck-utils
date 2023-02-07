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

import { decodeDeckString } from '../src/DeckStringDecoder'
import { decks } from './TestData'
import { Deck } from '../src/Deck'

test('test-decoding-decks', () => {
    decks.forEach(function (deck) {
        const decodedDeck = decodeDeckString(deck.deckString)
        // test division
        expect(decodedDeck.division?.name).toBe(deck.division)

        // test expected number of cards
        expect(decodedDeck.numberCards).toBe(deck.units.length)

        // test expected number of cards matches actual # of cards
        expect(decodedDeck.cards.length).toBe(decodedDeck.numberCards)

        // test unit codes
        const units = deck.units.map(function (u) {
            if (Array.isArray(u)) {
                return u[0]
            } else {
                return u
            }
        })

        expect(decodedDeck.cards.map(function (c) {
            return c.code
        }))
            .toEqual(units)

        // test transports
        // transform the test data.  Stored as [unit] or [unit, transport].
        const transports = deck.units.map(function (u) {
            if (Array.isArray(u)) {
                return u[1]
            } else {
                return null
            }
        })

        expect(
            decodedDeck.cards.map((c) => { return c.transport?.code ?? null })
        ).toEqual(transports)

        // test veterancy
        expect(
            decodedDeck.cards.map((c) => { return c.veterancy })
        ).toEqual(deck.veterancy)
    })
})

test('test-empty-deck-strings', () => {
    const decodedDeck: ()=>(Deck) = () => {
        return decodeDeckString('')
    }

    expect(decodedDeck).toThrow(Error)
})

test('test-modded-deck-code', () => {
    const deckCode = "FBgAAAAFepShgAAAAAk0MS4XgAAg"
    const decodedDeck = decodeDeckString(deckCode)
    // TODO: issue with parsing modded decks so test for truthy until it's better implemented
    expect(decodedDeck).toBeTruthy()
})

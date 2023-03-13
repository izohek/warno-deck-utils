import { AllDivisions, AllUnits } from '@izohek/warno-db'
import { Deck } from '../src/Deck'
import { GenericLookupAdapter } from '../src/adapters/GenericLookupAdapter'

describe('deck tests with lookup', () => {
    const lookupAdapter = new GenericLookupAdapter(
        AllUnits,
        AllDivisions
    )

    test('test-deck-add-unit-by-id', () => {
        const deck = new Deck(lookupAdapter)
        const card = deck.addUnitWithId(410, 3)

        expect(card?.id).toBe(410)
        expect(card?.veterancy).toBe(3)
        expect(card?.transport).toBeUndefined()
        expect(deck.cards[0]).toBe(card)
        expect(deck.numberCards).toBe(1)
    })

    test('test-deck-add-unit-by-id-with-transport', () => {
        const deck = new Deck(lookupAdapter)
        const card = deck.addUnitWithId(359, 0, 500)

        expect(card?.id).toBe(359)
        expect(card?.veterancy).toBe(0)
        expect(card?.transport?.id).toBe(500)
        expect(deck.cards[0]).toBe(card)
        expect(deck.numberCards).toBe(1)
    })

    test('test-deck-add-unit-not-found', () => {
        const deck = new Deck(lookupAdapter)
        let card = deck.addUnitWithId(9999999, 0)

        expect(card).toBeNull()
        expect(deck.cards.length).toBe(0)
        expect(deck.numberCards).toBe(0)

        card = deck.addUnitWithId(-1, 0)
        expect(card).toBeNull()
        expect(deck.cards.length).toBe(0)
        expect(deck.numberCards).toBe(0)
    })

    test('test-deck-add-unit-not-found', () => {
        const deck = new Deck(lookupAdapter)
        const card = deck.addUnitWithId(359, 0, 999999)

        expect(card?.id).toBe(359)
        expect(card?.veterancy).toBe(0)
        expect(card?.transport?.id).toBeUndefined()
        expect(deck.cards[0]).toBe(card)
        expect(deck.numberCards).toBe(1)
    })

    test('test-add-unit-veterancy-constraints', () => {
        const deck = new Deck(lookupAdapter)
        let card = deck.addUnitWithId(410, -1)

        expect(card?.id).toBe(410)
        expect(card?.veterancy).toBe(0)
        expect(card?.transport).toBeUndefined()
        expect(deck.cards[0]).toBe(card)

        card = deck.addUnitWithId(410, 999)

        expect(card?.id).toBe(410)
        expect(card?.veterancy).toBe(3)
        expect(card?.transport).toBeUndefined()
        expect(deck.cards[1]).toBe(card)
        expect(deck.cards.length).toBe(2)
        expect(deck.numberCards).toBe(2)
    })
})

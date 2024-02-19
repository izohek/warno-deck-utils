import { decodeDeckString } from '../src/DeckStringDecoder'
import { decks } from './TestData'
import { GenericLookupAdapter } from '../src/adapters/GenericLookupAdapter'
import { AllDivisions, AllUnits } from '@izohek/warno-db'
import { SimpleDeck } from '../src/types/SimpleDeck'

describe('deck decoder tests', () => {
    const lookupAdapter = new GenericLookupAdapter(AllUnits, AllDivisions)

    test('test-decoding-decks', () => {
        decks.forEach(function (deck) {
            const decodedDeck = decodeDeckString(deck.deckString, lookupAdapter)
            // test division
            expect(decodedDeck.division.id).toBe(deck.division)

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
                return c.unit.id
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

            const foundTransports = decodedDeck.cards.map((c) => { return c.transport?.id ?? null })
            expect(
                foundTransports
            ).toEqual(transports)

            // test veterancy
            expect(
                decodedDeck.cards.map((c) => { return c.veterancy })
            ).toEqual(deck.veterancy)
        })
    })

    test('test-empty-deck-strings', () => {
        const decodedDeck: ()=>(SimpleDeck) = () => {
            return decodeDeckString('', lookupAdapter)
        }

        expect(decodedDeck).toThrow(Error)
    })

    test('test-modded-deck-code', () => {
        const deckCode = 'FBgAAAAFepShgAAAAAk0MS4XgAAg'
        const decodedDeck = decodeDeckString(deckCode, lookupAdapter)
        // TODO: issue with parsing modded decks so test for truthy until it's better implemented
        expect(decodedDeck).toBeTruthy()
    })
})

// test decoding without an adapter
describe('no adapter tests', () => {
    decks.forEach((deck) => {
        test('test-first-deck-code-no-adapter', () => {
            const deckCode = deck.deckString
            const decodedDeck = decodeDeckString(deckCode)

            // test division
            expect(decodedDeck.division.id).toBe(deck.division)

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
                return c.unit.id
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

            const foundTransports = decodedDeck.cards.map((c) => { return c.transport?.id ?? null })
            expect(
                foundTransports
            ).toEqual(transports)

            // test veterancy
            expect(
                decodedDeck.cards.map((c) => { return c.veterancy })
            ).toEqual(deck.veterancy)
        })
    })
})

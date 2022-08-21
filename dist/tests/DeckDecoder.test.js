"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DeckStringDecoder_1 = require("../src/DeckStringDecoder");
const TestData_1 = require("./TestData");
test('test-decoding-decks', () => {
    TestData_1.decks.forEach(function (deck) {
        var _a;
        const decodedDeck = (0, DeckStringDecoder_1.decodeDeckString)(deck.deckString);
        // test division
        expect((_a = decodedDeck.division) === null || _a === void 0 ? void 0 : _a.name).toBe(deck.division);
        // test expected number of cards
        expect(decodedDeck.numberCards).toBe(deck.units.length);
        // test expected number of cards matches actual # of cards
        expect(decodedDeck.cards.length).toBe(decodedDeck.numberCards);
        // test unit codes
        const units = deck.units.map(function (u) {
            if (Array.isArray(u)) {
                return u[0];
            }
            else {
                return u;
            }
        });
        expect(decodedDeck.cards.map(function (c) {
            return c.code;
        }))
            .toEqual(units);
        // test transports
        // transform the test data.  Stored as [unit] or [unit, transport].
        const transports = deck.units.map(function (u) {
            if (Array.isArray(u)) {
                return u[1];
            }
            else {
                return null;
            }
        });
        expect(decodedDeck.cards.map((c) => { var _a, _b; return (_b = (_a = c.transport) === null || _a === void 0 ? void 0 : _a.code) !== null && _b !== void 0 ? _b : null; })).toEqual(transports);
        // test veterancy
        expect(decodedDeck.cards.map((c) => { return c.veterancy; })).toEqual(deck.veterancy);
    });
});
test('test-empty-deck-strings', () => {
    const decodedDeck = () => {
        return (0, DeckStringDecoder_1.decodeDeckString)('');
    };
    expect(decodedDeck).toThrow(Error);
});

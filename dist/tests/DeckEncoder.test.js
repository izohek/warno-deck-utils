"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DeckStringDecoder_1 = require("../src/DeckStringDecoder");
const DeckStringEncoder_1 = require("../src/DeckStringEncoder");
const TestData_1 = require("./TestData");
test('test-encoding-decks', () => {
    TestData_1.decks.forEach(function (deck) {
        const decodedDeck = (0, DeckStringDecoder_1.decodeDeckString)(deck.deckString);
        const deckStringFromDecodedDeck = (0, DeckStringEncoder_1.encodeDeck)(decodedDeck);
        expect(deckStringFromDecodedDeck).toBe(deck.deckString);
    });
});

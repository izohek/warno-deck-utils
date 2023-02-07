"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DeckStringDecoder_1 = require("../src/DeckStringDecoder");
const DeckStringEncoder_1 = require("../src/DeckStringEncoder");
const TestData_1 = require("./TestData");
const Deck_1 = require("../src/Deck");
const warno_db_1 = require("@izohek/warno-db");
test('test-encoding-decks', () => {
    TestData_1.decks.forEach(function (deck) {
        const decodedDeck = (0, DeckStringDecoder_1.decodeDeckString)(deck.deckString);
        const deckStringFromDecodedDeck = (0, DeckStringEncoder_1.encodeDeck)(decodedDeck);
        expect(deckStringFromDecodedDeck).toBe(deck.deckString);
    });
});
test('failing-waryes-code', () => {
    const deck = new Deck_1.Deck();
    deck.division = warno_db_1.AllDivisions.find((div) => { return div.id === 20; });
    deck.addUnitWithId(176, 1, null);
    const deckString = (0, DeckStringEncoder_1.encodeDeck)(deck);
    expect(deckString).toBe('FBFoGFcWAAAg');
});

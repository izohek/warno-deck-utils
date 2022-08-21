"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DeckStringDecoder_1 = require("../src/DeckStringDecoder");
const DeckStringEncoder_1 = require("../src/DeckStringEncoder");
const decks = [
    {
        deckString: "FBFuGJWzQABA",
        division: "35th",
        units: [410],
        veterancy: [3]
    }, {
        deckString: "FBF4OCVRkAFGQASzvolcAAQ=",
        division: "TKS",
        units: [562, 562, [359, 500], 174],
        veterancy: [2, 2, 2, 1]
    }, {
        deckString: "FBFiOiVMyAEzIATMgBM8AEzwABA=",
        division: "39th",
        units: [409, 409, 409, 414, 414],
        veterancy: [2, 2, 2, 2, 2]
    }, {
        deckString: "FBFmaMSuHAAUVABRUAGNAA4FfeXMz5cjRlzM+V9+NZX41jfjWN+G9n3lefh02NXTY147ACj0AKPQAs2ACj8AOCH4lpfioMAJCgAozACNMALFQAqCABogAGhgAYXABTwAFGwAaSAAIA==",
        division: "4th",
        units: [
            540, 277, 277, 564, [517, 503], [371, 207], [370, 209], [371, 207], [351, 504], [357, 504], [355, 504], [355, 504],
            [758, 503], [350, 504], [845, 565], [845, 565], 571, 573, 573, 822, 575, [520, 504], [361, 504], 643,
            266, 563, 211, 789, 642, 648, 646, 535, 316, 283, 658
        ],
        veterancy: [
            3, 1, 1, 1, 3, 2, 2, 2, 2, 3, 3, 3,
            1, 2, 1, 1, 3, 2, 2, 2, 2, 3, 2, 2,
            2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1
        ]
    },
];
test('test-decoding-decks', () => {
    decks.forEach(function (deck) {
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
        expect(decodedDeck.cards.map(function (c) {
            var _a, _b;
            return (_b = (_a = c.transport) === null || _a === void 0 ? void 0 : _a.code) !== null && _b !== void 0 ? _b : null;
        }))
            .toEqual(transports);
        // test veterancy
        const vet = decodedDeck.cards.map(function (c) { return c.veterancy; });
        expect(vet).toEqual(deck.veterancy);
        // test deck string against re-encoded decoded deck
        const encodedDeck = (0, DeckStringEncoder_1.encodeDeck)(decodedDeck);
        expect(encodedDeck).toBe(deck.deckString);
    });
});

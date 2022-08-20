"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deckFromParser = exports.decodeDeckString = void 0;
const Deck_1 = __importDefault(require("./Deck"));
const DeckStringParser_1 = __importDefault(require("./DeckStringParser"));
const warno_db_1 = require("@izohek/warno-db");
/**
 * Decode a Warno deckstring into a Deck
 *
 * @param deckString
 * @returns
 */
function decodeDeckString(deckString) {
    // Parse and decode
    const parserResults = (0, DeckStringParser_1.default)(deckString);
    return deckFromParser(parserResults);
}
exports.decodeDeckString = decodeDeckString;
/**
 * Create a warno deck from DeckParser parse results.
 *
 * @param results DeckParser parse() results
 * @returns
 */
function deckFromParser(results) {
    var _a, _b;
    var deck = new Deck_1.default();
    if (results.error) {
        return deck;
    }
    const divisionValue = parseInt((_a = results.steps[2].data) !== null && _a !== void 0 ? _a : "", 2);
    deck.division = warno_db_1.AllDivisions.filter(function (item) {
        return item.id === divisionValue;
    })[0];
    const numberOfCardsField = results.steps[3];
    deck.numberCards = parseInt((_b = numberOfCardsField.data) !== null && _b !== void 0 ? _b : "", 2);
    results.units.forEach(cardResult => {
        deck.cards.push(cardFromUnitField(cardResult));
    });
    return deck;
}
exports.deckFromParser = deckFromParser;
/**
 * Translate a parser unit field into a Warno unit card
 *
 * @param unitField Parser unit field
 * @returns
 */
function cardFromUnitField(unitField) {
    var newCard = (0, warno_db_1.findUnitCard)(unitField.id);
    if (newCard === null) {
        newCard = new warno_db_1.UnitCard();
    }
    newCard.code = unitField.id;
    newCard.veterancy = unitField.xp;
    if (unitField.transport) {
        const transportCard = (0, warno_db_1.findUnitCard)(unitField.transport);
        newCard.transport = transportCard !== null && transportCard !== void 0 ? transportCard : new warno_db_1.UnitCard(`transport (${unitField.transport})`, unitField.transport, unitField.xp);
    }
    return newCard;
}

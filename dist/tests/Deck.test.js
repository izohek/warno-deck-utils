"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Deck_1 = require("../src/Deck");
test('test-deck-add-unit-by-id', () => {
    const deck = new Deck_1.Deck();
    const card = deck.addUnitWithId(410, 3);
    expect(card === null || card === void 0 ? void 0 : card.code).toBe(410);
    expect(card === null || card === void 0 ? void 0 : card.veterancy).toBe(3);
    expect(card === null || card === void 0 ? void 0 : card.transport).toBeUndefined();
    expect(deck.cards[0]).toBe(card);
    expect(deck.numberCards).toBe(1);
});
test('test-deck-add-unit-by-id-with-transport', () => {
    var _a;
    const deck = new Deck_1.Deck();
    const card = deck.addUnitWithId(359, 0, 500);
    expect(card === null || card === void 0 ? void 0 : card.code).toBe(359);
    expect(card === null || card === void 0 ? void 0 : card.veterancy).toBe(0);
    expect((_a = card === null || card === void 0 ? void 0 : card.transport) === null || _a === void 0 ? void 0 : _a.code).toBe(500);
    expect(deck.cards[0]).toBe(card);
    expect(deck.numberCards).toBe(1);
});
test('test-deck-add-unit-not-found', () => {
    const deck = new Deck_1.Deck();
    let card = deck.addUnitWithId(9999999, 0);
    expect(card).toBeNull();
    expect(deck.cards.length).toBe(0);
    expect(deck.numberCards).toBe(0);
    card = deck.addUnitWithId(-1, 0);
    expect(card).toBeNull();
    expect(deck.cards.length).toBe(0);
    expect(deck.numberCards).toBe(0);
});
test('test-deck-add-unit-not-found', () => {
    var _a;
    const deck = new Deck_1.Deck();
    const card = deck.addUnitWithId(359, 0, 999999);
    expect(card === null || card === void 0 ? void 0 : card.code).toBe(359);
    expect(card === null || card === void 0 ? void 0 : card.veterancy).toBe(0);
    expect((_a = card === null || card === void 0 ? void 0 : card.transport) === null || _a === void 0 ? void 0 : _a.code).toBeUndefined();
    expect(deck.cards[0]).toBe(card);
    expect(deck.numberCards).toBe(1);
});
test('test-add-unit-veterancy-constraints', () => {
    const deck = new Deck_1.Deck();
    let card = deck.addUnitWithId(410, -1);
    expect(card === null || card === void 0 ? void 0 : card.code).toBe(410);
    expect(card === null || card === void 0 ? void 0 : card.veterancy).toBe(0);
    expect(card === null || card === void 0 ? void 0 : card.transport).toBeUndefined();
    expect(deck.cards[0]).toBe(card);
    card = deck.addUnitWithId(410, 999);
    expect(card === null || card === void 0 ? void 0 : card.code).toBe(410);
    expect(card === null || card === void 0 ? void 0 : card.veterancy).toBe(3);
    expect(card === null || card === void 0 ? void 0 : card.transport).toBeUndefined();
    expect(deck.cards[1]).toBe(card);
    expect(deck.cards.length).toBe(2);
    expect(deck.numberCards).toBe(2);
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnownSteps = exports.DECK_FIELD_LENGTH_BITS = void 0;
/// Default number of bits per length field defining the size of the following data field.
exports.DECK_FIELD_LENGTH_BITS = 5;
/// Known parser steps
exports.KnownSteps = [
    'Header1',
    'Header2',
    'Division',
    'Num Cards',
    'Unit XP BC',
    'Units'
];

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Constants_1 = require("./Constants");
/**
 * Binary value in either string or number format.
 */
class BinaryValue {
    constructor(value) {
        if (typeof value === "string") {
            this.value = parseInt(value, 2);
        }
        else if (typeof value === "number") {
            this.value = value;
        }
    }
    /**
     * Get the binary represenation as a string with a specific amount of padding.
     *
     * @param pad number of 0s to left-pad
     * @returns
     */
    string(pad = Constants_1.DECK_FIELD_LENGTH_BITS) {
        var _a, _b;
        return (_b = (_a = this.value) === null || _a === void 0 ? void 0 : _a.toString(2).padStart(pad, '0')) !== null && _b !== void 0 ? _b : "";
    }
    /**
     * Get the integer represenation of the data.
     *
     * @returns
     */
    integerString() {
        if (this.value) {
            return parseInt(this.string(), 2);
        }
        else {
            return null;
        }
    }
}
exports.default = BinaryValue;

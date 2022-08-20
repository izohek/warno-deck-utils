import Deck from "./Deck";
import { DECK_FIELD_LENGTH_BITS } from "./Constants";

/**
 * Build a deck string from a Deck
 * 
 * @param deck 
 * @returns 
 */
export function encodeDeck(deck: Deck): string {
    if (!deck.division) {
        return "";
    }

    var output = "";

    // eugene static header
    output = encodeLengthLeadingValue(2)
           + encodeLengthLeadingValue(0);
    
    // division
    output += encodeLengthLeadingValue(deck.division.id);

    // number of cards in deckw
    output += encodeLengthLeadingValue(deck.cards.length);

    // unit xp length
    const xpLengths = deck.cards.map(function(card) {
        return card.veterancy.toString(2).length;
    });
    const xpBinaryLength = Math.max(...xpLengths)
        .toString(2)
        .length;
    output += encodeValue(xpBinaryLength);

    // unit id length
    const idBinaryLengths = deck.cards.map(function(card) {
        return card.code.toString(2).length;
    })
    const idBinaryLengthsMax = Math.max(...idBinaryLengths, 10);
    output += encodeValue(idBinaryLengthsMax.toString(2));

    // add units
    deck.cards.forEach(function(card) {
        output += encodeValue(card.veterancy, xpBinaryLength)
                + encodeValue(card.code, idBinaryLengthsMax)
                + encodeValue(card.transport?.code ?? 0, idBinaryLengthsMax);
    })

    // End
    output += encodeValue(1);

    // return output;
    return btoa(bitStringToText(output));
}

/**
 * Encode value into a binary string with a specified
 * number of padded zeros.
 * 
 * @param value string values assumed to be binary string representation
 * @param length minimum number of bits (start pad '0' until reaches this value)
 * @returns 
 */
function encodeValue(value: number | string, length: number = DECK_FIELD_LENGTH_BITS): string {
    if (typeof value === "number") {
        return value.toString(2).padStart(length, "0");
    } else {
        return value.padStart(length, '0');
    }
}

/**
 * Encode value with leading length.
 * 
 * [ {0-5} length of data, {5-data length} data ]
 * 
 * @param value 
 * @returns 
 */
function encodeLengthLeadingValue(value: number): string {
    const binaryStr = value.toString(2);
    return encodeValue(binaryStr.length)
         + binaryStr;
}

/**
 * Convert a binary string representation into a string representing
 * the utf-8 character value for each 8 bits.  If string is not evenly
 * divisible by 8, then the string will be zero padded at the end.
 *   
 * @param str 
 * @returns 
 */
function bitStringToText(str: string): string {
    var output = "";

    for (var i = 0; i < str.length; i+= 8) {
        var segment = str.substring(i, i + 8);
        if (segment.length < 8) {
            segment = segment.padEnd(8, '0');
        }
        output += String.fromCharCode(parseInt(segment, 2));
    }

    return output;
}

import Deck from './Deck';
import { DeckParserResults } from './DeckStringParser';
/**
 * Decode a Warno deckstring into a Deck
 *
 * @param deckString
 * @returns
 */
export declare function decodeDeckString(deckString: string): Deck;
/**
 * Create a warno deck from DeckParser parse results.
 *
 * @param results DeckParser parse() results
 * @returns
 */
export declare function deckFromParser(results: DeckParserResults): Deck;

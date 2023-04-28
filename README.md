# Warno Deck Utilities

## Install
```sh
    npm install @izohek/warno-deck-utils
```

## Features

### Decoding deck strings

Decode a deck string into a Deck.

```js
    try {
        const deck = decodeDeckString("DECK-STRING")
    } catch (err) {
        // handle parsing error
    }
```

#### Unit and Division Descriptors

Deck codes only encode numeric IDs for units and divisions as defined in `DeckSerializer.ndf` and do not encode any descriptor information.  In most other NDF files, units and divisions are referenced by their descriptors and not by their deck parsing IDs.  While not required to parse a deck string,
you can optionally provide a `LookupService` object to the `decodeDeckString` function to automatically include descriptor information from a decoded deck string.  

A `GenericLookupAdapter` class is provided, but you can also implement your own using the `LookupService` interface.

```js
    try {
        const lookupService = new GenericLookupAdapter(unitData, divisionData)
        const deck = decodeDeckString("DECK-STRING", lookupService)
    } catch (err) {
        // handle parsing error
    }
```

When each unit or division is parsed from a deck string, the decoder asks the adapter for a descriptor matching a decoded id
using the `public unitForId (id: number): string | undefined` or `public divisionForId (id: number): string | undefined` methods.  This interface allows implementers to provide their own custom unit and division databases and helps us decouple this decoder implementation from the raw data contained
in the NDF files.

### Encoding Decks into deck strings

Encode a deck into a deckstring

```js
    // Build deck
    const deck: SimpleDeck = {
        modded: false,
        division: {
            id: 1
        },
        numberCards: 2,
        cards: [
            { 
                veterancy: 1,
                unit: { id: 1 },
                transport: undefined
            },
            {
                veterancy: 2,
                unit: { id: 2 },
                transport: { id: 3 }
            }
        ]
    }

    // Encode
    const deckString = encodeDeck(deck)
```

## Development

### Build
```sh
npm run build
```

### Lint
```sh
npm run lint
```

### Test
```sh
npm run test
```

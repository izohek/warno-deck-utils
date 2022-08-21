# Warno Deck Utilities

## Install
```sh
    npm install @izohek/warno-deck-utils
```

## Build

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

### Encoding Decks into deck strings

Encode a deck into a deckstring

```js
    const deck: Deck = new Deck()
    // Build deck

    const deckString = encodeDeck(deck)
```

import Deck, { Company, Platoon, PlatoonPack } from './Deck'
import parseDeckString, { DeckFieldUnit, DeckParserResults } from './DeckStringParser'
import { UnitCard, findUnitCard, AllDivisions } from '@izohek/warno-db'

/**
 * Decode a Warno deckstring into a Deck
 *
 * @param deckString
 * @returns
 */
export function decodeDeckString (deckString: string): Deck {
    // Parse and decode
    const parserResults = parseDeckString(deckString)

    // Error check
    if (parserResults.error !== null) {
        throw parserResults.error
    }

    return deckFromParser(parserResults)
}

/**
 * Create a warno deck from DeckParser parse results.
 *
 * @param results DeckParser parse() results
 * @returns
 */
export function deckFromParser (results: DeckParserResults): Deck {
    const deck = new Deck()

    if (results.error != null) {
        return deck
    }

    // Indicates if deck code was generated from a modded game
    const moddedFlag = parseInt(results.steps[1].data as string ?? '', 2)
    deck.modded = moddedFlag === 1

    const divisionValue = parseInt(results.steps[2].data as string ?? '', 2)

    deck.division = AllDivisions.filter(function (item) {
        return item.id === divisionValue
    })[0]

    const numberOfCardsField = results.steps[3]
    deck.numberCards = parseInt(numberOfCardsField.data as string ?? '', 2)

    results.units.slice(0, deck.numberCards).forEach(cardResult => {
        deck.cards.push(
            cardFromUnitField(cardResult)
        )
    })

    const numberOfCompanies = results.combatGroups[0].dataBinary.value ?? 0
    if (numberOfCompanies > 0) {
        deck.combatGroup = {
            numberOfCompanies: results.combatGroups[0].dataBinary.value ?? 0,
            platoonMaxNumber: results.combatGroups[1].length,
            platoonMaxIndex: results.combatGroups[2].length,
            platoonMaxPack: results.combatGroups[3].length,
            companies: results.companies.map ( company => {
                return {
                    platoons: company.platoons.map( platoon => {
                        return {
                            packs: platoon.packs.map (pack => {
                                return {
                                    index: `${pack.id}`,
                                    count: pack.count,
                                    descriptor: deck.cards[pack.id].descriptor ?? undefined
                                } as PlatoonPack
                            })
                        } as Platoon
                    }) 
                } as Company
            })
        }
    }

    return deck
}

/**
 * Translate a parser unit field into a Warno unit card
 *
 * @param unitField Parser unit field
 * @returns
 */
function cardFromUnitField (unitField: DeckFieldUnit): UnitCard {
    const newCard = findUnitCard(unitField.id) ?? new UnitCard()

    newCard.code = unitField.id
    newCard.veterancy = unitField.xp

    if (unitField.transport != null && unitField.transport > 0) {
        const transportCard = findUnitCard(unitField.transport)
        newCard.transport = transportCard ?? new UnitCard(`transport (${unitField.transport})`, unitField.transport, unitField.xp)
    }

    return newCard
}

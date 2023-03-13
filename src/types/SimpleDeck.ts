/// Basic interface describing a unit or division
export interface IdDescriptorPair {
    id: number
    descriptor?: string
}

/// Basic interface describing a unit pack
export interface SimpleUnitCard {
    veterancy: number
    unit: IdDescriptorPair
    transport?: IdDescriptorPair
}

/// A simple deck defined by ids and optionally descriptors
export interface SimpleDeck {
    modded: boolean
    division: IdDescriptorPair
    numberCards: number
    cards: SimpleUnitCard[]
}

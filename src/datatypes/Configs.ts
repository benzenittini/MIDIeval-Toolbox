
import { getRandomKey } from "../utilities/Generators";
import { TimeSignature } from "./BasicTypes";
import { AUGMENTED_3, AUG_MAJOR_7, ChordQuality, DIMINISHED_3, DIMINISHED_7, DOMINANT_7, HALF_DIM_7, Key, MAJOR_3, MAJOR_7, MAJOR_KEY_LOOKUP, MINOR_3, MINOR_7, MINOR_MAJOR_7 } from "./ComplexTypes";


export enum MiscKeys {
    ANYTHING_GOES = '(Anything Goes)',
    RANDOM_KEY = '(Random Key)',
}
export type KeyConfigOpts = MiscKeys | keyof typeof MAJOR_KEY_LOOKUP;

export function convertKeyConfigToKey(keyConfig: KeyConfigOpts): Key | null {
    switch (keyConfig) {
        case MiscKeys.ANYTHING_GOES:
            return null;
        case MiscKeys.RANDOM_KEY:
            return getRandomKey();
        default:
            // All other options are already keys.
            return MAJOR_KEY_LOOKUP[keyConfig];
    }
}

export type ChordSelections = {
    // Triads
    includeTriads: boolean;
    includeMaj3: boolean;
    includeMin3: boolean;
    includeDim3: boolean;
    includeAug3: boolean;

    // Sevenths
    includeSevenths: boolean;
    includeMaj7: boolean;
    includeMin7: boolean;
    includeDom7: boolean;
    includeHalfDim7: boolean;
    includeDim7: boolean;
    includeMinMaj7: boolean;
    includeAugMaj7: boolean;
}

export type NotationConfiguration = {
    key: KeyConfigOpts;
    progressSelector: { type: 'midi' | 'timed', timedDuration: number },
    practiceSingleNotes: boolean;
    practiceChords: boolean;
    chordSelection: ChordSelections;
}

export type SightReadingConfiguration = {
    quickDifficulty: number;

    // Basics
    key: KeyConfigOpts;
    allowAccidentals: boolean;
    includeTrebleClef: boolean;
    includeBassClef: boolean;
    timeSignature: TimeSignature;

    // Difficulty
    tempo: number;
    playMetronome: boolean;
    waitForCorrectNote: boolean;
    allowRhythmicValues: boolean;
    /** Called "adjacent note distance" to user, but used as a general difficulty level when generating notes/chords. */
    adjacentNoteDistance: number;

    // Note/Chord Types
    practiceSingleNotes: boolean;
    practiceChords: boolean;
    includeBrokenChords: boolean;
    includeInvertedChords: boolean;
    chordSelection: ChordSelections;
}

export function getAllowedChordQualities(key: Key | null, config: ChordSelections): ChordQuality[] {
    const qualities: ChordQuality[] = [];

    // -- Triads --
    if (config.includeTriads) {
        if (config.includeMaj3) qualities.push(MAJOR_3);
        if (config.includeMin3) qualities.push(MINOR_3);
        if (config.includeDim3) qualities.push(DIMINISHED_3);
        // This requires no key to be set.
        if (config.includeAug3 && key === null) qualities.push(AUGMENTED_3);
    }

    // -- Sevenths --
    if (config.includeSevenths) {
        if (config.includeMaj7)     qualities.push(MAJOR_7);
        if (config.includeMin7)     qualities.push(MINOR_7);
        if (config.includeDom7)     qualities.push(DOMINANT_7);
        if (config.includeHalfDim7) qualities.push(HALF_DIM_7);
        // These require no key to be set.
        if (config.includeDim7    && key === null) qualities.push(DIMINISHED_7);
        if (config.includeMinMaj7 && key === null) qualities.push(MINOR_MAJOR_7);
        if (config.includeAugMaj7 && key === null) qualities.push(AUG_MAJOR_7);
    }

    return qualities;
}

import { getRandomKey } from "../utilities/Generators";
import { TimeSignature, ChordQuality, TriadQuality, SeventhQuality } from "./BasicTypes";
import { Key, MAJOR_KEY_LOOKUP } from "./ComplexTypes";


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

export type NotationConfiguration = {
    key: KeyConfigOpts;
    progressSelector: { type: 'midi' | 'timed', timedDuration: number },
    practiceSingleNotes: boolean;
    practiceChords: boolean;

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

export type SightReadingConfiguration = {
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

export function getAllowedChordQualities(key: Key | null, config: NotationConfiguration | SightReadingConfiguration): ChordQuality[] {
    const qualities: ChordQuality[] = [];

    // -- Triads --
    if (config.includeTriads) {
        if (config.includeMaj3) qualities.push(TriadQuality.MAJOR);
        if (config.includeMin3) qualities.push(TriadQuality.MINOR);
        if (config.includeDim3) qualities.push(TriadQuality.DIMINISHED);
        // This requires no key to be set.
        if (config.includeAug3 && key === null) qualities.push(TriadQuality.AUGMENTED);
    }

    // -- Sevenths --
    if (config.includeSevenths) {
        if (config.includeMaj7)     qualities.push(SeventhQuality.MAJOR_7);
        if (config.includeMin7)     qualities.push(SeventhQuality.MINOR_7);
        if (config.includeDom7)     qualities.push(SeventhQuality.DOMINANT_7);
        if (config.includeHalfDim7) qualities.push(SeventhQuality.HALF_DIM_7);
        // These require no key to be set.
        if (config.includeDim7    && key === null) qualities.push(SeventhQuality.DIMINISHED_7);
        if (config.includeMinMaj7 && key === null) qualities.push(SeventhQuality.MINOR_MAJOR_7);
        if (config.includeAugMaj7 && key === null) qualities.push(SeventhQuality.AUG_MAJOR_7);
    }

    return qualities;
}
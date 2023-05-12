import { getRandomKey } from "../utilities/Generators";
import { ChordQuality, Key, MajorKeys, SeventhQuality, TriadQuality } from "./Musics";

export enum MiscKeys {
    ALL_KEYS = '(All Keys)',
    RANDOM_KEY = '(Random Key)',
}
export type KeyConfigOpts = MiscKeys | MajorKeys;

export function convertKeyConfigToKey(keyConfig: KeyConfigOpts): Key | null {
    switch (keyConfig) {
        case MiscKeys.ALL_KEYS:
            return null;
        case MiscKeys.RANDOM_KEY:
            return getRandomKey();
        default:
            // All other options are already a keys.
            return keyConfig;
    }
}

export type NotationConfiguration = {
    key: KeyConfigOpts;
    progressSelector: { type: 'midi' | 'timed', timedDuration: number },
    includeSingleNotes: boolean;
    includeChords: boolean;

    // Triads
    includeTriads: boolean;
    includeMaj3: boolean;
    includeMin3: boolean;
    includeAug3: boolean;
    includeDim3: boolean;

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

export function getAllowedChordQualities(config: NotationConfiguration): ChordQuality[] {
    const qualities: ChordQuality[] = [];

    // -- Triads --
    if (config.includeTriads) {
        if (config.includeMaj3) qualities.push(TriadQuality.MAJOR);
        if (config.includeMin3) qualities.push(TriadQuality.MINOR);
        if (config.includeAug3) qualities.push(TriadQuality.AUGMENTED);
        if (config.includeDim3) qualities.push(TriadQuality.DIMINISHED);
    }

    // -- Sevenths --
    if (config.includeSevenths) {
        if (config.includeMaj7)     qualities.push(SeventhQuality.MAJOR_7);
        if (config.includeMin7)     qualities.push(SeventhQuality.MINOR_7);
        if (config.includeDom7)     qualities.push(SeventhQuality.DOMINANT_7);
        if (config.includeHalfDim7) qualities.push(SeventhQuality.HALF_DIM_7);
        if (config.includeDim7)     qualities.push(SeventhQuality.DIMINISHED_7);
        if (config.includeMinMaj7)  qualities.push(SeventhQuality.MINOR_MAJOR_7);
        if (config.includeAugMaj7)  qualities.push(SeventhQuality.AUG_MAJOR_7);
    }

    return qualities;
}
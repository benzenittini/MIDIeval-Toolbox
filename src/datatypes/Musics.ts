

// ===========
// Basic Notes
// -----------

export type Key = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';
export const KEYS: Key[] = [ 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B' ];
export enum RhythmicValue { WHOLE, HALF, QUARTER, EIGHTH, SIXTEENTH }
/** 0 only has A and B, 8 only has C. See: https://en.wikipedia.org/wiki/Octave#/media/File:Piano_Frequencies.svg */
export type Octave = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type Note = {
    key: Key;
    rhythmicValue: RhythmicValue;
    octave: Octave;
    isDotted: boolean; // Lengthens duration by 1/2 its original value.
};


// ======
// Chords
// ------

export enum TriadQuality {
    MAJOR = "maj",
    MINOR = "min",
    DIMINISHED = "dim",
    AUGMENTED = "aug",
}

export enum SeventhQuality {
    FULLY_DIM_7 = "fullDim7",
    HALF_DIM_7 = "halfDim7",
    MINOR_7 = "min7",
    MINOR_MAJOR_7 = "minMaj7",
    DOMINANT_7 = "dom7",
    MAJOR_7 = "maj7",
    AUG_MAJOR_7 = "augMaj7",
}

export type ChordQuality = TriadQuality | SeventhQuality;
export type Chord = {
    root: Note;
    quality: ChordQuality;
    /** 0 indicates root position */
    inversion: number;
}

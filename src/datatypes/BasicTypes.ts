
// ==========
// Note Types
// ----------

/** 0 only has A and B, 8 only has C. See: https://en.wikipedia.org/wiki/Octave#/media/File:Piano_Frequencies.svg */
export type Octave = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type Pitch = number;
export type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
export const PITCH_CLASSES: PitchClass[] = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ];


export enum RhythmicValue {
    WHOLE = 'whole',
    HALF = 'half',
    QUARTER = 'quarter',
    EIGHTH = 'eighth',
    SIXTEENTH = 'sixteenth'
};
export const RHYTHMIC_VALUES = Object.values(RhythmicValue);


// ===========
// Note Labels
// -----------

export enum Accidental { SHARP = '♯', FLAT = '♭', NATURAL = '♮' };

export type Letter = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
export const BASE_LETTERS: Letter[] = 'ABCDEFG'.split('') as Letter[];
export const BASE_LETTER_PCS: (Letter | null)[] = ['C', null, 'D', null, 'E', 'F', null, 'G', null, 'A', null, 'B'];


// ===========
// Chord Types
// -----------

export enum TriadQuality {
    MAJOR = "maj",
    MINOR = "min",
    DIMINISHED = "dim",
    AUGMENTED = "aug",
}
export const TRIAD_QUALITIES = Object.values(TriadQuality);

export enum SeventhQuality {
    MAJOR_7 = "maj7",
    MINOR_7 = "min7",
    DOMINANT_7 = "dom7",
    HALF_DIM_7 = "halfDim7",
    DIMINISHED_7 = "dim7",
    MINOR_MAJOR_7 = "minMaj7",
    AUG_MAJOR_7 = "augMaj7",
}
export const SEVENTH_QUALITIES = Object.values(SeventhQuality);

export type ChordQuality = TriadQuality | SeventhQuality;


// ===========
// Staff Types
// -----------

export type TimeSignature = { top: number, bottom: number };

export enum Clef { TREBLE, BASS };
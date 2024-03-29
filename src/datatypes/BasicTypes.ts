
// ==========
// Note Types
// ----------

export type Octave = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type Pitch = number;
export type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
export const PITCH_CLASSES: PitchClass[] = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ];


export enum RhythmicValue {
    WHOLE = 1,
    HALF = 1/2,
    QUARTER = 1/4,
    EIGHTH = 1/8
};
export const RHYTHMIC_VALUES = [RhythmicValue.WHOLE, RhythmicValue.HALF, RhythmicValue.QUARTER, RhythmicValue.EIGHTH];


// ===========
// Note Labels
// -----------

export enum Accidental { SHARP = '♯', FLAT = '♭', NATURAL = '♮' };

export type Letter = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
export const BASE_LETTERS: Letter[] = 'ABCDEFG'.split('') as Letter[];
export const BASE_LETTER_PCS: (Letter | null)[] = ['C', null, 'D', null, 'E', 'F', null, 'G', null, 'A', null, 'B'];


// ===========
// Staff Types
// -----------

export type TimeSignature = { top: number, bottom: number };

export enum Clef { TREBLE, BASS };
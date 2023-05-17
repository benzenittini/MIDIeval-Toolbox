
// ===========
// Pitch Class
// -----------

/** For convenience, when referring to a PitchClass. */
export const
    CFLAT = 11, C = 0,  CSHARP = 1,
    DFLAT = 1,  D = 2,  DSHARP = 3,
    EFLAT = 3,  E = 4,  ESHARP = 5,
    FFLAT = 4,  F = 5,  FSHARP = 6,
    GFLAT = 6,  G = 7,  GSHARP = 8,
    AFLAT = 8,  A = 9,  ASHARP = 10,
    BFLAT = 10, B = 11, BSHARP = 0;
export type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
export const PITCH_CLASSES: PitchClass[] = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ];


// ===========
// Basic Notes
// -----------

/** 0 only has A and B, 8 only has C. See: https://en.wikipedia.org/wiki/Octave#/media/File:Piano_Frequencies.svg */
export type Octave = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export enum RhythmicValue { WHOLE, HALF, QUARTER, EIGHTH, SIXTEENTH }

export type Note = {
    pitchClass: PitchClass;
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
export type Chord = {
    root: Note;
    quality: ChordQuality;
    /** 0 indicates root position */
    inversion: number;
}


// ====
// Keys
// ----

export enum MajorKeys {
    CFLAT_MAJOR  = 'C♭ Major',
    C_MAJOR      = 'C Major',
    CSHARP_MAJOR = 'C♯ Major',
    DFLAT_MAJOR  = 'D♭ Major',
    D_MAJOR      = 'D Major',
    EFLAT_MAJOR  = 'E♭ Major',
    E_MAJOR      = 'E Major',
    F_MAJOR      = 'F Major',
    FSHARP_MAJOR = 'F♯ Major',
    GFLAT_MAJOR  = 'G♭ Major',
    G_MAJOR      = 'G Major',
    AFLAT_MAJOR  = 'A♭ Major',
    A_MAJOR      = 'A Major',
    BFLAT_MAJOR  = 'B♭ Major',
    B_MAJOR      = 'B Major',
}
export type Key = MajorKeys /* | MinorKeys */;

export const MAJOR_KEYS = Object.values(MajorKeys);
export const KEYS = Object.values(MajorKeys) /* | Object.values(MinorKeys) */;

export const KeyToRootPitchClass: Record<Key, PitchClass> = {
    [MajorKeys.CFLAT_MAJOR]: CFLAT,    [MajorKeys.C_MAJOR]: C,    [MajorKeys.CSHARP_MAJOR]: CSHARP,
    [MajorKeys.DFLAT_MAJOR]: DFLAT,    [MajorKeys.D_MAJOR]: D,    /* No D Sharp Major */
    [MajorKeys.EFLAT_MAJOR]: EFLAT,    [MajorKeys.E_MAJOR]: E,    /* No E Sharp Major */
    /* No F Flat Major */              [MajorKeys.F_MAJOR]: F,    [MajorKeys.FSHARP_MAJOR]: FSHARP,
    [MajorKeys.GFLAT_MAJOR]: GFLAT,    [MajorKeys.G_MAJOR]: G,    /* No G Sharp Major */
    [MajorKeys.AFLAT_MAJOR]: AFLAT,    [MajorKeys.A_MAJOR]: A,    /* No A Sharp Major */
    [MajorKeys.BFLAT_MAJOR]: BFLAT,    [MajorKeys.B_MAJOR]: B,    /* No B Sharp Major */
}
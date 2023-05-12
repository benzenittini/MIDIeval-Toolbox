
import { Chord, ChordQuality, PITCH_CLASSES, PitchClass, Note, Octave, RhythmicValue, SeventhQuality, TriadQuality, C, A, Key, MajorKeys, B, D, E, F, G, CFLAT, FFLAT, EFLAT, DFLAT, GFLAT, AFLAT, BFLAT, CSHARP, DSHARP, ESHARP, FSHARP, GSHARP, ASHARP, BSHARP, PITCH_LOOKUP } from "../datatypes/Musics";
import { clamp } from "./NumUtils";


// ===============
// Factory Methods
// ---------------

export function createNote(
    pitchClass: PitchClass,
    rhythmicValue: RhythmicValue = RhythmicValue.QUARTER,
    octave: Octave = 4,
    isDotted: boolean = false
): Note {
    return { pitchClass, rhythmicValue, octave: sanitizeOctave(pitchClass, octave), isDotted };
}


export function createChord(
    root: Note,
    quality: ChordQuality,
    inversion: number = 0
): Chord {
    return { root, quality, inversion };
}


// ====================
// Modification Methods
// --------------------

export function stepUpPitch(pitchClass: PitchClass, halfSteps: number): PitchClass {
    let newPitchIndex = PITCH_CLASSES.indexOf(pitchClass) + halfSteps;
    newPitchIndex %= PITCH_CLASSES.length;
    if (newPitchIndex < 0) {
        newPitchIndex += PITCH_CLASSES.length;
    }
    return PITCH_CLASSES[newPitchIndex];
}

/**
 * Returns a new note, which is the result of moving the provided note up/down the
 * provided number of half steps. The octave on the returned note is adjusted, but
 * clamped between 0 and 8.
 */
export function stepUpNote(note: Note, halfSteps: number): Note {
    let newPitchIndex = PITCH_CLASSES.indexOf(note.pitchClass) + halfSteps;
    let octaveShift = Math.floor(newPitchIndex / PITCH_CLASSES.length);
    newPitchIndex %= PITCH_CLASSES.length;

    if (newPitchIndex < 0) {
        newPitchIndex += PITCH_CLASSES.length;
        octaveShift--;
    }

    return {
        pitchClass: PITCH_CLASSES[newPitchIndex],
        rhythmicValue: note.rhythmicValue,
        octave: sanitizeOctave(PITCH_CLASSES[newPitchIndex], note.octave + octaveShift),
        isDotted: note.isDotted,
    }
}

/**
 * Clamps the provided octave between 0 and 8, taking into consideration that
 * octave 0 only has the "A" key and octave 8 only has the "C" key (on an 88-
 * key piano).
 */
export function sanitizeOctave(pitchClass: PitchClass, dirtyOctave: number): Octave {
    let octave: Octave = clamp(dirtyOctave, 0, 8) as Octave;

    if (octave === 0 && pitchClass !== A) {
        octave = 1;
    } else if (octave === 8 && pitchClass !== C) {
        octave = 7;
    }

    return octave;
}


// ==================
// Calculator Methods
// ------------------

export function getChordNotes(chord: Chord): Note[] {
    let notes: Note[];
    // Start with the base notes
    switch (chord.quality) {
        // -- Triads --
        case TriadQuality.DIMINISHED: notes = getSpacedNotes(chord.root, 3, 6); break;
        case TriadQuality.MINOR:      notes = getSpacedNotes(chord.root, 3, 7); break;
        case TriadQuality.MAJOR:      notes = getSpacedNotes(chord.root, 4, 7); break;
        case TriadQuality.AUGMENTED:  notes = getSpacedNotes(chord.root, 4, 8); break;

        // -- Sevenths --
        case SeventhQuality.DIMINISHED_7:  notes = getSpacedNotes(chord.root, 3, 6, 9);  break;
        case SeventhQuality.HALF_DIM_7:    notes = getSpacedNotes(chord.root, 3, 6, 10); break;
        case SeventhQuality.MINOR_7:       notes = getSpacedNotes(chord.root, 3, 7, 10); break;
        case SeventhQuality.MINOR_MAJOR_7: notes = getSpacedNotes(chord.root, 3, 7, 11); break;
        case SeventhQuality.DOMINANT_7:    notes = getSpacedNotes(chord.root, 4, 7, 10); break;
        case SeventhQuality.MAJOR_7:       notes = getSpacedNotes(chord.root, 4, 7, 11); break;
        case SeventhQuality.AUG_MAJOR_7:   notes = getSpacedNotes(chord.root, 4, 8, 11); break;
    }

    // Now adjust based on the inversion
    if (chord.inversion < 0) {
        throw new Error("Inversion cannot be negative");
    }
    let noteToInvert = 0; // First inversion moves the root note
    for (let i = chord.inversion; i > 0; i--) {
        // Move the bottom-most note up one octave
        notes[noteToInvert].octave = sanitizeOctave(notes[noteToInvert].pitchClass, notes[noteToInvert].octave + 1);
        noteToInvert = (noteToInvert + 1) % notes.length; // Prep for the next iteration
    }

    return notes;
}

export function getSpacedNotes(root: Note, ...halfSteps: number[]): Note[] {
    return [{...root}, ...halfSteps.map(steps => stepUpNote(root, steps))];
}

export function getStringNotation(key: Key, obj: Note | Chord): string {
    return ('root' in obj)
        ? pitchClassToLetter(key, obj.root.pitchClass) + obj.quality // Chord
        : pitchClassToLetter(key, obj.pitchClass);                   // Note
}

export function pitchClassToLetter(key: Key, pitchClass: PitchClass): string {
    return PITCH_LOOKUP[key][pitchClass];
}

export function getScale(key: Key): PitchClass[] {
    switch (key) {
        // -- Major Keys --
        case MajorKeys.CFLAT_MAJOR:  return [CFLAT,  DFLAT,  EFLAT,  FFLAT,  GFLAT,  AFLAT,  BFLAT];
        case MajorKeys.C_MAJOR:      return [C,      D,      E,      F,      G,      A,      B];
        case MajorKeys.CSHARP_MAJOR: return [CSHARP, DSHARP, ESHARP, FSHARP, GSHARP, ASHARP, BSHARP];
        case MajorKeys.DFLAT_MAJOR:  return [DFLAT,  EFLAT,  F,      GFLAT,  AFLAT,  BFLAT,  C];
        case MajorKeys.D_MAJOR:      return [D,      E,      FSHARP, G,      A,      B,      CSHARP];
        case MajorKeys.EFLAT_MAJOR:  return [EFLAT,  F,      G,      AFLAT,  BFLAT,  C,      D];
        case MajorKeys.E_MAJOR:      return [E,      FSHARP, GSHARP, A,      B,      CSHARP, DSHARP];
        case MajorKeys.F_MAJOR:      return [F,      G,      A,      BFLAT,  C,      D,      E];
        case MajorKeys.FSHARP_MAJOR: return [FSHARP, GSHARP, ASHARP, B,      CSHARP, DSHARP, ESHARP];
        case MajorKeys.GFLAT_MAJOR:  return [GFLAT,  AFLAT,  BFLAT,  CFLAT,  DFLAT,  EFLAT,  F];
        case MajorKeys.G_MAJOR:      return [G,      A,      B,      C,      D,      E,      FSHARP];
        case MajorKeys.AFLAT_MAJOR:  return [AFLAT,  BFLAT,  C,      DFLAT,  EFLAT,  F,      G];
        case MajorKeys.A_MAJOR:      return [A,      B,      CSHARP, D,      E,      FSHARP, GSHARP];
        case MajorKeys.BFLAT_MAJOR:  return [BFLAT,  C,      D,      EFLAT,  F,      G,      A];
        case MajorKeys.B_MAJOR:      return [B,      CSHARP, DSHARP, E,      FSHARP, GSHARP, ASHARP];

        // -- Minor Keys --
        // (Coming soon?)

        // -- Misc --
        default:
            throw new Error(`Unsupported key: ${key}.`);
    }
}
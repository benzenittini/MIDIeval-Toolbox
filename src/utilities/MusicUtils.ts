
import { Chord, ChordQuality, KEYS, Key, Note, Octave, RhythmicValue, SeventhQuality, TriadQuality } from "../datatypes/Musics";
import { clamp } from "./NumUtils";


// ===============
// Factory Methods
// ---------------

export function createNote(
    key: Key,
    rhythmicValue: RhythmicValue = RhythmicValue.QUARTER,
    octave: Octave = 4,
    isDotted: boolean = false
): Note {
    return { key, rhythmicValue, octave: sanitizeOctave(key, octave), isDotted };
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

export function stepUpKey(key: Key, halfSteps: number): Key {
    let newKeyIndex = KEYS.indexOf(key) + halfSteps;
    newKeyIndex %= KEYS.length;
    if (newKeyIndex < 0) {
        newKeyIndex += KEYS.length;
    }
    return KEYS[newKeyIndex];
}

/**
 * Returns a new note, which is the result of moving the provided note up/down the
 * provided number of half steps. The octave on the returned note is adjusted, but
 * clamped between 0 and 8.
 */
export function stepUpNote(note: Note, halfSteps: number): Note {
    let newKeyIndex = KEYS.indexOf(note.key) + halfSteps;
    let octaveShift = Math.floor(newKeyIndex / KEYS.length);
    newKeyIndex %= KEYS.length;

    if (newKeyIndex < 0) {
        newKeyIndex += KEYS.length;
        octaveShift--;
    }

    return {
        key: KEYS[newKeyIndex],
        rhythmicValue: note.rhythmicValue,
        octave: sanitizeOctave(KEYS[newKeyIndex], note.octave + octaveShift),
        isDotted: note.isDotted,
    }
}

/**
 * Clamps the provided octave between 0 and 8, taking into consideration that
 * octave 0 only has the "A" key and octave 8 only has thee "C" key (on an 88-
 * key piano).
 */
export function sanitizeOctave(key: Key, dirtyOctave: number): Octave {
    let octave: Octave = clamp(dirtyOctave, 0, 8) as Octave;

    if (octave === 0 && key !== 'A') {
        octave = 1;
    } else if (octave === 8 && key !== 'C') {
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
        case TriadQuality.DIMINISHED:
            notes = [ {...chord.root}, stepUpNote(chord.root, 3), stepUpNote(chord.root, 6), ];
            break;
        case TriadQuality.MINOR:
            notes = [ {...chord.root}, stepUpNote(chord.root, 3), stepUpNote(chord.root, 7), ];
            break;
        case TriadQuality.MAJOR:
            notes = [ {...chord.root}, stepUpNote(chord.root, 4), stepUpNote(chord.root, 7), ];
            break;
        case TriadQuality.AUGMENTED:
            notes = [ {...chord.root}, stepUpNote(chord.root, 4), stepUpNote(chord.root, 8), ];
            break;

        // -- Sevenths --
        case SeventhQuality.FULLY_DIM_7:
            notes = [ {...chord.root}, stepUpNote(chord.root, 3), stepUpNote(chord.root, 6), stepUpNote(chord.root, 9), ];
            break;
        case SeventhQuality.HALF_DIM_7:
            notes = [ {...chord.root}, stepUpNote(chord.root, 3), stepUpNote(chord.root, 6), stepUpNote(chord.root, 10), ];
            break;
        case SeventhQuality.MINOR_7:
            notes = [ {...chord.root}, stepUpNote(chord.root, 3), stepUpNote(chord.root, 7), stepUpNote(chord.root, 10), ];
            break;
        case SeventhQuality.MINOR_MAJOR_7:
            notes = [ {...chord.root}, stepUpNote(chord.root, 3), stepUpNote(chord.root, 7), stepUpNote(chord.root, 11), ];
            break;
        case SeventhQuality.DOMINANT_7:
            notes = [ {...chord.root}, stepUpNote(chord.root, 4), stepUpNote(chord.root, 7), stepUpNote(chord.root, 10), ];
            break;
        case SeventhQuality.MAJOR_7:
            notes = [ {...chord.root}, stepUpNote(chord.root, 4), stepUpNote(chord.root, 7), stepUpNote(chord.root, 11), ];
            break;
        case SeventhQuality.AUG_MAJOR_7:
            notes = [ {...chord.root}, stepUpNote(chord.root, 4), stepUpNote(chord.root, 8), stepUpNote(chord.root, 11), ];
            break;
    }

    // Now adjust based on the inversion
    if (chord.inversion < 0) {
        throw new Error("Inversion cannot be negative");
    }
    let noteToInvert = 0; // First inversion moves the root note
    for (let i = chord.inversion; i > 0; i--) {
        // Move the bottom-most note up one octave
        notes[noteToInvert].octave = sanitizeOctave(notes[noteToInvert].key, notes[noteToInvert].octave + 1);
        noteToInvert = (noteToInvert + 1) % notes.length; // Prep for the next iteration
    }

    return notes;
}
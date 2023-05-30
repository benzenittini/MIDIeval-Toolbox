
import { Chord, ChordQuality, PITCH_CLASSES, PitchClass, Note, Octave, RhythmicValue, SeventhQuality, TriadQuality, C, A, Key, MAJOR_KEYS, KeyToRootPitchClass, TimeSignature, Sound, MajorKeys, Clef } from "../datatypes/Musics";
import { clamp } from "./NumUtils";


// ===============
// Factory Methods
// ---------------

/**
 * Convenience function for creating a note.
 */
export function createNote(
    pitchClass: PitchClass,
    rhythmicValue: RhythmicValue = RhythmicValue.QUARTER,
    octave: Octave = 4,
    isDotted: boolean = false
): Note {
    return { pitchClass, rhythmicValue, octave: sanitizeOctave(pitchClass, octave), isDotted };
}

/**
 * Convenience function for creating a chord.
 */
export function createChord(
    root: Note,
    quality: ChordQuality,
    inversion: number = 0
): Chord {
    return { root, quality, inversion };
}


export function isANote(sound: Sound): sound is Note {
    return 'pitchClass' in sound;
}

export function isAChord(sound: Sound): sound is Chord {
    return 'root' in sound;
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

export function getChordsInKey(key: Key) {
    let scale = getScale(key);
    if (MAJOR_KEYS.includes(key)) {
        return [
            // -- Triads --
            createChord(createNote(scale[0]), TriadQuality.MAJOR),
            createChord(createNote(scale[1]), TriadQuality.MINOR),
            createChord(createNote(scale[2]), TriadQuality.MINOR),
            createChord(createNote(scale[3]), TriadQuality.MAJOR),
            createChord(createNote(scale[4]), TriadQuality.MAJOR),
            createChord(createNote(scale[5]), TriadQuality.MINOR),
            createChord(createNote(scale[6]), TriadQuality.DIMINISHED),
            // -- Sevenths --
            createChord(createNote(scale[0]), SeventhQuality.MAJOR_7),
            createChord(createNote(scale[1]), SeventhQuality.MINOR_7),
            createChord(createNote(scale[2]), SeventhQuality.MINOR_7),
            createChord(createNote(scale[3]), SeventhQuality.MAJOR_7),
            createChord(createNote(scale[4]), SeventhQuality.DOMINANT_7),
            createChord(createNote(scale[5]), SeventhQuality.MINOR_7),
            createChord(createNote(scale[6]), SeventhQuality.HALF_DIM_7),
        ];
    } else {
        throw new Error(`Unrecognized key: ${key}`);
    }
}

export function getScale(key: Key): PitchClass[] {
    let rootPitchClass = KeyToRootPitchClass[key];

    // -- Major Keys --
    if (MAJOR_KEYS.includes(key)) {
        return [
            PITCH_CLASSES[(rootPitchClass + 0) % 12],
            PITCH_CLASSES[(rootPitchClass + 2) % 12],
            PITCH_CLASSES[(rootPitchClass + 4) % 12],
            PITCH_CLASSES[(rootPitchClass + 5) % 12],
            PITCH_CLASSES[(rootPitchClass + 7) % 12],
            PITCH_CLASSES[(rootPitchClass + 9) % 12],
            PITCH_CLASSES[(rootPitchClass + 11) % 12],
        ];
    }

    // -- Minor Keys --
    // (Coming soon?)

    throw new Error(`Unsupported key: ${key}.`);
}

export function describeChordQuality(chordQuality: ChordQuality): string {
    switch (chordQuality) {
        // -- Triads --
        case TriadQuality.DIMINISHED: return 'Diminished Triad = minor third with a diminished fifth.';
        case TriadQuality.MINOR:      return 'Minor Triad = minor third with a perfect fifth.';
        case TriadQuality.MAJOR:      return 'Major Triad = major third with a perfect fifth.';
        case TriadQuality.AUGMENTED:  return 'Augmented Triad = major third with an augmented fifth.';

        // -- Sevenths --
        case SeventhQuality.DIMINISHED_7:  return 'Fully-Diminished Seventh = minor third, diminished fifth, and a diminished seventh.';
        case SeventhQuality.HALF_DIM_7:    return 'Half-Diminished Seventh = minor third, diminished fifth, and a minor seventh.';
        case SeventhQuality.MINOR_7:       return 'Minor 7 = minor third, perfect fifth, and a minor seventh.';
        case SeventhQuality.MINOR_MAJOR_7: return 'Minor Major 7 = minor third, perfect fifth, and a major seventh.';
        case SeventhQuality.DOMINANT_7:    return 'Dominant 7 = major third, perfect fifth, and a minor seventh.';
        case SeventhQuality.MAJOR_7:       return 'Major 7 = major third, perfect fifth, and a major seventh.';
        case SeventhQuality.AUG_MAJOR_7:   return 'Augmented Major 7 = major third, augmented fifth, and a major seventh.';
    }
}

export function getBeatCount(timeSignature: TimeSignature, sound: Sound) {
    let note = ("root" in sound) ? sound.root : sound;
    switch (note.rhythmicValue) {
        case RhythmicValue.WHOLE:     return timeSignature.bottom / 1;
        case RhythmicValue.HALF:      return timeSignature.bottom / 2;
        case RhythmicValue.QUARTER:   return timeSignature.bottom / 4;
        case RhythmicValue.EIGHTH:    return timeSignature.bottom / 8;
        case RhythmicValue.SIXTEENTH: return timeSignature.bottom / 16;
    }
}

import { Chord, ChordQuality, PITCH_CLASSES, PitchClass, Note, Octave, RhythmicValue, SeventhQuality, TriadQuality, C, A, Key, MajorKeys, B, D, E, F, G, CFLAT, FFLAT, EFLAT, DFLAT, GFLAT, AFLAT, BFLAT, CSHARP, DSHARP, ESHARP, FSHARP, GSHARP, ASHARP, BSHARP, PITCH_LOOKUP, MAJOR_KEYS, KeyToRootPitchClass } from "../datatypes/Musics";
import { randomItemFrom } from "./ArrayUtils";
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

export function getSpacedNotes(root: Note, ...halfSteps: number[]): Note[] {
    return [{...root}, ...halfSteps.map(steps => stepUpNote(root, steps))];
}

export function getStringNotation(key: Key | null, obj: Note | Chord): string {
    return ('root' in obj)
        ? /* Chord */ pitchClassToLetter(key, obj.root.pitchClass) + getQualityNotation(obj.quality)
        : /* Note  */ pitchClassToLetter(key, obj.pitchClass);
}

export function getQualityNotation(quality: ChordQuality): string {
    // TODO-ben : Add more notations, and allow for "sub- super- script" notations.
    switch (quality) {
        // -- Triads --
        case TriadQuality.MAJOR:      return randomItemFrom(['maj']);
        case TriadQuality.MINOR:      return randomItemFrom(['min']);
        case TriadQuality.DIMINISHED: return randomItemFrom(['dim']);
        case TriadQuality.AUGMENTED:  return randomItemFrom(['aug']);

        // -- Sevenths --
        case SeventhQuality.MAJOR_7:       return randomItemFrom(['maj7']);
        case SeventhQuality.MINOR_7:       return randomItemFrom(['min7', '-7']);
        case SeventhQuality.DOMINANT_7:    return randomItemFrom(['7']);
        case SeventhQuality.HALF_DIM_7:    return randomItemFrom(['𝆩7', '-7♭5']);
        case SeventhQuality.DIMINISHED_7:  return randomItemFrom(['o7']); // ('o' should be superscript...)
        case SeventhQuality.MINOR_MAJOR_7: return randomItemFrom(['minMaj7', 'mM7']);
        case SeventhQuality.AUG_MAJOR_7:   return randomItemFrom(['augMaj7']);
    }
}

export function pitchClassToLetter(key: Key | null, pitchClass: PitchClass): string {
    if (key === null) {
        switch (pitchClass) {
            case 0:  return randomItemFrom(['C', 'B♯']);
            case 1:  return randomItemFrom(['C♯', 'D♭']);
            case 2:  return randomItemFrom(['D']);
            case 3:  return randomItemFrom(['D♯', 'E♭']);
            case 4:  return randomItemFrom(['E', 'F♭']);
            case 5:  return randomItemFrom(['F', 'E♯']);
            case 6:  return randomItemFrom(['F♯', 'G♭']);
            case 7:  return randomItemFrom(['G']);
            case 8:  return randomItemFrom(['G♯', 'A♭']);
            case 9:  return randomItemFrom(['A']);
            case 10: return randomItemFrom(['A♯', 'B♭']);
            case 11: return randomItemFrom(['B', 'C♭']);
        }
    } else {
        return PITCH_LOOKUP[key][pitchClass];
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
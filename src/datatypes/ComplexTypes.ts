
import { randomItemFrom } from "../utilities/ArrayUtils";
import { Accidental, BASE_LETTERS, BASE_LETTER_PCS, Letter, Octave, PITCH_CLASSES, Pitch, PitchClass, RhythmicValue, TimeSignature } from "./BasicTypes";


// ===========
// Sound Types
// -----------

export abstract class Sound {

    abstract getNotes(): Note[];
    abstract toString(key?: Key | null): string;
    abstract getRhythmicValue(): RhythmicValue;

    getBeatCount(timeSignature: TimeSignature): number {
        switch (this.getRhythmicValue()) {
            case RhythmicValue.WHOLE:     return timeSignature.bottom / 1;
            case RhythmicValue.HALF:      return timeSignature.bottom / 2;
            case RhythmicValue.QUARTER:   return timeSignature.bottom / 4;
            case RhythmicValue.EIGHTH:    return timeSignature.bottom / 8;
            case RhythmicValue.SIXTEENTH: return timeSignature.bottom / 16;
        }
    }
}


// ==========
// Note Types
// ----------

export class Note extends Sound {

    public pitch: Pitch;
    public rhythmicValue: RhythmicValue;
    public isDotted: boolean; // Lengthens duration by 1/2 its original value.
    private label?: NoteLabel;

    constructor(pitch: Pitch, rhythmicValue: RhythmicValue = RhythmicValue.QUARTER, isDotted: boolean = false, label?: NoteLabel) {
        super();
        this.pitch = pitch;
        this.rhythmicValue = rhythmicValue;
        this.isDotted = isDotted;
        this.label = label;
    }

    // -- Parent Functions --
    toString(key?: Key | null): string { return this.getLabel(key).toString(); }
    getNotes(): Note[] { return [this]; }
    getRhythmicValue(): RhythmicValue { return this.rhythmicValue; }

    // -- Object-related --
    clone(): Note { return new Note(this.pitch, this.rhythmicValue, this.isDotted, this.label); }
    equals(other: Note) {
        return this.pitch === other.pitch &&
            this.rhythmicValue === other.rhythmicValue &&
            this.isDotted === other.isDotted &&
            this.label === other.label;
    }

    // -- Pitch-related --
    getPitchClass(): PitchClass { return this.pitch % PITCH_CLASSES.length as PitchClass; }
    getOctave():     Octave     { return Math.floor(this.pitch / PITCH_CLASSES.length)-1 as Octave; }

    // -- Label-related --
    hasLabel(): boolean { return this.label !== undefined; }
    getLabel(key?: Key | null): NoteLabel {
        if (this.label !== undefined) return this.label;
        if (key) {
            const inKey = key.getNoteLabelsInKey()[this.getPitchClass()]
            if (inKey !== null) return inKey;
        }
        return PITCH_CLASS_TO_LABELS[this.getPitchClass()][0] // Just takes the first option. To be "more correct", manually set the label.
    }
    setLabel(newLabel?: NoteLabel): void { this.label = newLabel; }

    // -- Manipulation --
    stepUp(halfSteps: number): Note {
        this.pitch += halfSteps;
        return this;
    }

    // -- Static Functions --
    static convertToPitch(octave: Octave, pitchClass: PitchClass): Pitch { return (octave+1) * PITCH_CLASSES.length + pitchClass; }
    static getSpacedNotes(root: Note, ...halfSteps: number[]): Note[]    { return [root.clone(), ...halfSteps.map(steps => root.clone().stepUp(steps))]; }
}


// ================
// Note Label Types
// ----------------

export class NoteLabel {

    readonly letter: Letter;
    readonly accidental: Accidental;
    readonly pitchClass: PitchClass;

    constructor(letter: Letter, accidental: Accidental) {
        this.letter = letter;
        this.accidental = accidental;

        this.pitchClass = BASE_LETTER_PCS.indexOf(this.letter) as PitchClass;
        if      (this.accidental === Accidental.FLAT)  this.pitchClass--;
        else if (this.accidental === Accidental.SHARP) this.pitchClass++;
        // To make sure it stays positive and in the range [0,11]
        this.pitchClass = (this.pitchClass + PITCH_CLASSES.length) % PITCH_CLASSES.length as PitchClass;
    }

    toString(): string { return this.letter + ((this.accidental === Accidental.NATURAL) ? '' : this.accidental); }

    /** Returns the interval between two note letters. "1" === root, "3" === third, "5" === fifth, ... */
    getInterval(other: NoteLabel) { return Math.abs(BASE_LETTERS.indexOf(this.letter) - BASE_LETTERS.indexOf(other.letter)) + 1; }

    getDisplayedAccidental(lettersToAccidentals: Record<Letter, Accidental>): Accidental | null {
        return (lettersToAccidentals[this.letter] === this.accidental)
            ? null // No accidental displayed if we're in the current key.
            : this.accidental;
    }

    equals(other: NoteLabel) { return this.letter === other.letter && this.accidental === other.accidental; }
}

// -- All NoteLabel Constants --
export const C_FLAT  = new NoteLabel('C', Accidental.FLAT);
export const C       = new NoteLabel('C', Accidental.NATURAL);
export const C_SHARP = new NoteLabel('C', Accidental.SHARP);
export const D_FLAT  = new NoteLabel('D', Accidental.FLAT);
export const D       = new NoteLabel('D', Accidental.NATURAL);
export const D_SHARP = new NoteLabel('D', Accidental.SHARP);
export const E_FLAT  = new NoteLabel('E', Accidental.FLAT);
export const E       = new NoteLabel('E', Accidental.NATURAL);
export const E_SHARP = new NoteLabel('E', Accidental.SHARP);
export const F_FLAT  = new NoteLabel('F', Accidental.FLAT);
export const F       = new NoteLabel('F', Accidental.NATURAL);
export const F_SHARP = new NoteLabel('F', Accidental.SHARP);
export const G_FLAT  = new NoteLabel('G', Accidental.FLAT);
export const G       = new NoteLabel('G', Accidental.NATURAL);
export const G_SHARP = new NoteLabel('G', Accidental.SHARP);
export const A_FLAT  = new NoteLabel('A', Accidental.FLAT);
export const A       = new NoteLabel('A', Accidental.NATURAL);
export const A_SHARP = new NoteLabel('A', Accidental.SHARP);
export const B_FLAT  = new NoteLabel('B', Accidental.FLAT);
export const B       = new NoteLabel('B', Accidental.NATURAL);
export const B_SHARP = new NoteLabel('B', Accidental.SHARP);

// All NoteLabels packed into an array
export const NOTE_LABELS = [
    C_FLAT, C, C_SHARP,
    D_FLAT, D, D_SHARP,
    E_FLAT, E, E_SHARP,
    F_FLAT, F, F_SHARP,
    G_FLAT, G, G_SHARP,
    A_FLAT, A, A_SHARP,
    B_FLAT, B, B_SHARP,
]

/**
 * Pitch class mapped to an array of NoteLetters for that pitch class.
 * Ex: pitch class of "0" is both "C" and "B#"
 */
export const PITCH_CLASS_TO_LABELS: NoteLabel[][] = [];
NOTE_LABELS.forEach(nl => {
    if (!PITCH_CLASS_TO_LABELS[nl.pitchClass])
        PITCH_CLASS_TO_LABELS[nl.pitchClass] = [];
    PITCH_CLASS_TO_LABELS[nl.pitchClass].push(nl);
});


// ===================
// Chord Quality Types
// -------------------

export class ChordQuality {

    notations: string[];
    description: string;
    noteGaps: number[];

    constructor(noteGaps: number[], notations: string[], description: string) {
        this.noteGaps = noteGaps;
        this.notations = notations;
        this.description = description;
    }

    getNotes(root: any): Note[] { return Note.getSpacedNotes(root, ...this.noteGaps); }
    getNotation():       string { return randomItemFrom(this.notations); }
    getDescription():    string { return this.description; }
}

// -- Chord Quality Instances --
export const MAJOR_3      = new ChordQuality([4, 7], ['maj', '', 'M', 'Δ'],                                       'Major Triad = major third with a perfect fifth.');
export const MINOR_3      = new ChordQuality([3, 7], ['min', 'm', '-'],                                           'Minor Triad = minor third with a perfect fifth.');
export const DIMINISHED_3 = new ChordQuality([3, 6], ['dim', '<sup>○</sup>', 'm<sup>♭5</sup>', 'm<sup>○5</sup>'], 'Diminished Triad = minor third with a diminished fifth.');
export const AUGMENTED_3  = new ChordQuality([4, 8], ['aug', '+', 'maj<sup>♯5</sup>', 'maj<sup>+5</sup>'],        'Augmented Triad = major third with an augmented fifth.');

export const DIMINISHED_7  = new ChordQuality([3, 6, 9],  ['<sup>○</sup>7'],                        'Fully-Diminished Seventh = minor third, diminished fifth, and a diminished seventh.');
export const HALF_DIM_7    = new ChordQuality([3, 6, 10], ['<sup>∅</sup>7', '-7<sup>♭5</sup>'],     'Half-Diminished Seventh = minor third, diminished fifth, and a minor seventh.');
export const MINOR_7       = new ChordQuality([3, 7, 10], ['m<sup>7</sup>', '-7'],                  'Minor 7 = minor third, perfect fifth, and a minor seventh.');
export const MINOR_MAJOR_7 = new ChordQuality([3, 7, 11], ['min<sup>Maj7</sup>', 'm<sup>M7</sup>'], 'Minor Major 7 = minor third, perfect fifth, and a major seventh.');
export const DOMINANT_7    = new ChordQuality([4, 7, 10], ['<sup>7</sup>'],                         'Dominant 7 = major third, perfect fifth, and a minor seventh.');
export const MAJOR_7       = new ChordQuality([4, 7, 11], ['<sup>Maj7</sup>'],                      'Major 7 = major third, perfect fifth, and a major seventh.');
export const AUG_MAJOR_7   = new ChordQuality([4, 8, 11], ['aug<sup>Maj7</sup>'],                   'Augmented Major 7 = major third, augmented fifth, and a major seventh.');

// -- Chord Quality Arrays --
export const TRIAD_QUALITIES   = [ MAJOR_3, MINOR_3, DIMINISHED_3, AUGMENTED_3 ];
export const SEVENTH_QUALITIES = [ DIMINISHED_7, HALF_DIM_7, MINOR_7, MINOR_MAJOR_7, DOMINANT_7, MAJOR_7, AUG_MAJOR_7 ];


// ===========
// Chord Types
// -----------

export class Chord extends Sound {

    public root: Note;
    public quality: ChordQuality;
    public inversion: number; // 0 indicates root position

    constructor(root: Note, quality: ChordQuality, inversion: number = 0) {
        super();
        this.root = root;
        this.quality = quality;
        this.inversion = inversion;
    }

    // -- Parent Functions --
    toString(key?: Key | null): string { return this.root.toString(key) + this.quality.getNotation(); }
    getRhythmicValue(): RhythmicValue { return this.root.rhythmicValue; }
    getNotes(): Note[] {
        // Start with the base notes
        let notes: Note[] = this.quality.getNotes(this.root);

        // Now adjust based on the inversion
        if (this.inversion < 0) {
            throw new Error("Inversion cannot be negative");
        }
        let noteToInvert = 0; // First inversion moves the root note
        for (let i = this.inversion; i > 0; i--) {
            // Move the bottom-most note up one octave
            notes[noteToInvert].pitch += 12;
            noteToInvert = (noteToInvert + 1) % notes.length; // Prep for the next iteration
        }

        return notes;
    }
}


// =========
// Key Types
// ---------

enum KeyType { MAJOR = 'Major' };

export class Key {

    readonly rootNote: NoteLabel;
    readonly type: KeyType;

    constructor(rootNote: NoteLabel, type: KeyType) {
        this.rootNote = rootNote;
        this.type = type;
    }

    toString(): string { return `${this.rootNote.toString()} ${this.type}`; }

    getScale(): PitchClass[] {
        const rootPitchClass = this.rootNote.pitchClass;
        switch (this.type) {
            case KeyType.MAJOR:
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
    }

    getChords(): Chord[] {
        let scale = this.getScale();
        switch (this.type) {
            case KeyType.MAJOR:
                return [
                    // -- Triads --
                    new Chord(new Note(scale[0]), MAJOR_3),
                    new Chord(new Note(scale[1]), MINOR_3),
                    new Chord(new Note(scale[2]), MINOR_3),
                    new Chord(new Note(scale[3]), MAJOR_3),
                    new Chord(new Note(scale[4]), MAJOR_3),
                    new Chord(new Note(scale[5]), MINOR_3),
                    new Chord(new Note(scale[6]), DIMINISHED_3),
                    // -- Sevenths --
                    new Chord(new Note(scale[0]), MAJOR_7),
                    new Chord(new Note(scale[1]), MINOR_7),
                    new Chord(new Note(scale[2]), MINOR_7),
                    new Chord(new Note(scale[3]), MAJOR_7),
                    new Chord(new Note(scale[4]), DOMINANT_7),
                    new Chord(new Note(scale[5]), MINOR_7),
                    new Chord(new Note(scale[6]), HALF_DIM_7),
                ];
        }
    }

    /**
     * Returns an array of string-represented notes, indexed by the note's pitch class (0 = C, ...). For pitch
     * classes outside the key, a "null" value is returned. The "starting note" is the root note of the key.
     * 
     * Examples:
     *   C major is: ['C',  null, 'D', null, 'E', 'F',  null, 'G', null, 'A', null, 'B']
     *   D major is: [null, 'C♯', 'D', null, 'E', null, 'F♯', 'G', null, 'A', null, 'B']
     */
    getNoteLabelsInKey(): (NoteLabel | null)[] {
        let retVal = new Array(12).fill(null);
        let currentLetterIndex = BASE_LETTERS.indexOf(this.rootNote.letter);
        for (let pc of this.getScale()) {
            let availableLabels = PITCH_CLASS_TO_LABELS[pc];
            retVal[pc] = availableLabels.find(opt => opt.letter === BASE_LETTERS[currentLetterIndex]);
            currentLetterIndex++;
            currentLetterIndex %= BASE_LETTERS.length;
        }
        return retVal;
    }
}

// -- Major Keys --
export const CFLAT_MAJOR  = new Key(C_FLAT,  KeyType.MAJOR);
export const C_MAJOR      = new Key(C,       KeyType.MAJOR);
export const CSHARP_MAJOR = new Key(C_SHARP, KeyType.MAJOR);
export const DFLAT_MAJOR  = new Key(D_FLAT,  KeyType.MAJOR);
export const D_MAJOR      = new Key(D,       KeyType.MAJOR);
export const EFLAT_MAJOR  = new Key(E_FLAT,  KeyType.MAJOR);
export const E_MAJOR      = new Key(E,       KeyType.MAJOR);
export const F_MAJOR      = new Key(F,       KeyType.MAJOR);
export const FSHARP_MAJOR = new Key(F_SHARP, KeyType.MAJOR);
export const GFLAT_MAJOR  = new Key(G_FLAT,  KeyType.MAJOR);
export const G_MAJOR      = new Key(G,       KeyType.MAJOR);
export const AFLAT_MAJOR  = new Key(A_FLAT,  KeyType.MAJOR);
export const A_MAJOR      = new Key(A,       KeyType.MAJOR);
export const BFLAT_MAJOR  = new Key(B_FLAT,  KeyType.MAJOR);
export const B_MAJOR      = new Key(B,       KeyType.MAJOR);

export const MAJOR_KEY_LOOKUP = {
    CFLAT_MAJOR, C_MAJOR, CSHARP_MAJOR,
    DFLAT_MAJOR, D_MAJOR,
    EFLAT_MAJOR, E_MAJOR,
                 F_MAJOR, FSHARP_MAJOR,
    GFLAT_MAJOR, G_MAJOR,
    AFLAT_MAJOR, A_MAJOR,
    BFLAT_MAJOR, B_MAJOR,
};

export const KEYS = Object.values(MAJOR_KEY_LOOKUP);

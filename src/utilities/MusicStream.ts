import { SightReadingConfiguration } from "../datatypes/Configs";
import { Key, LabeledNote, Note, Octave, Pitch, PitchClass, RHYTHMIC_VALUES, RhythmicValue, Sound } from "../datatypes/Musics";
import { randomItemFrom } from "./ArrayUtils";
import { getRandomNote } from "./Generators";
import { convertToPitch, convertToPitchClassWithOctave, createNote, getBeatCount, getChordNotes, isANote } from "./MusicUtils";
import { LETTERS_IN_KEY, NoteLetter, PITCH_CLASS_TO_LETTERS, getAccidental, getInterval } from "./NotationUtils";
import { randInt } from "./NumberUtils";


// // TODO-ben : delete this
// function createSampleSounds(height: number, staffThickness: number, musicKey: Key, clef: Clef, baseOctave: Octave): ReactElement[] {
//     let eles: ReactElement[] = [];

//     // // Upward notes
//     // let previousNote = createNote(0, RhythmicValue.QUARTER, baseOctave, false)
//     // for (let x = 0; x < 22; x++) {
//     //     eles.push((<SvgChord
//     //         key={ x }
//     //         musicKey={ musicKey }
//     //         clef={ clef }
//     //         x={ 40 + x * 50 }
//     //         staffLineHeight={ STAFF_RATIO * height / 4 }
//     //         strokeWidth={ staffThickness }
//     //         sound={ previousNote }></SvgChord>));
//     //         previousNote = stepUpNote(previousNote, 1);
//     // }

//     // Chords in a key
//     let chords = getChordsInKey(musicKey);
//     for (let x = 0; x < chords.length; x++ ) {
//         chords[x].root.octave = baseOctave;
//         eles.push((<SvgChord
//             key={ x }
//             musicKey={ musicKey }
//             clef={ clef }
//             x={ 40 + x * 50 }
//             staffLineHeight={ STAFF_RATIO * height / 4 }
//             strokeWidth={ staffThickness }
//             sound={ chords[x] }></SvgChord>));
//     }

//     return eles;
// }

export type Music = {
    trebleClef: Sound[],
    bassClef: Sound[],
}

type SemiLabeledNotes = (Note | LabeledNote)[];

export type LabeledMusic = {
    trebleClef: LabeledNote[][],
    bassClef:   LabeledNote[][],
}

enum TrebleState {
    // If "single-notes" is selected
    NoteFlurry,
    MirroredNoteFlurry,
    RepeatedNoteFlurry,
    // If "broken chords" is selected
    ChordThenBroken,
    BrokenThenChord,
    // If "chords" is selected
    RepeatedChord,
}

enum BassState {
    SingleNote,
    Octave,
    OctaveWithFifth,
    OctaveWithDelayedFifth,
    RootWithDelayedFifthEighth,
}

// Limits the range of notes we generate. All bounds are inclusive.
type Bounds = { upper: Pitch, lower: Pitch };
const TREBLE_BOUNDS: Bounds = {
    upper: convertToPitch({ octave: 5, pitchClass: 9 }), // A5
    lower: convertToPitch({ octave: 4, pitchClass: 0 }), // C4, "middle C"
}
const BASS_BOUNDS: Bounds = {
    upper: convertToPitch({ octave: 4, pitchClass: 0 }), // C4, "middle C"
    lower: convertToPitch({ octave: 2, pitchClass: 4 }), // E2
}

export class MusicStream {

    private config: SightReadingConfiguration;
    private key: Key;

    private generatedMusic: Music;
    private trebleBeatCount: number;
    private bassBeatCount: number;

    constructor(config: SightReadingConfiguration, key: Key) {
        this.config = config;
        this.key = key;
        this.generatedMusic = { trebleClef: [], bassClef: [] };
        this.trebleBeatCount = 0;
        this.bassBeatCount = 0;
    }

    public getNextMeasure(): Music {
        // Always keep at least 2 measures generated so we can use the last measure to improve future generation.
        if (this.config.includeTrebleClef) {
            while (this.trebleBeatCount < 2 * this.config.timeSignature.top) {
                this.generateMoreTreble();
            }
        }
        if (this.config.includeBassClef) {
            while (this.bassBeatCount < 2 * this.config.timeSignature.top) {
                this.generateMoreBass();
            }
        }

        let retVal = {
            trebleClef: this.pullOffMeasure(this.generatedMusic.trebleClef),
            bassClef:   this.pullOffMeasure(this.generatedMusic.bassClef),
        };
        this.trebleBeatCount -= this.config.timeSignature.top;
        this.bassBeatCount   -= this.config.timeSignature.top;

        return retVal;
    }

    public labelMusic(music: Music): LabeledMusic {
        let treble: SemiLabeledNotes[] = music.trebleClef.map((sound) => isANote(sound) ? [sound] : getChordNotes(sound));
        let bass:   SemiLabeledNotes[] = music.bassClef  .map((sound) => isANote(sound) ? [sound] : getChordNotes(sound));

        // Label the music, swapping out "notes" for "labeled notes"

        // First, if the note is bordering its staff's bounds, and one option would push it beyond, choose the other.
        // (ex: Treble staff, C4 is the lowest ... but B# is the same note, but rendered 1 line lower, which is OOB for the staffs.)
        treble = labelUnlabeled(treble, labelIfOOB(this.key, TREBLE_BOUNDS));
        bass   = labelUnlabeled(bass,   labelIfOOB(this.key, BASS_BOUNDS));

        // Then, label the notes that are in key.
        treble = labelUnlabeled(treble, labelIfInKey(this.key));
        bass   = labelUnlabeled(bass,   labelIfInKey(this.key));

        // Then, label the notes that only have one option.
        treble = labelUnlabeled(treble, labelIfOneOption(this.key));
        bass   = labelUnlabeled(bass,   labelIfOneOption(this.key));

        // Then, label the notes based on the number of roots/thirds/fifths/sevenths in the rest of the measure.
        treble = labelUnlabeled(treble, labelByScore(this.key, treble, bass));
        bass   = labelUnlabeled(bass,   labelByScore(this.key, bass, treble));

        // Then, randomly label the rest.
        let labeledTreble = labelUnlabeled(treble, labelRandomly(this.key)) as LabeledNote[][];
        let labeledBass   = labelUnlabeled(bass,   labelRandomly(this.key)) as LabeledNote[][];

        return {
            trebleClef: labeledTreble,
            bassClef:   labeledBass,
        };
    }

    private pullOffMeasure(musicClef: Sound[]): Sound[] {
        let measure: Sound[] = [];

        let beatsRemaining = this.config.timeSignature.top;
        while (beatsRemaining > 0) {
            let sound = musicClef.shift();
            if (!sound) break; // Shouldn't happen... but you never know.
            measure.push(sound);
            beatsRemaining -= getBeatCount(this.config.timeSignature, sound);
        }

        return measure;
    }

    private generateMoreTreble(): void {
        // TODO-ben : Make sure our generation has clean cutoffs at measures
        const type = randomItemFrom(getValidTrebleStates(this.config));
        let trebleSounds: Sound[] = [];
        switch (type) {
            // TODO-ben : Update with other generation functions.
            case TrebleState.NoteFlurry:         trebleSounds = this.createNoteFlurry(TREBLE_BOUNDS); break;
            case TrebleState.MirroredNoteFlurry: trebleSounds = this.createNoteFlurry(TREBLE_BOUNDS); break;
            case TrebleState.RepeatedNoteFlurry: trebleSounds = this.createNoteFlurry(TREBLE_BOUNDS); break;
            case TrebleState.ChordThenBroken:    trebleSounds = this.createNoteFlurry(TREBLE_BOUNDS); break;
            case TrebleState.BrokenThenChord:    trebleSounds = this.createNoteFlurry(TREBLE_BOUNDS); break;
            case TrebleState.RepeatedChord:      trebleSounds = this.createNoteFlurry(TREBLE_BOUNDS); break;
        }
        this.generatedMusic.trebleClef.push(...trebleSounds);
        this.trebleBeatCount += trebleSounds
            .map(sound => getBeatCount(this.config.timeSignature, sound))
            .reduce((a, b) => a+b, 0);
    }

    private generateMoreBass(): void {
        // TODO-ben : Make sure our generation has clean cutoffs at measures
        // TODO-ben : Match treble pitch classes (if applicable) down 1-2 octaves
        const type = randomItemFrom(getValidBassStates(this.config));
        let bassSounds: Sound[] = [];
        switch (type) {
            // TODO-ben : Update with other generation functions.
            case BassState.SingleNote:                 bassSounds = this.createNoteFlurry(BASS_BOUNDS); break;
            case BassState.Octave:                     bassSounds = this.createNoteFlurry(BASS_BOUNDS); break;
            case BassState.OctaveWithFifth:            bassSounds = this.createNoteFlurry(BASS_BOUNDS); break;
            case BassState.OctaveWithDelayedFifth:     bassSounds = this.createNoteFlurry(BASS_BOUNDS); break;
            case BassState.RootWithDelayedFifthEighth: bassSounds = this.createNoteFlurry(BASS_BOUNDS); break;
        }
        this.generatedMusic.bassClef.push(...bassSounds);
        this.bassBeatCount += bassSounds
            .map(sound => getBeatCount(this.config.timeSignature, sound))
            .reduce((a, b) => a+b, 0);
    }

    private createNoteFlurry(bounds: Bounds): Sound[] {
        // TODO-ben : Make this actually generate a "flurry" (mostly-)in-key instead of a random mess
        const sounds: Sound[] = [];

        // const rhythmicValue = randomItemFrom(RHYTHMIC_VALUES);

        // // Generate between 2 and 8 notes
        // for (let i = 0; i < randInt(2, 8); i++) {
        //     const pitch = randInt(bounds.lower, bounds.upper+1);
        //     const {octave, pitchClass} = convertToPitchClassWithOctave(pitch);
        //     sounds.push(createNote(pitchClass, rhythmicValue, octave, false));
        // }

        const rhythmicValue = RhythmicValue.HALF;

        // Generate between 2 and 8 notes
        for (let currentPitch = bounds.lower; currentPitch < bounds.upper+1; currentPitch++) {
            const pitch = currentPitch;
            const {octave, pitchClass} = convertToPitchClassWithOctave(pitch);
            sounds.push(createNote(pitchClass, rhythmicValue, octave, false));
        }

        return sounds;
    }

}


// ================
// State Management
// ----------------

function getValidTrebleStates(config: SightReadingConfiguration): TrebleState[] {
    let validStates: TrebleState[] = [];

    if (config.practiceSingleNotes) {
        validStates.push(TrebleState.NoteFlurry, TrebleState.MirroredNoteFlurry, TrebleState.RepeatedNoteFlurry);
    }
    if (config.practiceChords) {
        validStates.push(TrebleState.RepeatedChord);
        if (config.includeBrokenChords) {
            validStates.push(TrebleState.ChordThenBroken, TrebleState.BrokenThenChord);
        }
    }

    return validStates;
}

function getValidBassStates(config: SightReadingConfiguration): BassState[] {
    let validStates: BassState[] = [BassState.SingleNote];

    // Difficulty numbers are arbitrary and can be adjusted here if desired.
    if (config.adjacentNoteDistance >= 3) {
        validStates.push(BassState.Octave);
    }
    if (config.adjacentNoteDistance >= 5) {
        validStates.push(BassState.OctaveWithFifth);
    }
    if (config.adjacentNoteDistance >= 7) {
        validStates.push(BassState.OctaveWithDelayedFifth, BassState.RootWithDelayedFifthEighth);
    }

    return validStates;
}


// =============
// Note Labeling
// -------------

function labelUnlabeled(notes: SemiLabeledNotes[], labelFn: (note: Note) => Note | LabeledNote): SemiLabeledNotes[] {
    return notes.map(noteGroup => {
        return noteGroup.map(note => {
            if ('pitchClass' in note) {
                return labelFn(note);
            } else {
                return note;
            }
        });
    });
}

function labelIfOOB(key: Key, bounds: Bounds): (note: Note) => Note | LabeledNote {
    return (note: Note) => {
        // If "just one" option, then we don't have a choice to keep it "in bounds".
        const options = PITCH_CLASS_TO_LETTERS[note.pitchClass];
        if (options.length > 1) {
            const pitch = convertToPitch(note);
            if (pitch === bounds.lower) {
                // Choose the higher letter
                const notation = options[0].charAt(0) > options[1].charAt(0) ? options[0] : options[1];
                return noteToLabeledNote(note, notation, key);
            } else if (pitch === bounds.upper) {
                // Choose the lower letter
                const notation = options[0].charAt(0) < options[1].charAt(0) ? options[0] : options[1];
                return noteToLabeledNote(note, notation, key);
            }
        }

        return note;
    };
}

function labelIfInKey(key: Key): (note: Note) => Note | LabeledNote {
    return (note: Note) => {
        const notation = LETTERS_IN_KEY[key][note.pitchClass];
        return (notation === null) ? note : noteToLabeledNote(note, notation, key);
    };
}

function labelIfOneOption(key: Key): (note: Note) => Note | LabeledNote {
    return (note: Note) => {
        const options = PITCH_CLASS_TO_LETTERS[note.pitchClass];
        return (options.length > 1) ? note : noteToLabeledNote(note, options[0], key);
    }
}

// TODO-ben : This function needs to be heavily tested.
function labelByScore(key: Key, sameClef: SemiLabeledNotes[], otherClef: SemiLabeledNotes[]): (note: Note) => Note | LabeledNote {
    return (note: Note) => {
        const options = PITCH_CLASS_TO_LETTERS[note.pitchClass];
        const indexInClef = sameClef.findIndex(ng => ng.indexOf(note) !== -1);
        const scores = options.map(opt => {
            return scoreClef(sameClef, opt, indexInClef) + scoreClef(otherClef, opt, -1);
        });
        const topScore = Math.max(...scores);
        return (topScore > 0) ? note : noteToLabeledNote(note, options[scores.indexOf(topScore)], key);
    };
}

function labelRandomly(key: Key): (note: Note) => Note | LabeledNote {
    return (note: Note) => {
        const notation = randomItemFrom(PITCH_CLASS_TO_LETTERS[note.pitchClass]);
        return noteToLabeledNote(note, notation, key);
    }
}

/**
 * Returns the score of the given note based on the surrounding notes in the given clef. An "indexInClef" of -1
 * indicates our note is from the other clef, so don't give it bonuses for distance/same-clef.
 */
function scoreClef(clef: SemiLabeledNotes[], option: NoteLetter, indexInClef: number): number {
    // For now, score is determined by:
    // 1.) Determining the interval between two notes, only caring about roots/thirds/fifths/sevenths
    // 2.) Determining the "time-ish"-distance between those two notes if they're on the same clef
    // 3.) Doing math to say "the closer they are time-wise, and the smaller the interval, the higher the score"
    let score = 0;
    for (let i = 0; i < clef.length; i++) {
        let noteGroupB = clef[i];
        for (let noteB of noteGroupB) {
            if ('letter' in noteB) {
                let interval = getInterval(option, noteB.letter);
                if ([1, 3, 5, 7].includes(interval)) {
                    const intervalScore = 4-(interval-1)/2; // root = 4, third = 3, fifth = 2, seventh = 1
                    const distanceScore = (indexInClef === -1)
                        ? Math.max(1, 5-Math.abs(indexInClef - i)) // 4 = 1 away, 3 = 2 away, 2 = 3 away, 1 = everything else
                        : 0;
                    score += (intervalScore * distanceScore);
                }
            }
        }
    }
    return score;
}

function noteToLabeledNote(note: Note, notation: NoteLetter, key: Key): LabeledNote {
    let labeled: any = {...note};
    delete labeled.pitchClass;

    labeled.letter = notation.charAt(0);
    labeled.accidental = getAccidental(notation);

    return labeled;
}
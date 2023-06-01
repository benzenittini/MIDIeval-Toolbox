
import { Pitch, RhythmicValue } from "../datatypes/BasicTypes";
import { Key, Sound, Note, NoteLabel, PITCH_CLASS_TO_LABELS } from "../datatypes/ComplexTypes";
import { SightReadingConfiguration } from "../datatypes/Configs";
import { randomItemFrom } from "./ArrayUtils";
import { getRandomNote } from "./Generators";
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

// TODO-ben : Move these to "Complex Types"?
export type Music = {
    trebleClef: Sound[],
    bassClef: Sound[],
}
export type LabeledMusic = {
    trebleClef: Note[][],
    bassClef:   Note[][],
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
    upper: Note.convertToPitch(5, 9), // A5
    lower: Note.convertToPitch(4, 0), // C4, "middle C"
}
const BASS_BOUNDS: Bounds = {
    upper: Note.convertToPitch(4, 0), // C4, "middle C"
    lower: Note.convertToPitch(2, 4), // E2
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
        let treble: Note[][] = music.trebleClef.map((sound) => sound.getNotes());
        let bass:   Note[][] = music.bassClef  .map((sound) => sound.getNotes());

        // Label the music, swapping out "notes" for "labeled notes"

        // TODO-ben : Change all the label functions to just modify the note inline instead of mapping and returning values.

        // First, if the note is bordering its staff's bounds, and one option would push it beyond, choose the other.
        // (ex: Treble staff, C4 is the lowest ... but B# is the same note, but rendered 1 line lower, which is OOB for the staffs.)
        treble = labelUnlabeled(treble, labelIfOOB(TREBLE_BOUNDS));
        bass   = labelUnlabeled(bass,   labelIfOOB(BASS_BOUNDS));

        // Then, label the notes that are in key.
        treble = labelUnlabeled(treble, labelIfInKey(this.key));
        bass   = labelUnlabeled(bass,   labelIfInKey(this.key));

        // Then, label the notes based on the number of roots/thirds/fifths/sevenths in the rest of the measure.
        treble = labelUnlabeled(treble, labelByScore(treble, bass));
        bass   = labelUnlabeled(bass,   labelByScore(bass, treble));

        return {
            trebleClef: treble,
            bassClef:   bass,
        };
    }

    private pullOffMeasure(musicClef: Sound[]): Sound[] {
        let measure: Sound[] = [];

        let beatsRemaining = this.config.timeSignature.top;
        while (beatsRemaining > 0) {
            let sound = musicClef.shift();
            if (!sound) break; // Shouldn't happen... but you never know.
            measure.push(sound);
            beatsRemaining -= sound.getBeatCount(this.config.timeSignature);
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
            .map(sound => sound.getBeatCount(this.config.timeSignature))
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
            .map(sound => sound.getBeatCount(this.config.timeSignature))
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

        const rhythmicValue = RhythmicValue.QUARTER;

        // Generate between 2 and 8 notes
        for (let currentPitch = bounds.lower; currentPitch < bounds.upper+1; currentPitch++) {
            sounds.push(new Note(currentPitch, rhythmicValue, false));
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

function labelUnlabeled(notes: Note[][], labelFn: (note: Note) => Note): Note[][] {
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

function labelIfOOB(bounds: Bounds): (note: Note) => Note {
    return (note: Note) => {
        // If "just one" option, then we don't have a choice if we want to keep it "in bounds".
        const options = PITCH_CLASS_TO_LABELS[note.getPitchClass()];
        if (options.length > 1) {
            if (note.pitch === bounds.lower) {
                // Choose the higher letter
                const notation = options[0].letter > options[1].letter ? options[0] : options[1];
                note.setLabel(notation);
            } else if (note.pitch === bounds.upper) {
                // Choose the lower letter
                const notation = options[0].letter < options[1].letter ? options[0] : options[1];
                note.setLabel(notation);
            }
        }

        return note;
    };
}

function labelIfInKey(key: Key): (note: Note) => Note {
    return (note: Note) => {
        const notation = key.getNoteLabelsInKey()[note.getPitchClass()];
        if (notation !== null) {
            note.setLabel(notation);
        }
        return note;
    };
}

// TODO-ben : This function needs to be heavily tested.
function labelByScore(sameClef: Note[][], otherClef: Note[][]): (note: Note) => Note {
    return (note: Note) => {
        const options = PITCH_CLASS_TO_LABELS[note.getPitchClass()];
        const indexInClef = sameClef.findIndex(ng => ng.indexOf(note) !== -1);
        const scores = options.map(opt => {
            return scoreClef(sameClef, opt, indexInClef) + scoreClef(otherClef, opt, -1);
        });
        const topScore = Math.max(...scores);
        if (topScore > 0) {
            note.setLabel(options[scores.indexOf(topScore)]);
        }
        return note;
    };
}

/**
 * Returns the score of the given note based on the surrounding notes in the given clef. An "indexInClef" of -1
 * indicates our note is from the other clef, so don't give it bonuses for distance/same-clef.
 */
function scoreClef(clef: Note[][], option: NoteLabel, indexInClef: number): number {
    // For now, score is determined by:
    // 1.) Determining the interval between two notes, only caring about roots/thirds/fifths/sevenths
    // 2.) Determining the "time-ish"-distance between those two notes if they're on the same clef
    // 3.) Doing math to say "the closer they are time-wise, and the smaller the interval, the higher the score"
    let score = 0;
    for (let i = 0; i < clef.length; i++) {
        let noteGroupB = clef[i];
        for (let noteB of noteGroupB) {
            if (noteB.hasLabel()) {
                let interval = option.getInterval(noteB.getLabel());
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

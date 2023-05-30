import { SightReadingConfiguration } from "../datatypes/Configs";
import { Key, LabeledNote, Note, Octave, Sound } from "../datatypes/Musics";
import { randomItemFrom } from "./ArrayUtils";
import { getRandomNote } from "./Generators";
import { getBeatCount, getChordNotes, isANote } from "./MusicUtils";
import { LETTERS_IN_KEY, NoteLetter, PITCH_CLASS_TO_LETTERS, getAccidental, getInterval } from "./NotationUtils";

type Music = {
    trebleClef: Sound[],
    bassClef: Sound[],
}

type SemiLabeledNotes = (Note[] | LabeledNote[]);

type LabeledMusic = {
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

        return {
            trebleClef: this.pullOffMeasure(this.generatedMusic.trebleClef),
            bassClef:   this.pullOffMeasure(this.generatedMusic.bassClef),
        };
    }

    public labelMusic(music: Music): LabeledMusic {
        let treble: SemiLabeledNotes[] = music.trebleClef.map((sound) => isANote(sound) ? [sound] : getChordNotes(sound));
        let bass:   SemiLabeledNotes[] = music.bassClef  .map((sound) => isANote(sound) ? [sound] : getChordNotes(sound));

        // Label the music, swapping out "notes" for "labeled notes"

        // First, label the notes that are in key.
        treble = this.labelUnlabeled(treble, this.labelIfInKey);
        bass   = this.labelUnlabeled(bass,   this.labelIfInKey);

        // Then, label the notes that only have one option.
        treble = this.labelUnlabeled(treble, this.labelIfOneOption);
        bass   = this.labelUnlabeled(bass,   this.labelIfOneOption);

        // Then, label the notes based on the number of roots/thirds/fifths/sevenths in the rest of the measure.
        treble = this.labelUnlabeled(treble, this.labelByScore(treble, bass));
        bass   = this.labelUnlabeled(bass,   this.labelByScore(bass, treble));

        // Then, randomly label the rest.
        let labeledTreble = this.labelUnlabeled(treble, this.labelRandomly) as LabeledNote[][];
        let labeledBass   = this.labelUnlabeled(bass,   this.labelRandomly) as LabeledNote[][];

        return {
            trebleClef: labeledTreble,
            bassClef:   labeledBass,
        };
    }

    private labelUnlabeled(notes: SemiLabeledNotes[], labelFn: (note: Note) => Note | LabeledNote): SemiLabeledNotes[] {
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

    private labelIfInKey(note: Note): Note | LabeledNote {
        const notation = LETTERS_IN_KEY[this.key][note.pitchClass];
        return (notation === null) ? note : this.noteToLabeledNote(note, notation);
    }

    private labelIfOneOption(note: Note): Note | LabeledNote {
        const options = PITCH_CLASS_TO_LETTERS[note.pitchClass];
        return (options.length > 1) ? note : this.noteToLabeledNote(note, options[0]);
    }

    // TODO-ben : This function needs to be heavily tested.
    private labelByScore(sameClef: SemiLabeledNotes[], otherClef: SemiLabeledNotes[]): (note: Note) => Note | LabeledNote {
        return (note: Note) => {
            const options = PITCH_CLASS_TO_LETTERS[note.pitchClass];
            const indexInClef = sameClef.findIndex(ng => ng.indexOf(note) !== -1);
            const scores = options.map(opt => {
                return this.scoreClef(sameClef, opt, indexInClef) + this.scoreClef(otherClef, opt, -1);
            });
            const topScore = Math.max(...scores);
            return (topScore > 0) ? note : this.noteToLabeledNote(note, options[scores.indexOf(topScore)]);
        };
    }

    /**
     * Returns the score of the given note based on the surrounding notes in the given clef. An "indexInClef" of -1
     * indicates our note is from the other clef, so don't give it bonuses for distance/same-clef.
     */
    private scoreClef(clef: SemiLabeledNotes[], option: NoteLetter, indexInClef: number): number {
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

    private labelRandomly(note: Note): LabeledNote {
        const notation = randomItemFrom(PITCH_CLASS_TO_LETTERS[note.pitchClass]);
        return this.noteToLabeledNote(note, notation);
    }

    private noteToLabeledNote(note: Note, notation: NoteLetter): LabeledNote {
        let labeled: any = {...note};
        delete labeled.pitchClass;

        labeled.letter = notation.charAt(0);
        if (!LETTERS_IN_KEY[this.key].includes(notation)) {
            labeled.accidental = getAccidental(notation);
        }

        return labeled;
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
        this.trebleBeatCount -= this.config.timeSignature.top;
        this.bassBeatCount   -= this.config.timeSignature.top;

        return measure;
    }

    private generateMoreTreble(): void {
        // TODO-ben : Make sure our generation has clean cutoffs at measures
        const type = randomItemFrom(getValidTrebleStates(this.config));
        let trebleSounds: Sound[] = [];
        switch (type) {
            // TODO-ben : Update with other generation functions.
            case TrebleState.NoteFlurry:         trebleSounds = this.createNoteFlurry(); break;
            case TrebleState.MirroredNoteFlurry: trebleSounds = this.createNoteFlurry(); break;
            case TrebleState.RepeatedNoteFlurry: trebleSounds = this.createNoteFlurry(); break;
            case TrebleState.ChordThenBroken:    trebleSounds = this.createNoteFlurry(); break;
            case TrebleState.BrokenThenChord:    trebleSounds = this.createNoteFlurry(); break;
            case TrebleState.RepeatedChord:      trebleSounds = this.createNoteFlurry(); break;
        }
        this.generatedMusic.trebleClef.push(...trebleSounds);
        this.trebleBeatCount += trebleSounds
            .map(sound => getBeatCount(this.config.timeSignature, sound))
            .reduce((a, b) => a+b, 0);
    }

    private generateMoreBass(): void {
        // TODO-ben : Make sure our generation has clean cutoffs at measures
        // TODO-ben : Match treble pitches (if applicable) down 1-2 octaves
        const type = randomItemFrom(getValidBassStates(this.config));
        let bassSounds: Sound[] = [];
        switch (type) {
            // TODO-ben : Update with other generation functions.
            case BassState.SingleNote:                 bassSounds = this.createNoteFlurry(); break;
            case BassState.Octave:                     bassSounds = this.createNoteFlurry(); break;
            case BassState.OctaveWithFifth:            bassSounds = this.createNoteFlurry(); break;
            case BassState.OctaveWithDelayedFifth:     bassSounds = this.createNoteFlurry(); break;
            case BassState.RootWithDelayedFifthEighth: bassSounds = this.createNoteFlurry(); break;
        }
        this.generatedMusic.bassClef.push(...bassSounds);
        this.bassBeatCount += bassSounds
            .map(sound => getBeatCount(this.config.timeSignature, sound))
            .reduce((a, b) => a+b, 0);
    }

    private createNoteFlurry(): Sound[] {
        return [
            getRandomNote(this.key),
            getRandomNote(this.key),
            getRandomNote(this.key),
        ];
    }

}

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
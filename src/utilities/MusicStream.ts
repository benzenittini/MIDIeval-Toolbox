import { SightReadingConfiguration } from "../datatypes/Configs";
import { Key, Sound } from "../datatypes/Musics";
import { randomItemFrom } from "./ArrayUtils";
import { getRandomNote } from "./Generators";
import { getBeatCount } from "./MusicUtils";

type Music = {
    trebleClef: Sound[],
    bassClef: Sound[],
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
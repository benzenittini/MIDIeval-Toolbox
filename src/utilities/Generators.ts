
import { Clef, PITCH_CLASSES, RHYTHMIC_VALUES, RhythmicValue, TimeSignature } from "../datatypes/BasicTypes";
import { Chord, ChordQuality, KEYS, Key, MAJOR_3, Note, SEVENTH_QUALITIES, Sound, TRIAD_QUALITIES } from "../datatypes/ComplexTypes";
import { SightReadingConfiguration } from "../datatypes/Configs";
import { randomItemFrom } from "./ArrayUtils";
import { Bounds, GeneratedSounds, Music } from "./MusicStream";
import { clamp, randInt } from "./NumberUtils";


export function getRandomKey(): Key {
    return KEYS[randInt(0, KEYS.length)];
}

export function getRandomNote(key: Key | null): Note {
    const availablePitches = key === null ? PITCH_CLASSES : key.getScale();
    const pitchClass = availablePitches[randInt(0, availablePitches.length)];
    return new Note(Note.convertToPitch(4, pitchClass), RhythmicValue.QUARTER, false);
}

export function getRandomChord(key: Key | null, allowedQualities: ChordQuality[]): Chord | null {
    let rootChord: Chord;
    if (key === null) {
        const note = getRandomNote(key);
        const quality = allowedQualities[randInt(0, allowedQualities.length)];
        rootChord = new Chord(note, quality);
    } else {
        const validChords = key.getChords().filter(c => allowedQualities.includes(c.quality));
        if (validChords.length === 0) {
            return null;
        }
        rootChord = randomItemFrom(validChords);
    }

    const inversion =
        (TRIAD_QUALITIES.includes(rootChord.quality as any)) ? randInt(0, 3) :
        (SEVENTH_QUALITIES.includes(rootChord.quality as any)) ? randInt(0, 4) :
        0;

    return new Chord(rootChord.root, rootChord.quality, inversion);
}


/**
 * Ensures the notes we generate have clean cutoffs between each measure by choosing the minimum value between:
 *   - The number of beats left in the measure.
 *   - The provided rhythmic value.
 */
function fitRhythmicValue(desired: RhythmicValue, beatCount: number, timeSignature: TimeSignature): RhythmicValue {
    const beatsRemainingInMeasure = timeSignature.top - beatCount % timeSignature.top;

    // If our desired rhythmic value fits, let's use that!
    // Otherwise, we'll use the biggest one that fits.
    for (let rv of [desired, RhythmicValue.WHOLE, RhythmicValue.HALF, RhythmicValue.QUARTER, RhythmicValue.EIGHTH]) {
        if (Sound.getBeatCount(timeSignature, rv) <= beatsRemainingInMeasure) {
            return rv;
        }
    }

    // Should never get here, but in case we do...
    return RhythmicValue.EIGHTH;
}

// TODO-ben : Move this to one of our "*Types.ts" files.
export type GenerationParams = {
    key: Key;
    config: SightReadingConfiguration;
    generatedMusic: Music;
    beatsSoFar: number;
    bounds: Bounds;
    clef: Clef;
}


export function createNoteFlurry({ key, config, generatedMusic, beatsSoFar, bounds, clef }: GenerationParams): GeneratedSounds {
    const sounds = new GeneratedSounds(config.timeSignature);
    const rhythmicValue = config.allowRhythmicValues
        ? randomItemFrom(RHYTHMIC_VALUES)
        : RhythmicValue.QUARTER;

    // Continue where we left off
    let thisClef = (clef === Clef.TREBLE) ? generatedMusic.trebleClef : generatedMusic.bassClef;
    let previousNote = thisClef.at(-1)?.getNotes()[0] ?? getRandomNote(key);
    if (!previousNote.isInKey(key)) {
        previousNote = getRandomNote(key);
    }

    // Generate between 2 and 8 notes, going either up or down.
    let upperLimit = previousNote.pitch >= bounds.upper ? 0 : config.adjacentNoteDistance;
    let lowerLimit = previousNote.pitch <= bounds.lower ? 0 : -config.adjacentNoteDistance;
    do { var pitchClassJump = Math.ceil(randInt(lowerLimit, upperLimit + 1) / 2); }
    while (pitchClassJump === 0); // Staying where we are is boring.

    for (let i = 0; i < randInt(2, 8); i++) {
        let lastPitch = previousNote.pitch;
        previousNote = previousNote.clone()
            .stepUpInKey(pitchClassJump, key)
            .clampIntoKey(key, bounds.lower, bounds.upper);
        previousNote.rhythmicValue = fitRhythmicValue(rhythmicValue, beatsSoFar + sounds.beatCount, config.timeSignature);
        // TODO-ben : debug render(?) issue, then remove this line:
        console.log({diff: previousNote.pitch - lastPitch, prev: lastPitch, new: previousNote.pitch});
        sounds.addSound(previousNote);
    }

    return sounds;
}

export function createRepeatedChord({ key, config, generatedMusic, beatsSoFar, bounds, clef }: GenerationParams): GeneratedSounds {
    // TODO-ben : Make this actually generate something (mostly-)in-key instead of a random mess
    const sounds = new GeneratedSounds(config.timeSignature);

    const rhythmicValue = randomItemFrom(RHYTHMIC_VALUES);
    // TODO-ben : Chords need ALL their notes to be within range... not just the root note. Inversion impacts this too.
    const pitch = randInt(bounds.lower, bounds.upper+1);
    const chordQuality = MAJOR_3;
    const inversion = 0;

    // Generate between 1 and 4 repeats
    for (let i = 0; i < randInt(1, 4); i++) {
        sounds.addSound(
            new Chord(
                new Note(pitch, fitRhythmicValue(rhythmicValue, beatsSoFar + sounds.beatCount, config.timeSignature), false),
                chordQuality,
                inversion,
            )
        );
    }

    return sounds;
}

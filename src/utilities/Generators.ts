
import { Clef, PITCH_CLASSES, RHYTHMIC_VALUES, RhythmicValue, TimeSignature } from "../datatypes/BasicTypes";
import { Chord, ChordQuality, OCTAVE, GeneratedMusic, GeneratedSounds, KEYS, Key, MAJOR_3, Music, Note, SEVENTH_QUALITIES, Sound, TRIAD_QUALITIES, OCTAVE_WITH_FIFTH } from "../datatypes/ComplexTypes";
import { SightReadingConfiguration, getAllowedChordQualities } from "../datatypes/Configs";
import { randomItemFrom } from "./ArrayUtils";
import { Bounds } from "./MusicStream";
import { randInt } from "./NumberUtils";


// ===================================================================================================
// NOTICE: When writing or debugging generators, make sure to disable react strict mode in main.tsx by
//         commenting out the <StrictMode> tags. Otherwise, notes will be double-consumed from the
//         music stream, resulting in notes "missing" from what you'd expect to be generated.
// ===================================================================================================


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

// TODO-ben : Move this to one of our "*Types.ts" files..?
export type GenerationParams = {
    key: Key;
    config: SightReadingConfiguration;
    generatedMusic: GeneratedMusic;
    bounds: Bounds;
    clef: Clef;
}


// ==============================
// Treble-Clef-Specific Functions
// ------------------------------

export function createNoteFlurry({ key, config, generatedMusic, bounds, clef }: GenerationParams, maxNotes: number = 8): GeneratedSounds {
    const sounds = new GeneratedSounds(config.timeSignature);
    const rhythmicValue = config.allowRhythmicValues
        ? randomItemFrom(RHYTHMIC_VALUES)
        : RhythmicValue.QUARTER;

    // Continue where we left off
    const thisClef = (clef === Clef.TREBLE) ? generatedMusic.treble : generatedMusic.bass;
    let previousNote = thisClef.sounds.at(-1)?.getNotes()[0] ?? getRandomNote(key);
    if (!previousNote.isInKey(key)) {
        previousNote = getRandomNote(key);
    }

    // Generate between 2 and 8 notes, going either up or down.
    const lowerLimit = Math.max(-config.adjacentNoteDistance, bounds.lower - previousNote.pitch);
    const upperLimit = Math.min(config.adjacentNoteDistance, bounds.upper - previousNote.pitch);
    do { var pitchClassJump = Math.min(5, (randInt(lowerLimit, upperLimit + 1))); }
    while (pitchClassJump === 0); // Staying where we are is boring.

    const numNotes = randInt(2, maxNotes);
    for (let i = 0; i < numNotes; i++) {
        previousNote = previousNote.clone()
            .stepUpInKey(pitchClassJump, key)
            .clampIntoKey(key, bounds.lower, bounds.upper);
        previousNote.rhythmicValue = fitRhythmicValue(rhythmicValue, thisClef.beatCount + sounds.beatCount, config.timeSignature);
        sounds.addSound(previousNote);
    }

    return sounds;
}

export function createMirroredNoteFlurry(generationParams: GenerationParams): GeneratedSounds {
    const { config, generatedMusic, clef } = generationParams;
    const thisClef = (clef === Clef.TREBLE) ? generatedMusic.treble : generatedMusic.bass;

    const sounds = createNoteFlurry(generationParams, 4);
    const rhythmicValue = sounds.sounds[0].getRhythmicValue();

    // Skip repeating the last note so the middle note isn't duplicated.
    for (let i = sounds.sounds.length-2; i >= 0; i--) {
        let newNote = sounds.sounds[i].clone();
        newNote.setRhythmicValue(fitRhythmicValue(rhythmicValue, thisClef.beatCount + sounds.beatCount, config.timeSignature));
        sounds.addSound(newNote);
    }

    return sounds;
}

export function createRepeatedNoteFlurry(generationParams: GenerationParams): GeneratedSounds {
    const { config, generatedMusic, clef } = generationParams;
    const thisClef = (clef === Clef.TREBLE) ? generatedMusic.treble : generatedMusic.bass;

    const sounds = createNoteFlurry(generationParams, 4);
    const rhythmicValue = sounds.sounds[0].getRhythmicValue();

    // Skip repeating the last note so the middle note isn't duplicated.
    const numSounds = sounds.sounds.length;
    for (let i = 0; i < numSounds; i++) {
        let newNote = sounds.sounds[i].clone();
        newNote.setRhythmicValue(fitRhythmicValue(rhythmicValue, thisClef.beatCount + sounds.beatCount, config.timeSignature));
        sounds.addSound(newNote);
    }

    return sounds;
}

export function createRepeatedChord({ key, config, generatedMusic, bounds, clef }: GenerationParams, maxRepeats: number = 4): GeneratedSounds {
    const sounds = new GeneratedSounds(config.timeSignature);
    const rhythmicValue = config.allowRhythmicValues
        ? randomItemFrom(RHYTHMIC_VALUES)
        : RhythmicValue.QUARTER;

    const chord = getRandomChord(key, getAllowedChordQualities(key, config.chordSelection))
    // If for some reason there are no valid chords that I'm looking for, move along.
    if (chord === null) return sounds;
    // Also, if we don't allow inversions, clear those out.
    if (!config.includeInvertedChords) chord.inversion = 0;

    // Set the pitch of the root note to something more reasonable by bumping up its octave.
    const thisClef = (clef === Clef.TREBLE) ? generatedMusic.treble : generatedMusic.bass;
    const previousNote = thisClef.sounds.at(-1)?.getNotes()[0] ?? getRandomNote(key);
    const targetOctave = previousNote.clampIntoKey(key, bounds.lower, bounds.upper).getOctave();
    chord.root.pitch += (12 * targetOctave);

    chord.shiftIntoBounds(bounds.lower, bounds.upper, config.includeInvertedChords);

    // Repeat it a random number of times.
    const repeats = randInt(1, maxRepeats + 1);
    for (let i = 0; i < repeats; i++) {
        const newChord = chord.clone();
        newChord.setRhythmicValue(fitRhythmicValue(rhythmicValue, thisClef.beatCount + sounds.beatCount, config.timeSignature));
        sounds.addSound(newChord);
    }

    return sounds;
}

export function createChordThenBroken(generationParams: GenerationParams): GeneratedSounds {
    const { config, generatedMusic, clef } = generationParams;
    const thisClef = (clef === Clef.TREBLE) ? generatedMusic.treble : generatedMusic.bass;

    const sounds = new GeneratedSounds(config.timeSignature);
    const rhythmicValue = config.allowRhythmicValues
        ? randomItemFrom([RhythmicValue.QUARTER, RhythmicValue.EIGHTH]) // (whole/half are too slow for repeats.)
        : RhythmicValue.QUARTER;

    const chord = createRepeatedChord(generationParams, 1).sounds[0] as Chord;

    chord.setRhythmicValue(fitRhythmicValue(rhythmicValue, thisClef.beatCount + sounds.beatCount, config.timeSignature));
    sounds.addSound(chord);
    chord.getNotes().forEach(n => {
        const newNote = n.clone();
        newNote.setRhythmicValue(fitRhythmicValue(rhythmicValue, thisClef.beatCount + sounds.beatCount, config.timeSignature));
        sounds.addSound(newNote);
    });

    return sounds;
}

export function createBrokenThenChord(generationParams: GenerationParams): GeneratedSounds {
    const { config, generatedMusic, clef } = generationParams;
    const thisClef = (clef === Clef.TREBLE) ? generatedMusic.treble : generatedMusic.bass;

    const sounds = new GeneratedSounds(config.timeSignature);
    const rhythmicValue = config.allowRhythmicValues
        ? randomItemFrom([RhythmicValue.QUARTER, RhythmicValue.EIGHTH]) // (whole/half are too slow for repeats.)
        : RhythmicValue.QUARTER;

    const chord = createRepeatedChord(generationParams, 1).sounds[0] as Chord;

    chord.getNotes().forEach(n => {
        const newNote = n.clone();
        newNote.setRhythmicValue(fitRhythmicValue(rhythmicValue, thisClef.beatCount + sounds.beatCount, config.timeSignature));
        sounds.addSound(newNote);
    });
    chord.setRhythmicValue(fitRhythmicValue(rhythmicValue, thisClef.beatCount + sounds.beatCount, config.timeSignature));
    sounds.addSound(chord);

    return sounds;
}


// ============================
// Bass-Clef-Specific Functions
// ----------------------------

export function createSingleNote({ key, config, generatedMusic, bounds }: GenerationParams): GeneratedSounds {
    const sounds = new GeneratedSounds(config.timeSignature);
    const rhythmicValue = config.allowRhythmicValues
        ? randomItemFrom([RhythmicValue.WHOLE, RhythmicValue.HALF])
        : RhythmicValue.WHOLE;

    // Make this note based on the treble clef.
    const trebleClefSound = generatedMusic.treble.getSoundAtBeat(generatedMusic.bass.beatCount);
    const newNote = trebleClefSound
        ? new Note(trebleClefSound?.getNotes()[0].pitch, rhythmicValue)
        : getRandomNote(key);

    while (newNote.pitch > bounds.upper) { newNote.shiftOctaves(-1); }
    newNote.setRhythmicValue(fitRhythmicValue(rhythmicValue, generatedMusic.bass.beatCount + sounds.beatCount, config.timeSignature));

    sounds.addSound(newNote);

    return sounds;
}

export function createOctave({ key, config, generatedMusic, bounds }: GenerationParams): GeneratedSounds {
    const sounds = new GeneratedSounds(config.timeSignature);
    const rhythmicValue = config.allowRhythmicValues
        ? randomItemFrom([RhythmicValue.WHOLE, RhythmicValue.HALF])
        : RhythmicValue.WHOLE;

    // Make this note based on the treble clef.
    const trebleClefSound = generatedMusic.treble.getSoundAtBeat(generatedMusic.bass.beatCount);
    const highNote = trebleClefSound
        ? new Note(trebleClefSound?.getNotes()[0].pitch, rhythmicValue)
        : getRandomNote(key);

    while (highNote.pitch > bounds.upper) { highNote.shiftOctaves(-1); }
    highNote.setRhythmicValue(fitRhythmicValue(rhythmicValue, generatedMusic.bass.beatCount + sounds.beatCount, config.timeSignature));

    const lowNote = highNote.clone().shiftOctaves(-1);

    // Can only generate this type if we can fit both notes in the bounds, but include a sensible fallback.
    sounds.addSound(lowNote.pitch < bounds.lower
        ? highNote
        : new Chord(lowNote, OCTAVE, 0));

    return sounds;
}

export function createOctaveWithFifth({ key, config, generatedMusic, bounds }: GenerationParams): GeneratedSounds {
    const sounds = new GeneratedSounds(config.timeSignature);
    const rhythmicValue = config.allowRhythmicValues
        ? randomItemFrom([RhythmicValue.WHOLE, RhythmicValue.HALF])
        : RhythmicValue.WHOLE;

    // Make this note based on the treble clef.
    const trebleClefSound = generatedMusic.treble.getSoundAtBeat(generatedMusic.bass.beatCount);
    const highNote = trebleClefSound
        ? new Note(trebleClefSound?.getNotes()[0].pitch, rhythmicValue)
        : getRandomNote(key);

    while (highNote.pitch > bounds.upper) { highNote.shiftOctaves(-1); }
    highNote.setRhythmicValue(fitRhythmicValue(rhythmicValue, generatedMusic.bass.beatCount + sounds.beatCount, config.timeSignature));

    const lowNote = highNote.clone().shiftOctaves(-1);

    // Can only generate this type if we can fit both notes in the bounds, but include a sensible fallback.
    sounds.addSound(lowNote.pitch < bounds.lower
        ? highNote
        : new Chord(lowNote, OCTAVE_WITH_FIFTH, 0));

    return sounds;
}

export function createOctaveWithDelayedFifth({ key, config, generatedMusic, bounds }: GenerationParams): GeneratedSounds {
    const sounds = new GeneratedSounds(config.timeSignature);
    const rhythmicValue = RhythmicValue.HALF;

    // Make this note based on the treble clef.
    const trebleClefSound = generatedMusic.treble.getSoundAtBeat(generatedMusic.bass.beatCount);
    const highNote = trebleClefSound
        ? new Note(trebleClefSound?.getNotes()[0].pitch, rhythmicValue)
        : getRandomNote(key);

    while (highNote.pitch > bounds.upper) { highNote.shiftOctaves(-1); }
    highNote.setRhythmicValue(fitRhythmicValue(rhythmicValue, generatedMusic.bass.beatCount + sounds.beatCount, config.timeSignature));

    const lowNote = highNote.clone().shiftOctaves(-1);

    // Can only generate this type if we can fit both notes in the bounds, but include a sensible fallback.
    if (lowNote.pitch < bounds.lower) {
        sounds.addSound(highNote);
    } else {
        sounds.addSound(new Chord(lowNote, OCTAVE, 0));
    }
    sounds.addSound(lowNote.clone().stepUp(7));

    return sounds;
}

export function createRootWithDelayedFifthEighth({ key, config, generatedMusic, bounds }: GenerationParams): GeneratedSounds {
    const sounds = new GeneratedSounds(config.timeSignature);
    const rhythmicValue = RhythmicValue.QUARTER;

    // Make this note based on the treble clef.
    const trebleClefSound = generatedMusic.treble.getSoundAtBeat(generatedMusic.bass.beatCount);
    const highNote = trebleClefSound
        ? new Note(trebleClefSound?.getNotes()[0].pitch, rhythmicValue)
        : getRandomNote(key);

    while (highNote.pitch > bounds.upper) { highNote.shiftOctaves(-1); }
    highNote.setRhythmicValue(fitRhythmicValue(rhythmicValue, generatedMusic.bass.beatCount + sounds.beatCount, config.timeSignature));

    const lowNote = highNote.clone().shiftOctaves(-1);
    const fifthNote = lowNote.clone().stepUp(7);

    // Can only generate this type if we can fit both notes in the bounds, but include a sensible fallback.
    if (lowNote.pitch < bounds.lower) {
        sounds.addSound(highNote.clone());
        sounds.addSound(fifthNote.clone());
        sounds.addSound(highNote.clone());
        sounds.addSound(fifthNote.clone());
    } else {
        sounds.addSound(highNote);
        sounds.addSound(fifthNote.clone());
        sounds.addSound(lowNote);
        sounds.addSound(fifthNote.clone());
    }

    return sounds;
}
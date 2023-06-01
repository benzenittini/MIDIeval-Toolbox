
import { ChordQuality, PITCH_CLASSES, RhythmicValue, SEVENTH_QUALITIES, TRIAD_QUALITIES } from "../datatypes/BasicTypes";
import { Chord, KEYS, Key, Note } from "../datatypes/ComplexTypes";
import { randomItemFrom } from "./ArrayUtils";
import { randInt } from "./NumberUtils";


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
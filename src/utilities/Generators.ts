import { Chord, ChordQuality, Note, RhythmicValue, SEVENTH_QUALITIES, TRIAD_QUALITIES, Key, KEYS, PITCH_CLASSES } from "../datatypes/Musics";
import { randomItemFrom } from "./ArrayUtils";
import { createChord, createNote, getChordsInKey, getScale } from "./MusicUtils";
import { randInt } from "./NumberUtils";

export function getRandomKey(): Key {
    return KEYS[randInt(0, KEYS.length)];
}

export function getRandomNote(key: Key | null): Note {
    const availablePitches = key === null ? PITCH_CLASSES : getScale(key);
    const pitchClass = availablePitches[randInt(0, availablePitches.length)];
    return createNote(pitchClass, RhythmicValue.QUARTER, 4, false);
}

export function getRandomChord(key: Key | null, allowedQualities: ChordQuality[]): Chord | null {
    let rootChord: Chord;
    if (key === null) {
        const note = getRandomNote(key);
        const quality = allowedQualities[randInt(0, allowedQualities.length)];
        rootChord = createChord(note, quality);
    } else {
        const validChords = getChordsInKey(key).filter(c => allowedQualities.includes(c.quality));
        if (validChords.length === 0) {
            return null;
        }
        rootChord = randomItemFrom(validChords);
    }

    const inversion =
        (TRIAD_QUALITIES.includes(rootChord.quality as any)) ? randInt(0, 3) :
        (SEVENTH_QUALITIES.includes(rootChord.quality as any)) ? randInt(0, 4) :
        0;

    return createChord(rootChord.root, rootChord.quality, inversion);
}
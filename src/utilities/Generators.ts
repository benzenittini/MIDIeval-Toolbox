import { Chord, ChordQuality, Note, RhythmicValue, SEVENTH_QUALITIES, TRIAD_QUALITIES, Key, KEYS } from "../datatypes/Musics";
import { createChord, createNote, getScale } from "./MusicUtils";
import { randInt } from "./NumberUtils";

export function getRandomKey(): Key {
    return KEYS[randInt(0, KEYS.length)];
}

export function getRandomNote(key: Key): Note {
    const availablePitches = getScale(key);
    const pitchClass = availablePitches[randInt(0, availablePitches.length)];
    return createNote(pitchClass, RhythmicValue.QUARTER, 4, false);
}

export function getRandomChord(key: Key, allowedQualities: ChordQuality[]): Chord {
    // TODO-ben : This doesn't work. Don't want to generate the note and quality independently.
    const note = getRandomNote(key);
    const quality = allowedQualities[randInt(0, allowedQualities.length)];
    const inversion =
        (TRIAD_QUALITIES.includes(quality as any)) ? randInt(0, 3) :
        (SEVENTH_QUALITIES.includes(quality as any)) ? randInt(0, 4) :
        0;

    return createChord(note, quality, inversion);
}
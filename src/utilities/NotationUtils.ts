
import { ChordQuality, PitchClass, SeventhQuality, TriadQuality, Key, Sound, MajorKeys, Chord, Note, Accidental } from "../datatypes/Musics";
import { randomItemFrom } from "./ArrayUtils";
import { getChordNotes, getScale, isAChord, isANote } from "./MusicUtils";


export function getStringNotation(key: Key | null, sound: Sound): string {
    return ('root' in sound)
        ? /* Chord */ pitchClassToLetter(key, sound.root.pitchClass) + getQualityNotation(sound.quality)
        : /* Note  */ pitchClassToLetter(key, sound.pitchClass);
}

export function getQualityNotation(quality: ChordQuality): string {
    switch (quality) {
        // -- Triads --
        case TriadQuality.MAJOR:      return randomItemFrom(['maj', '', 'M', 'Δ']);
        case TriadQuality.MINOR:      return randomItemFrom(['min', 'm', '-']);
        case TriadQuality.DIMINISHED: return randomItemFrom(['dim', '<sup>○</sup>', 'm<sup>♭5</sup>', 'm<sup>○5</sup>']);
        case TriadQuality.AUGMENTED:  return randomItemFrom(['aug', '+', 'maj<sup>♯5</sup>', 'maj<sup>+5</sup>']);

        // -- Sevenths --
        case SeventhQuality.MAJOR_7:       return randomItemFrom(['<sup>Maj7</sup>']);
        case SeventhQuality.MINOR_7:       return randomItemFrom(['m<sup>7</sup>', '-7']);
        case SeventhQuality.DOMINANT_7:    return randomItemFrom(['<sup>7</sup>']);
        case SeventhQuality.HALF_DIM_7:    return randomItemFrom(['<sup>∅</sup>7', '-7<sup>♭5</sup>']);
        case SeventhQuality.DIMINISHED_7:  return randomItemFrom(['<sup>○</sup>7']);
        case SeventhQuality.MINOR_MAJOR_7: return randomItemFrom(['min<sup>Maj7</sup>', 'm<sup>M7</sup>']);
        case SeventhQuality.AUG_MAJOR_7:   return randomItemFrom(['aug<sup>Maj7</sup>']);
    }
}

export function pitchClassToLetter(key: Key | null, pitchClass: PitchClass): NoteLetter {
    // If a key is defined, and the pitch class is in key, use a non-accidental.
    if (key !== null) {
        const inKey = LETTERS_IN_KEY[key][pitchClass];
        if (inKey !== null) return inKey;
    }

    // If all else fails, eenie meenie!
    return randomItemFrom(PITCH_CLASS_TO_LETTERS[pitchClass]);
}

const BASE_LETTERS = 'ABCDEFG'.split('');
export type Letter = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
export type NoteLetter =
    'A♭' | 'A' | 'A♯' |
    'B♭' | 'B' | 'B♯' |
    'C♭' | 'C' | 'C♯' |
    'D♭' | 'D' | 'D♯' |
    'E♭' | 'E' | 'E♯' |
    'F♭' | 'F' | 'F♯' |
    'G♭' | 'G' | 'G♯';
export const PITCH_CLASS_TO_LETTERS: NoteLetter[][] = [
    ['C', 'B♯'],
    ['D♭', 'C♯'],
    ['D'],
    ['E♭', 'D♯'],
    ['F♭', 'E'],
    ['F',  'E♯'],
    ['G♭', 'F♯'],
    ['G'],
    ['A♭', 'G♯'],
    ['A'],
    ['B♭', 'A♯'],
    ['C♭', 'B'],
];

/**
 * Returns the interval between two note letters. "1" === root, "3" === third, "5" === fifth, ...
 */
export function getInterval(a: NoteLetter, b: NoteLetter): number {
    return Math.abs(BASE_LETTERS.indexOf(a.charAt(0)) - BASE_LETTERS.indexOf(b.charAt(0))) + 1;
}

export function getAccidental(letter: NoteLetter): Accidental {
    switch (letter.charAt(1)) {
        case '♭': return Accidental.FLAT;
        case '':  return Accidental.NATURAL;
        case '♯': return Accidental.SHARP;

        // Should never come up.
        default: return Accidental.NATURAL;
    }
}

export const LETTERS_IN_KEY: Record<Key, (NoteLetter | null)[]> = {
    [MajorKeys.CFLAT_MAJOR]:  getNotesInKey(MajorKeys.CFLAT_MAJOR,  'C♭'),
    [MajorKeys.C_MAJOR]:      getNotesInKey(MajorKeys.C_MAJOR,      'C'),
    [MajorKeys.CSHARP_MAJOR]: getNotesInKey(MajorKeys.CSHARP_MAJOR, 'C♯'),
    [MajorKeys.DFLAT_MAJOR]:  getNotesInKey(MajorKeys.DFLAT_MAJOR,  'D♭'),
    [MajorKeys.D_MAJOR]:      getNotesInKey(MajorKeys.D_MAJOR,      'D'),
    [MajorKeys.EFLAT_MAJOR]:  getNotesInKey(MajorKeys.EFLAT_MAJOR,  'E♭'),
    [MajorKeys.E_MAJOR]:      getNotesInKey(MajorKeys.E_MAJOR,      'E'),
    [MajorKeys.F_MAJOR]:      getNotesInKey(MajorKeys.F_MAJOR,      'F'),
    [MajorKeys.FSHARP_MAJOR]: getNotesInKey(MajorKeys.FSHARP_MAJOR, 'F♯'),
    [MajorKeys.GFLAT_MAJOR]:  getNotesInKey(MajorKeys.GFLAT_MAJOR,  'G♭'),
    [MajorKeys.G_MAJOR]:      getNotesInKey(MajorKeys.G_MAJOR,      'G'),
    [MajorKeys.AFLAT_MAJOR]:  getNotesInKey(MajorKeys.AFLAT_MAJOR,  'A♭'),
    [MajorKeys.A_MAJOR]:      getNotesInKey(MajorKeys.A_MAJOR,      'A'),
    [MajorKeys.BFLAT_MAJOR]:  getNotesInKey(MajorKeys.BFLAT_MAJOR,  'B♭'),
    [MajorKeys.B_MAJOR]:      getNotesInKey(MajorKeys.B_MAJOR,      'B'),
}

/**
 * Returns an array of string-represented notes, indexed by the note's pitch class (0 = C, ...). For pitch
 * classes outside the key, a "null" value is returned. The "starting note" is the root note of the key.
 * 
 * Examples:
 *   C major is: ['C',  null, 'D', null, 'E', 'F',  null, 'G', null, 'A', null, 'B']
 *   D major is: [null, 'C♯', 'D', null, 'E', null, 'F♯', 'G', null, 'A', null, 'B']
 */
function getNotesInKey(key: Key, startingNote: NoteLetter): (NoteLetter | null)[] {
    let retVal = new Array(12).fill(null);
    let currentLetterIndex = BASE_LETTERS.indexOf(startingNote.charAt(0));
    for (let pc of getScale(key)) {
        let availableLetters = PITCH_CLASS_TO_LETTERS[pc];
        retVal[pc] = availableLetters.find(opt => opt.startsWith(BASE_LETTERS[currentLetterIndex]));
        currentLetterIndex++;
        currentLetterIndex %= BASE_LETTERS.length;
    }
    return retVal;
}
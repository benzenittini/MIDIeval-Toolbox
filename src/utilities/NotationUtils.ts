
import { ChordQuality, PitchClass, SeventhQuality, TriadQuality, C, A, Key, B, D, E, F, G, CFLAT, FFLAT, EFLAT, DFLAT, GFLAT, AFLAT, BFLAT, CSHARP, DSHARP, ESHARP, FSHARP, GSHARP, ASHARP, BSHARP, Sound } from "../datatypes/Musics";
import { randomItemFrom } from "./ArrayUtils";


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

export function pitchClassToLetter(key: Key | null, pitchClass: PitchClass): string {
    if (key === null) {
        switch (pitchClass) {
            case 0:  return randomItemFrom(['C', 'B♯']);
            case 1:  return randomItemFrom(['C♯', 'D♭']);
            case 2:  return randomItemFrom(['D']);
            case 3:  return randomItemFrom(['D♯', 'E♭']);
            case 4:  return randomItemFrom(['E', 'F♭']);
            case 5:  return randomItemFrom(['F', 'E♯']);
            case 6:  return randomItemFrom(['F♯', 'G♭']);
            case 7:  return randomItemFrom(['G']);
            case 8:  return randomItemFrom(['G♯', 'A♭']);
            case 9:  return randomItemFrom(['A']);
            case 10: return randomItemFrom(['A♯', 'B♭']);
            case 11: return randomItemFrom(['B', 'C♭']);
        }
    } else {
        return PITCH_LOOKUP[key][pitchClass];
    }
}

/** Given a key and pitch, returns the letter representation of the pitch. */
export const PITCH_LOOKUP: any = {
    'C♭ Major': {[CFLAT]: 'C♭',  [DFLAT]: 'D♭',  [EFLAT]: 'E♭',  [FFLAT]: 'F♭',  [GFLAT]: 'G♭',  [AFLAT]: 'A♭',  [BFLAT]: 'B♭'},
    'C Major':  {[C]: 'C',       [D]: 'D',       [E]: 'E',       [F]: 'F',       [G]: 'G',       [A]: 'A',       [B]: 'B'},
    'C♯ Major': {[CSHARP]: 'C♯', [DSHARP]: 'D♯', [ESHARP]: 'E♯', [FSHARP]: 'F♯', [GSHARP]: 'G♯', [ASHARP]: 'A♯', [BSHARP]: 'B♯'},
    'D♭ Major': {[DFLAT]: 'D♭',  [EFLAT]: 'E♭',  [F]: 'F',       [GFLAT]: 'G♭',  [AFLAT]: 'A♭',  [BFLAT]: 'B♭',  [C]: 'C'},
    'D Major':  {[D]: 'D',       [E]: 'E',       [FSHARP]: 'F♯', [G]: 'G',       [A]: 'A',       [B]: 'B',       [CSHARP]: 'C♯'},
    'E♭ Major': {[EFLAT]: 'E♭',  [F]: 'F',       [G]: 'G',       [AFLAT]: 'A♭',  [BFLAT]: 'B♭',  [C]: 'C',       [D]: 'D'},
    'E Major':  {[E]: 'E',       [FSHARP]: 'F♯', [GSHARP]: 'G♯', [A]: 'A',       [B]: 'B',       [CSHARP]: 'C♯', [DSHARP]: 'D♯'},
    'F Major':  {[F]: 'F',       [G]: 'G',       [A]: 'A',       [BFLAT]: 'B♭',  [C]: 'C',       [D]: 'D',       [E]: 'E'},
    'F♯ Major': {[FSHARP]: 'F♯', [GSHARP]: 'G♯', [ASHARP]: 'A♯', [B]: 'B',       [CSHARP]: 'C♯', [DSHARP]: 'D♯', [ESHARP]: 'E♯'},
    'G♭ Major': {[GFLAT]: 'G♭',  [AFLAT]: 'A♭',  [BFLAT]: 'B♭',  [CFLAT]: 'C♭',  [DFLAT]: 'D♭',  [EFLAT]: 'E♭',  [F]: 'F'},
    'G Major':  {[G]: 'G',       [A]: 'A',       [B]: 'B',       [C]: 'C',       [D]: 'D',       [E]: 'E',       [FSHARP]: 'F♯'},
    'A♭ Major': {[AFLAT]: 'A♭',  [BFLAT]: 'B♭',  [C]: 'C',       [DFLAT]: 'D♭',  [EFLAT]: 'E♭',  [F]: 'F',       [G]: 'G'},
    'A Major':  {[A]: 'A',       [B]: 'B',       [CSHARP]: 'C♯', [D]: 'D',       [E]: 'E',       [FSHARP]: 'F♯', [GSHARP]: 'G♯'},
    'B♭ Major': {[BFLAT]: 'B♭',  [C]: 'C',       [D]: 'D',       [EFLAT]: 'E♭',  [F]: 'F',       [G]: 'G',       [A]: 'A'},
    'B Major':  {[B]: 'B',       [CSHARP]: 'C♯', [DSHARP]: 'D♯', [E]: 'E',       [FSHARP]: 'F♯', [GSHARP]: 'G♯', [ASHARP]: 'A♯'},
}
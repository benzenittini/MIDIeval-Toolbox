
import { Dispatch, createContext, useContext, useReducer } from "react";

import { MiscKeys, SightReadingConfiguration } from "../../datatypes/Configs";
import { MAJOR_KEY_LOOKUP } from "../../datatypes/ComplexTypes";


// ========
// Contexts
// --------

const SightReadingConfigContext         = createContext(null as unknown as SightReadingConfiguration);
const SightReadingConfigDispatchContext = createContext(null as unknown as Dispatch<DispatchAction>);
export function useSightReadingConfig()         { return useContext(SightReadingConfigContext); }
export function useSightReadingConfigDispatch() { return useContext(SightReadingConfigDispatchContext); }


// ========
// Provider
// --------

export const START_DIFFICULTY = 1;

export function SightReadingConfigProvider({ children }: any) {
    const [config, dispatch] = useReducer(sightReadingConfigReducer, getConfigByDifficulty(START_DIFFICULTY));

    return (
        <SightReadingConfigContext.Provider value={config}>
            <SightReadingConfigDispatchContext.Provider value={dispatch}>
                {children}
            </SightReadingConfigDispatchContext.Provider>
        </SightReadingConfigContext.Provider>
    );
}

function getLevel1Difficulty(): SightReadingConfiguration {
    return {
        // Basics
        key: "C_MAJOR",
        allowAccidentals: false,
        includeTrebleClef: true,
        includeBassClef: false,
        timeSignature: { top: 4, bottom: 4 },

        // Difficulty
        tempo: 60,
        playMetronome: false,
        waitForCorrectNote: true,
        allowRhythmicValues: false,
        adjacentNoteDistance: 1,

        // Note/Chord Types
        practiceSingleNotes: true,
        practiceChords: false,
        includeBrokenChords: false,
        includeInvertedChords: false,

        chordSelection: {
            // Triads
            includeTriads: true,
            includeMaj3: true,
            includeMin3: true,
            includeDim3: true,
            includeAug3: false,

            // Sevenths
            includeSevenths: false,
            includeMaj7: true,
            includeMin7: true,
            includeDom7: true,
            includeHalfDim7: true,
            includeDim7: false,
            includeMinMaj7: false,
            includeAugMaj7: false,
        }
    };
}

/** Difficult is in the inclusive range: [1, 10] */
function getConfigByDifficulty(difficulty: number) {
    let config = getLevel1Difficulty();
    config.adjacentNoteDistance = difficulty;

    if (difficulty >= 2) {
        config.key = MiscKeys.RANDOM_KEY;
        config.includeBassClef = true;
    }
    if (difficulty >= 3) {
        config.practiceChords = true;
    }
    if (difficulty >= 4) {
        config.includeBrokenChords = true;
        config.includeInvertedChords = true;
    }
    if (difficulty >= 5) {
        config.waitForCorrectNote = false;
        config.playMetronome = true;
        config.allowRhythmicValues = true;
    }
    if (difficulty >= 6) {
        config.allowAccidentals = true;
    }
    if (difficulty >= 7) {
        config.chordSelection.includeSevenths = true;
    }
    if (difficulty >= 8) {
        config.playMetronome = false;
    }
    if (difficulty >= 9) {
        config.chordSelection.includeAug3 = true;
    }
    if (difficulty >= 10) {
        config.chordSelection.includeDim7 = true;
        config.chordSelection.includeMinMaj7 = true;
        config.chordSelection.includeAugMaj7 = true;
    }

    return config;
}


// =======
// Reducer
// -------

type DispatchAction = {type: string, data?: any};
function sightReadingConfigReducer(config: SightReadingConfiguration, action: DispatchAction): SightReadingConfiguration {
    switch (action.type) {
        // -- Quick Settings --
        case 'quickDifficulty': return getConfigByDifficulty(action.data);

        // -- Basics --
        case 'setKey':            return { ...config, key:               action.data };
        case 'allowAccidentals':  return { ...config, allowAccidentals:  action.data };
        case 'includeTrebleClef': return { ...config, includeTrebleClef: action.data };
        case 'includeBassClef':   return { ...config, includeBassClef:   action.data };
        case 'timeSignature':     return { ...config, timeSignature:     action.data };

        // -- Difficulty --
        case 'tempo':                return { ...config, tempo:                action.data };
        case 'playMetronome':        return { ...config, playMetronome:        action.data };
        case 'waitForCorrectNote':   return { ...config, waitForCorrectNote:   action.data };
        case 'allowRhythmicValues':  return { ...config, allowRhythmicValues:  action.data };
        case 'adjacentNoteDistance': return { ...config, adjacentNoteDistance: action.data };

        // -- Note/Chord Types --
        case 'practiceSingleNotes':   return { ...config, practiceSingleNotes:   action.data };
        case 'practiceChords':        return { ...config, practiceChords:        action.data };
        case 'includeBrokenChords':   return { ...config, includeBrokenChords:   action.data };
        case 'includeInvertedChords': return { ...config, includeInvertedChords: action.data };

        // -- Triads --
        case 'includeTriads': return { ...config, chordSelection: { ...config.chordSelection, includeTriads: action.data } };
        case 'includeMaj3':   return { ...config, chordSelection: { ...config.chordSelection, includeMaj3: action.data } };
        case 'includeMin3':   return { ...config, chordSelection: { ...config.chordSelection, includeMin3: action.data } };
        case 'includeDim3':   return { ...config, chordSelection: { ...config.chordSelection, includeDim3: action.data } };
        case 'includeAug3':   return { ...config, chordSelection: { ...config.chordSelection, includeAug3: action.data } };

        // -- Sevenths --
        case 'includeSevenths': return { ...config, chordSelection: { ...config.chordSelection, includeSevenths: action.data } };
        case 'includeMaj7':     return { ...config, chordSelection: { ...config.chordSelection, includeMaj7: action.data } };
        case 'includeMin7':     return { ...config, chordSelection: { ...config.chordSelection, includeMin7: action.data } };
        case 'includeDom7':     return { ...config, chordSelection: { ...config.chordSelection, includeDom7: action.data } };
        case 'includeHalfDim7': return { ...config, chordSelection: { ...config.chordSelection, includeHalfDim7: action.data } };
        case 'includeDim7':     return { ...config, chordSelection: { ...config.chordSelection, includeDim7: action.data } };
        case 'includeMinMaj7':  return { ...config, chordSelection: { ...config.chordSelection, includeMinMaj7: action.data } };
        case 'includeAugMaj7':  return { ...config, chordSelection: { ...config.chordSelection, includeAugMaj7: action.data } };

        default: throw new Error(`Unrecognized action type: ${action.type}`);
    }
}

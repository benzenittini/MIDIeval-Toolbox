
import { Dispatch, createContext, useContext, useReducer } from "react";

import { MiscKeys, NotationConfiguration } from "../../datatypes/Configs";


// ========
// Contexts
// --------

const NotationConfigContext         = createContext(null as unknown as NotationConfiguration);
const NotationConfigDispatchContext = createContext(null as unknown as Dispatch<DispatchAction>);
export function useNotationConfig()         { return useContext(NotationConfigContext); }
export function useNotationConfigDispatch() { return useContext(NotationConfigDispatchContext); }


// ========
// Provider
// --------

export function NotationConfigProvider({ children }: any) {
    const [config, dispatch] = useReducer(notationConfigReducer, initialConfig);

    return (
        <NotationConfigContext.Provider value={config}>
            <NotationConfigDispatchContext.Provider value={dispatch}>
                {children}
            </NotationConfigDispatchContext.Provider>
        </NotationConfigContext.Provider>
    );
}

const initialConfig: NotationConfiguration = {
    key: MiscKeys.ANYTHING_GOES,
    progressSelector: { type: 'timed', timedDuration: 5 },
    practiceSingleNotes: false,
    practiceChords: true,

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
}


// =======
// Reducer
// -------

type DispatchAction = {type: string, data?: any};
function notationConfigReducer(config: NotationConfiguration, action: DispatchAction): NotationConfiguration {
    switch (action.type) {
        // -- Core Settings --
        case 'setKey':                   return { ...config, key: action.data };
        case 'setProgressType':          return { ...config, progressSelector: { ...config.progressSelector, type: action.data } };
        case 'setTimedProgressDuration': return { ...config, progressSelector: { ...config.progressSelector, timedDuration: action.data } };
        case 'practiceSingleNotes':      return { ...config, practiceSingleNotes: true,  practiceChords: false };
        case 'practiceChords':           return { ...config, practiceSingleNotes: false, practiceChords: true };

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

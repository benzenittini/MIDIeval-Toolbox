
import { Dispatch, createContext, useContext, useReducer } from "react";

import { MiscKeys, SightReadingConfiguration } from "../../datatypes/Configs";


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

export function SightReadingConfigProvider({ children }: any) {
    const [config, dispatch] = useReducer(sightReadingConfigReducer, initialConfig);

    return (
        <SightReadingConfigContext.Provider value={config}>
            <SightReadingConfigDispatchContext.Provider value={dispatch}>
                {children}
            </SightReadingConfigDispatchContext.Provider>
        </SightReadingConfigContext.Provider>
    );
}

const initialConfig: SightReadingConfiguration = {
    key: MiscKeys.ANYTHING_GOES,
    practiceSingleNotes: false,
    practiceChords: true,
    // Triads
    includeTriads: true,
    includeMaj3: true,
    includeMin3: true,
    includeAug3: false,
    includeDim3: true,
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


// =======
// Reducer
// -------

type DispatchAction = {type: string, data?: any};
function sightReadingConfigReducer(config: SightReadingConfiguration, action: DispatchAction): SightReadingConfiguration {
    switch (action.type) {
        // -- Core Settings --
        case 'setKey':                   return { ...config, key: action.data };
        case 'practiceSingleNotes':      return { ...config, practiceSingleNotes: action.data };
        case 'practiceChords':           return { ...config, practiceChords: action.data };

        // -- Triads --
        case 'includeTriads': return { ...config, includeTriads: action.data };
        case 'includeMaj3':   return { ...config, includeMaj3: action.data };
        case 'includeMin3':   return { ...config, includeMin3: action.data };
        case 'includeAug3':   return { ...config, includeAug3: action.data };
        case 'includeDim3':   return { ...config, includeDim3: action.data };

        // -- Sevenths --
        case 'includeSevenths': return { ...config, includeSevenths: action.data };
        case 'includeMaj7':     return { ...config, includeMaj7: action.data };
        case 'includeMin7':     return { ...config, includeMin7: action.data };
        case 'includeDom7':     return { ...config, includeDom7: action.data };
        case 'includeHalfDim7': return { ...config, includeHalfDim7: action.data };
        case 'includeDim7':     return { ...config, includeDim7: action.data };
        case 'includeMinMaj7':  return { ...config, includeMinMaj7: action.data };
        case 'includeAugMaj7':  return { ...config, includeAugMaj7: action.data };

        default: throw new Error(`Unrecognized action type: ${action.type}`);
    }
}


import { useState } from 'react';

import './App.css'
import { Page } from './datatypes/Miscellaneous';
import PracticeSelection from './components/PracticeSelection';
import { NotationConfigProvider } from './components/notation/NotationConfigContext';
import NotationConfig from './components/notation/NotationConfig';
import NotationPractice from './components/notation/NotationPractice';
import SightReadingConfig from './components/sight-reading/SightReadingConfig';
import SightReadingPractice from './components/sight-reading/SightReadingPractice';
import { SightReadingConfigProvider } from './components/sight-reading/SightReadingConfigContext';


export default function App() {
    /** Determines which main screen / page to display. */
    const [currentScreen, setCurrentScreen] = useState('practice-selection' as Page);

    function getDisplayedContent() {
        switch (currentScreen) {
            case "practice-selection":
                return (<PracticeSelection setPractice={(practice: Page) => setCurrentScreen(practice)}/>);

            // -- Notation Practice
            case "notation-config":
                return (<NotationConfig
                    goBack={() => setCurrentScreen('practice-selection')}
                    begin={() => setCurrentScreen('notation-practice')}
                />);
            case "notation-practice":
                return (<NotationPractice
                    goToConfig={() => setCurrentScreen('notation-config')}
                    goHome={() => setCurrentScreen('practice-selection')}
                />);

            // -- Sight-Reading Practice
            case "sight-reading-config":
                return (<SightReadingConfig
                    goBack={() => setCurrentScreen('practice-selection')}
                    begin={() => setCurrentScreen('sight-reading-practice')}
                />);
            case "sight-reading-practice":
                return (<SightReadingPractice
                    goToConfig={() => setCurrentScreen('sight-reading-config')}
                    goHome={() => setCurrentScreen('practice-selection')}
                />);

            default:
                throw new Error("Unrecognized content type.");
        }
    }

    return (
        <NotationConfigProvider>
            <SightReadingConfigProvider>
                { getDisplayedContent() }
            </SightReadingConfigProvider>
        </NotationConfigProvider>
    )
}


import { useState } from 'react';

import './App.css'
import { Page } from './datatypes/Miscellaneous';
import PracticeSelection from './components/setup/PracticeSelection';
import { NotationConfigProvider } from './components/setup/notation/NotationConfigContext';
import NotationConfig from './components/setup/notation/NotationConfig';
import NotationPractice from './components/setup/notation/NotationPractice';


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
                // TODO-ben : Add component for sight-reading-config

            default:
                throw new Error("Unrecognized content type.");
        }
    }

    return (
        <NotationConfigProvider>
            { getDisplayedContent() }
        </NotationConfigProvider>
    )
}

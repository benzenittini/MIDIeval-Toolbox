
import { useState } from 'react';

import './App.css'
import PracticeSelection from './components/setup/PracticeSelection';
import { NotationConfigProvider } from './components/setup/notation/NotationConfigContext';
import NotationConfig from './components/setup/notation/NotationConfig';
import { Page } from './datatypes/Miscellaneous';


export default function App() {
    /** Determines which main screen / page to display. */
    const [currentScreen, setCurrentScreen] = useState("practice-selection" as Page);

    function getDisplayedContent() {
        switch (currentScreen) {
            case "practice-selection":
                return (
                    <PracticeSelection setPractice={(practice: Page) => setCurrentScreen(practice)}/>
                );
            case "notation-config":
                return (
                    <NotationConfigProvider>
                        <NotationConfig goBack={() => setCurrentScreen('practice-selection')}></NotationConfig>
                    </NotationConfigProvider>
                );
            case "sight-reading-config":
                // TODO-ben : Add component for sight-reading-config
            default:
                throw new Error("Unrecognized content type.");
        }
    }

    return (
        <>
            { getDisplayedContent() }
        </>
    )
}

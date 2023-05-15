import ChordSelection from "./ChordSelection";
import KeySelection from "./KeySelection";

import styles from './NotationConfig.module.css';
import { useNotationConfig, useNotationConfigDispatch } from "./NotationConfigContext";
import ProgressSelector from "./ProgressSelector";

export default function NotationConfig({ goBack, begin }: { goBack: () => void, begin: () => void }) {
    const notationConfig = useNotationConfig();
    const notationConfigDispatch = useNotationConfigDispatch();

    return (
        <>
            <h1>Practice<span className={styles.practiceType}> : Notation</span></h1>

            <div className={ styles.topRow }>
                <div className={ styles.topLeft }>
                    <KeySelection></KeySelection>

                    <div className="formLine">
                        <input type="checkbox" id="includeSingleNotes"
                            checked={ notationConfig.includeSingleNotes }
                            onChange={ (e) => notationConfigDispatch({ type: 'includeSingleNotes', data: e.target.checked }) } />
                        <label htmlFor="includeSingleNotes">Include Single Notes (ex: F#)</label>
                    </div>

                    <div className="formLine">
                        <input type="checkbox" id="includeChords"
                            checked={ notationConfig.includeChords }
                            onChange={ (e) => notationConfigDispatch({ type: 'includeChords', data: e.target.checked }) } />
                        <label htmlFor="includeChords">Include Chords (ex: F#min)</label>
                    </div>
                </div>

                <ProgressSelector></ProgressSelector>
            </div>

            <ChordSelection></ChordSelection>

            <div className={ styles.navigation }>
                <button className="btn-link" onClick={ goBack }>Go Back</button>
                {/* TODO-ben : Disable button if no chords available (considering the key) AND not including single notes. */}
                <button onClick={ begin }>Begin</button>
            </div>
        </>
    );
}
import KeySelection from "./KeySelection";

import styles from './NotationConfig.module.css';
import ProgressSelector from "./ProgressSelector";

export default function NotationConfig() {
    return (
        <>
            <h1>Practice<span className={styles.practiceType}> : Notation</span></h1>

            <KeySelection></KeySelection>

            <div className="formLine">
                <input type="checkbox" id="includeSingleNotes" />
                <label htmlFor="includeSingleNotes">Include Single Notes (ex: F#)</label>
            </div>
            <div className="formLine">
                <input type="checkbox" disabled id="includeChords" />
                <label htmlFor="includeChords">Include Chords (ex: F#min)</label>
            </div>

            <ProgressSelector></ProgressSelector>
        </>
    );
}
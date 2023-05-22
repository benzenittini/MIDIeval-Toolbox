
import { convertKeyConfigToKey, getAllowedChordQualities } from "../../datatypes/Configs";
import ChordSelection from "./ChordSelection";
import KeySelection from "./KeySelection";

import styles from './NotationConfig.module.css';
import { useNotationConfig, useNotationConfigDispatch } from "./NotationConfigContext";
import ProgressSelector from "./ProgressSelector";

export default function NotationConfig({ goBack, begin }: { goBack: () => void, begin: () => void }) {
    const notationConfig = useNotationConfig();
    const notationConfigDispatch = useNotationConfigDispatch();

    const chordsAvailable = (notationConfig.practiceChords)
        ? getAllowedChordQualities(convertKeyConfigToKey(notationConfig.key), notationConfig).length > 0
        : false;

    const notesOrChordsAvailable = notationConfig.practiceSingleNotes || chordsAvailable;

    return (
        <>
            <h1>Practice<span className={styles.practiceType}> : Notation</span></h1>

            <div className={ styles.topRow }>
                <div className={ styles.topLeft }>
                    <KeySelection></KeySelection>

                    <div className="formLine">
                        <input type="radio" name="practiceType"
                            id="practiceSingleNotes"
                            checked={ notationConfig.practiceSingleNotes }
                            onChange={ () => notationConfigDispatch({ type: 'practiceSingleNotes' }) } />
                        <label htmlFor="practiceSingleNotes">Practice Single Notes (ex: F#)</label>
                    </div>

                    <div className="formLine">
                        <input type="radio" name="practiceType"
                            id="practiceChords"
                            checked={ notationConfig.practiceChords }
                            onChange={ () => notationConfigDispatch({ type: 'practiceChords' }) } />
                        <label htmlFor="practiceChords">Practice Chords (ex: F#min)</label>
                    </div>
                </div>

                <ProgressSelector></ProgressSelector>
            </div>

            <ChordSelection></ChordSelection>

            <div className={ styles.navigation }>
                <button className="btn-link" onClick={ goBack }>Go Back</button>
                <button onClick={ begin } disabled={ !notesOrChordsAvailable }>Begin</button>
            </div>
        </>
    );
}
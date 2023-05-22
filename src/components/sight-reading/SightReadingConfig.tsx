
import { convertKeyConfigToKey, getAllowedChordQualities } from "../../datatypes/Configs";
import styles from './SightReadingConfig.module.css';
import { useSightReadingConfig, useSightReadingConfigDispatch } from "./SightReadingConfigContext";

// import ChordSelection from "./ChordSelection";
// import KeySelection from "./KeySelection";

export default function SightReadingConfig({ goBack, begin }: { goBack: () => void, begin: () => void }) {
    const sightReadingConfig = useSightReadingConfig();
    const sightReadingConfigDispatch = useSightReadingConfigDispatch();

    const chordsAvailable = (sightReadingConfig.practiceChords)
        ? getAllowedChordQualities(convertKeyConfigToKey(sightReadingConfig.key), sightReadingConfig).length > 0
        : false;

    const notesOrChordsAvailable = sightReadingConfig.practiceSingleNotes || chordsAvailable;

    return (
        <>
            <h1>Practice<span className={styles.practiceType}> : Sight-Reading</span></h1>

            <div className={ styles.topRow }>
                <div className={ styles.topLeft }>
                    {/* <KeySelection></KeySelection> */}

                    <div className="formLine">
                        <input type="radio" name="practiceType"
                            id="practiceSingleNotes"
                            checked={ sightReadingConfig.practiceSingleNotes }
                            onChange={ (e) => sightReadingConfigDispatch({ type: 'practiceSingleNotes', data: e.target.checked }) } />
                        <label htmlFor="practiceSingleNotes">Practice Single Notes (ex: F#)</label>
                    </div>

                    <div className="formLine">
                        <input type="radio" name="practiceType"
                            id="practiceChords"
                            checked={ sightReadingConfig.practiceChords }
                            onChange={ (e) => sightReadingConfigDispatch({ type: 'practiceChords', data: e.target.checked }) } />
                        <label htmlFor="practiceChords">Practice Chords (ex: F#min)</label>
                    </div>
                </div>
            </div>

            {/* <ChordSelection></ChordSelection> */}

            <div className={ styles.navigation }>
                <button className="btn-link" onClick={ goBack }>Go Back</button>
                <button onClick={ begin } disabled={ !notesOrChordsAvailable }>Begin</button>
            </div>
        </>
    );
}
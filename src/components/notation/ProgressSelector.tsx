
import { useState } from 'react';
import { useNotationConfig, useNotationConfigDispatch } from './NotationConfigContext';
import styles from './ProgressSelector.module.css';
import { initializeMidiConnection } from '../../utilities/MidiUtils';

export default function ProgressSelector() {

    // -- Notation Config Context --
    const notationConfig = useNotationConfig();
    const notationConfigDispatch = useNotationConfigDispatch();

    // -- Button State Toggle --
    const isTimedSelected = notationConfig.progressSelector.type === 'timed' ? styles.selectedSection : styles.section;
    const isMidiSelected  = notationConfig.progressSelector.type === 'midi'  ? styles.selectedSection : styles.section;
    function changeTypeTo(type: 'midi' | 'timed') {
        if (type === 'midi') {
            initializeMidiConnection(() => {
                notationConfigDispatch({ type: 'setProgressType', data: 'midi' });
            }, (err) => {
                alert(err.message);
            });
        } else {
            notationConfigDispatch({ type: 'setProgressType', data: 'timed' });
        }
    }

    // -- "Timed" Configs --
    const [timedEditMode, setTimedEditMode] = useState(false);
    const timeInput = timedEditMode ? (
        <input type="number" min="1"
            autoFocus
            onFocus={(e) => e.target.select()}
            className={styles.secondsSelector}
            onChange={updateTimedDuration}
            onBlur={() => setTimedEditMode(false)}
            value={notationConfig.progressSelector.timedDuration} />
    ) : (
        <div className={styles.secondsDisplay}
            onClick={() => setTimedEditMode(true)}>
            {notationConfig.progressSelector.timedDuration} seconds
        </div>
    );

    function updateTimedDuration(newTime: any) {
        notationConfigDispatch({
            type: 'setTimedProgressDuration',
            data: newTime.target.value < 1 ? 1 : newTime.target.value,
        });
    }

    // -- Template --
    return (
        <div>
            <div className={isTimedSelected} onClick={() => changeTypeTo('timed')}>
                <label className={`labelBefore ${styles.cursorPointer} ${styles.optionHeading}`}>Timed</label>
                {timeInput}
            </div>

            <div className={isMidiSelected} onClick={() => changeTypeTo('midi')}>
                <span className={styles.optionHeading}>MIDI Input</span>
            </div>
        </div>
    );
}
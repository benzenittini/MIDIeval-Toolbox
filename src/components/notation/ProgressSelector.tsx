
import { useNotationConfig, useNotationConfigDispatch } from './NotationConfigContext';
import styles from './ProgressSelector.module.css';
import { initializeMidiConnection } from '../../utilities/MidiUtils';
import FocusableInput, { InputType } from '../common/FocusableInput';

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

    function updateTimedDuration(newTime: string) {
        let parsed = parseInt(newTime, 10);
        if (isNaN(parsed)) parsed = 0;

        notationConfigDispatch({
            type: 'setTimedProgressDuration',
            data: parsed < 1 ? 1 : parsed,
        });
    }

    // -- Template --
    return (
        <div>
            <div className={isTimedSelected} onClick={() => changeTypeTo('timed')}>
                <label className={`labelBefore ${styles.cursorPointer} ${styles.optionHeading}`}>Timed</label>
                <FocusableInput
                    value={notationConfig.progressSelector.timedDuration.toString()}
                    label="seconds"
                    type={InputType.NUMBER}
                    inputConfigs={{ min: "1" }}
                    onChange={updateTimedDuration}
                    ></FocusableInput>
            </div>

            <div className={isMidiSelected} onClick={() => changeTypeTo('midi')}>
                <span className={styles.optionHeading}>MIDI Input</span>
            </div>
        </div>
    );
}
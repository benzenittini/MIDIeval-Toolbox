
import styles from './ProgressSelector.module.css';

export default function ProgressSelector() {
    return (
        <div>
            <div className={styles.section}>
                <label className="labelBefore">Timed</label>
                <input type="number" className={styles.secondsSelector} />
            </div>

            <div className={styles.selectedSection}>
                MIDI Input
            </div>
        </div>
    );
}
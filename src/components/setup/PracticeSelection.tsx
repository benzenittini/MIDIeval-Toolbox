
import SvgStaff from '../svg/SvgStaff';
import styles from './PracticeSelection.module.css';
import KeySelection from './notation/KeySelection';
import NotationConfig from './notation/NotationConfig';

export default function PracticeSelection() {
    return (
        <>
            {/* <h1>Practice</h1>
            <div className={styles.practiceBox}>
                <div className={styles.notationIcon}>F#</div>
                <h2 className={styles.heading}>Notation</h2>
            </div>
            <div className={styles.practiceBox}>
                <SvgStaff width="150px" height="125px" stroke="var(--gray-vlight)"></SvgStaff>
                <h2 className={styles.heading}>Sight-Reading</h2>
            </div> */}
            <NotationConfig></NotationConfig>
        </>
    );
}
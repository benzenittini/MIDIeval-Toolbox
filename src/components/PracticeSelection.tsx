
import { Page } from '../datatypes/Miscellaneous';
import SvgStaff from './svg/SvgStaff';
import styles from './PracticeSelection.module.css';


export default function PracticeSelection({ setPractice }: { setPractice: (practice: Page) => void }) {

    return (
        <>
            <h1>Practice</h1>

            <div className={styles.practiceBox} onClick={ () => setPractice('notation-config') }>
                <div className={styles.notationIcon}>F#</div>
                <h2 className={styles.heading}>Notation</h2>
            </div>

            <div className={styles.practiceBox} onClick={ () => setPractice('sight-reading-config') }>
                <svg viewBox="0 0 150 125" preserveAspectRatio="none" style={{ width: "150px", height: "125px" }}>
                    <SvgStaff width={ 150 } height={ 125 } strokeWidth={ 2 } stroke="var(--gray-vlight)"></SvgStaff>
                </svg>
                <h2 className={styles.heading}>Sight-Reading</h2>
            </div>
        </>
    );
}

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
                <SvgStaff width="150px" height="125px" stroke="var(--gray-vlight)"></SvgStaff>
                <h2 className={styles.heading}>Sight-Reading</h2>
            </div>
        </>
    );
}

import { Page } from '../datatypes/Miscellaneous';
import styles from './PracticeSelection.module.css';
import { C_MAJOR } from '../datatypes/ComplexTypes';
import GrandStaff from './svg/SvgGrandStaff';


export default function PracticeSelection({ setPractice }: { setPractice: (practice: Page) => void }) {

    return (
        <>
            <h1>Practice</h1>

            <div className={styles.practiceBox} onClick={ () => setPractice('notation-config') }>
                <div className={styles.notationIcon}><span>F♯m<sup>7</sup></span></div>
                <h2 className={styles.heading} style={{ marginTop: '0px' }}>Notation</h2>
            </div>

            <div className={styles.practiceBox} onClick={ () => setPractice('sight-reading-config') }>
                <GrandStaff width={ 130 } height={ 195 }
                    musicKey={ C_MAJOR }
                    musicShift={ 0 }
                    timeSignature={{ top: 4, bottom: 4 }}
                    music={ [] }
                    ></GrandStaff>
                <h2 className={styles.heading} style={{ marginTop: '0px' }}>Sight-Reading</h2>
            </div>
        </>
    );
}
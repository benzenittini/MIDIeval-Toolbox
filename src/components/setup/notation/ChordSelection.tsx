
import { NotationConfiguration } from '../../../datatypes/Configs';
import styles from './ChordSelection.module.css';
import { useNotationConfig, useNotationConfigDispatch } from './NotationConfigContext';

export default function ChordSelection() {

    const notationConfig = useNotationConfig();
    const notationConfigDispatch = useNotationConfigDispatch();


    function getCheckbox(label: string, configOpt: keyof NotationConfiguration, disabled: boolean) {
        return (
            <div className={`formLine ${styles.checkbox}`}>
                <input type="checkbox"
                    id={ configOpt }
                    disabled={ disabled }
                    checked={ notationConfig[configOpt] as boolean }
                    onChange={(e) => notationConfigDispatch({ type: configOpt, data: e.target.checked})}/>
                <label htmlFor={ configOpt }>{ label }</label>
            </div>
        );
    }

    const disableTriads   = !notationConfig.includeChords || !notationConfig.includeTriads;
    const disableSevenths = !notationConfig.includeChords || !notationConfig.includeSevenths;

    return (
        <div className={styles.mainFlex}>

            {/* Triads */}
            <div>
                <div className={ styles.titleCheckbox }>
                    {getCheckbox('Triads', 'includeTriads', !notationConfig.includeChords)}
                </div>

                <div className={ styles.checkboxGroups }>
                    <div>
                        {getCheckbox('Major',      'includeMaj3', disableTriads)}
                        {getCheckbox('Minor',      'includeMin3', disableTriads)}
                        {getCheckbox('Augmented',  'includeAug3', disableTriads)}
                        {getCheckbox('Diminished', 'includeDim3', disableTriads)}
                    </div>
                </div>
            </div>

            {/* Sevenths */}
            <div>
                <div className={ styles.titleCheckbox }>
                    {getCheckbox('Sevenths', 'includeSevenths', !notationConfig.includeChords)}
                </div>

                <div className={ styles.checkboxGroups }>
                    <div>
                        {getCheckbox('Major',    'includeMaj7', disableSevenths)}
                        {getCheckbox('Minor',    'includeMin7', disableSevenths)}
                        {getCheckbox('Dominant', 'includeDom7', disableSevenths)}
                    </div>
                    <div>
                        {getCheckbox('Half-Diminished', 'includeHalfDim7', disableSevenths)}
                        {getCheckbox('Diminished',      'includeDim7',     disableSevenths)}
                        {getCheckbox('Minor Major',     'includeMinMaj7',  disableSevenths)}
                        {getCheckbox('Aug. Major',      'includeAugMaj7',  disableSevenths)}
                    </div>
                </div>
            </div>
        </div>
    );
}
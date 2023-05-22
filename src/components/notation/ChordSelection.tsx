
import { MiscKeys, NotationConfiguration } from '../../datatypes/Configs';
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

    const disableTriads   = !notationConfig.practiceChords || !notationConfig.includeTriads;
    const disableSevenths = !notationConfig.practiceChords || !notationConfig.includeSevenths;
    const disableNotInKey = notationConfig.key !== MiscKeys.ANYTHING_GOES;

    return (
        <div className={styles.mainFlex}>

            {/* Triads */}
            <div>
                <div className={ styles.titleCheckbox }>
                    {getCheckbox('Triads', 'includeTriads', !notationConfig.practiceChords)}
                </div>

                <div className={ styles.checkboxGroups }>
                    <div>
                        {getCheckbox('Major',      'includeMaj3', disableTriads)}
                        {getCheckbox('Minor',      'includeMin3', disableTriads)}
                        {getCheckbox('Diminished', 'includeDim3', disableTriads)}
                        {getCheckbox('Augmented',  'includeAug3', disableTriads || disableNotInKey)}
                    </div>
                </div>
            </div>

            {/* Sevenths */}
            <div>
                <div className={ styles.titleCheckbox }>
                    {getCheckbox('Sevenths', 'includeSevenths', !notationConfig.practiceChords)}
                </div>

                <div className={ styles.checkboxGroups }>
                    <div>
                        {getCheckbox('Major',           'includeMaj7',     disableSevenths)}
                        {getCheckbox('Minor',           'includeMin7',     disableSevenths)}
                        {getCheckbox('Dominant',        'includeDom7',     disableSevenths)}
                        {getCheckbox('Half-Diminished', 'includeHalfDim7', disableSevenths)}
                    </div>
                    <div>
                        {getCheckbox('Diminished',  'includeDim7',    disableSevenths || disableNotInKey)}
                        {getCheckbox('Minor Major', 'includeMinMaj7', disableSevenths || disableNotInKey)}
                        {getCheckbox('Aug. Major',  'includeAugMaj7', disableSevenths || disableNotInKey)}
                    </div>
                </div>
            </div>
        </div>
    );
}
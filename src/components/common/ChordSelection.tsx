
import { ChordSelections, KeyConfigOpts, MiscKeys } from '../../datatypes/Configs';
import styles from './ChordSelection.module.css';

type Props = {
    currentKey: KeyConfigOpts;
    practiceChords: boolean;
    currentSelections: ChordSelections;
    allowAccidentals?: boolean;
    changeChordSelection: (optionName: keyof ChordSelections, value: boolean) => void;
}

export default function ChordSelection({ currentKey, practiceChords, currentSelections, changeChordSelection, allowAccidentals = false }: Props) {

    function getCheckbox(label: string, configOpt: keyof ChordSelections, disabled: boolean) {
        return (
            <div className={`formLine ${styles.checkbox}`}>
                <input type="checkbox"
                    id={ configOpt }
                    disabled={ disabled }
                    checked={ currentSelections[configOpt] as boolean }
                    onChange={(e) => changeChordSelection(configOpt, e.target.checked)}/>
                <label htmlFor={ configOpt }>{ label }</label>
            </div>
        );
    }

    const disableTriads   = !practiceChords || !currentSelections.includeTriads;
    const disableSevenths = !practiceChords || !currentSelections.includeSevenths;
    const disableNotInKey = currentKey !== MiscKeys.ANYTHING_GOES && !allowAccidentals;

    return (
        <div className={styles.mainFlex}>

            {/* Triads */}
            <div>
                <div className={ styles.titleCheckbox }>
                    {getCheckbox('Triads', 'includeTriads', !practiceChords)}
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
                    {getCheckbox('Sevenths', 'includeSevenths', !practiceChords)}
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

import { useState } from "react";
import { ChordSelections, KeyConfigOpts, MiscKeys, SightReadingConfiguration, convertKeyConfigToKey, getAllowedChordQualities } from "../../datatypes/Configs";
import FocusableInput, { InputType } from "../common/FocusableInput";
import KeySelection from "../common/KeySelection";
import LabeledSlider from "../common/LabeledSlider";
import styles from './SightReadingConfig.module.css';
import { START_DIFFICULTY, useSightReadingConfig, useSightReadingConfigDispatch } from "./SightReadingConfigContext";
import ChordSelection from "../common/ChordSelection";

export default function SightReadingConfig({ goBack, begin }: { goBack: () => void, begin: () => void }) {
    const sightReadingConfig = useSightReadingConfig();
    const sightReadingConfigDispatch = useSightReadingConfigDispatch();

    const [difficulty, setDifficulty] = useState(START_DIFFICULTY);

    const chordsAvailable = (sightReadingConfig.practiceChords)
        ? getAllowedChordQualities(convertKeyConfigToKey(sightReadingConfig.key), sightReadingConfig.chordSelection).length > 0
        : false;

    const notesOrChordsAvailable = sightReadingConfig.practiceSingleNotes || chordsAvailable;

    function setDifficultySlider(newDifficulty: string) {
        let parsed = parseInt(newDifficulty, 10);
        if (isNaN(parsed)) parsed = 0;
        setDifficulty(parsed);
        sightReadingConfigDispatch({ type: 'quickDifficulty', data: parsed });
    }

    function selectKey(newKey: KeyConfigOpts) {
        sightReadingConfigDispatch({ type: 'setKey', data: newKey });
    }

    function updateTempo(newTempo: string) {
        let parsed = parseInt(newTempo, 10);
        if (isNaN(parsed)) parsed = 0;

        sightReadingConfigDispatch({
            type: 'tempo',
            data: parsed < 1 ? 1 : parsed,
        });
    }

    function setAdjacentNoteDistance(distance: string) {
        let parsed = parseInt(distance, 10);
        if (isNaN(parsed)) parsed = 0;
        sightReadingConfigDispatch({ type: 'adjacentNoteDistance', data: parsed });
    }

    function changeChordSelection(optionName: keyof ChordSelections, newValue: boolean) {
        sightReadingConfigDispatch({ type: optionName, data: newValue });
    }

    function getCheckbox(label: string, configOpt: keyof SightReadingConfiguration, disabled: boolean = false) {
        return (
            <div className="formLine">
                <input type="checkbox"
                    id={ configOpt }
                    disabled={ disabled }
                    checked={ sightReadingConfig[configOpt] as boolean }
                    onChange={(e) => sightReadingConfigDispatch({ type: configOpt, data: e.target.checked })}/>
                <label htmlFor={ configOpt }>{ label }</label>
            </div>
        );
    }

    return (
        <>
            <h1>Practice<span className={styles.practiceType}> : Sight-Reading</span></h1>

            {/* Basic Settings */}
            <div className={ styles.settingsBox }>
                <label className={ styles.settingsBoxLabel }>Quick Settings</label>
                <div className={ styles.quickSettingsSlider }>
                    <LabeledSlider
                        label="Difficulty:"
                        min={ 1 }
                        max={ 10 }
                        value={ difficulty }
                        onChange={ setDifficultySlider }
                        ></LabeledSlider>
                </div>
            </div>

            {/* Advanced Settings */}
            <div className={ styles.settingsBox }>
                <label className={ styles.settingsBoxLabel }>Advanced Settings</label>

                <div className={ styles.flexRow }>
                    {/* Top Left */}
                    <div className={ styles.configGroup }>
                        <KeySelection
                            currentValue={ sightReadingConfig.key }
                            filterKeysById={ (id) => id !== MiscKeys.ANYTHING_GOES }
                            selectKey={ selectKey }
                            ></KeySelection>
                        {getCheckbox('Allow Accidentals', 'allowAccidentals')}
                        {getCheckbox('Include Treble Clef', 'includeTrebleClef')}
                        {getCheckbox('Include Bass Clef', 'includeBassClef')}
                    </div>

                    {/* Top Right */}
                    <div className={ styles.configGroup } style={{ margin: "0 auto"}}>
                        <div>
                            <label className="labelBefore">Tempo:</label>
                            <FocusableInput
                                value={sightReadingConfig.tempo.toString()}
                                label="BPM"
                                type={InputType.NUMBER}
                                inputConfigs={{ min: "1" }}
                                onChange={updateTempo}
                                ></FocusableInput>
                            <div style={{ display: 'inline-block', marginLeft: '50px', }}>
                                {getCheckbox('Play Metronome', 'playMetronome')}
                            </div>
                        </div>
                        {getCheckbox('Wait for correct note to be played before proceeding',         'waitForCorrectNote')}
                        {getCheckbox('Allow varying rhythmic values (whole, half, quarter, eighth)', 'allowRhythmicValues')}
                        <LabeledSlider
                            label="Adjacent Note Distance:"
                            min={ 1 }
                            max={ 10 }
                            value={ sightReadingConfig.adjacentNoteDistance }
                            onChange={ setAdjacentNoteDistance }
                            ></LabeledSlider>
                    </div>
                </div>

                <div className={ styles.flexRow }>
                    {/* Bottom Left */}
                    <div className={ styles.configGroup }>
                        {getCheckbox('Include Single Notes',  'practiceSingleNotes')}
                        {getCheckbox('Include Chords',        'practiceChords')}
                        <div className={ styles.indented }>{getCheckbox('Include Broken Chords', 'includeBrokenChords',   !sightReadingConfig.practiceChords)}</div>
                        <div className={ styles.indented }>{getCheckbox('Include Inversions',    'includeInvertedChords', !sightReadingConfig.practiceChords)}</div>
                    </div>

                    {/* Bottom Right */}
                    <div style={{ flexGrow: 1 }}>
                        <ChordSelection
                            currentKey={ sightReadingConfig.key }
                            practiceChords={ sightReadingConfig.practiceChords }
                            currentSelections={ sightReadingConfig.chordSelection }
                            changeChordSelection={ changeChordSelection }
                            ></ChordSelection>
                    </div>
                </div>
            </div>

            <div className={ styles.navigation }>
                <button className="btn-link" onClick={ goBack }>Go Back</button>
                <button onClick={ begin } disabled={ !notesOrChordsAvailable }>Begin</button>
            </div>
        </>
    );
}
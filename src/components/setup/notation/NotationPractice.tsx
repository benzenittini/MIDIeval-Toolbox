
import { useEffect, useState } from 'react';
import * as TWEEN from '@tweenjs/tween.js';

import styles from './NotationPractice.module.css';
import { useNotationConfig } from './NotationConfigContext';
import { getRandomChord, getRandomNote } from '../../../utilities/Generators';
import { NotationConfiguration, convertKeyConfigToKey, getAllowedChordQualities } from '../../../datatypes/Configs';
import { Chord, Key, Note } from '../../../datatypes/Musics';
import { getStringNotation } from '../../../utilities/NotationUtils';
import { clearChangeHandler, setChangeHandler } from '../../../utilities/MidiUtils';
import { getChordNotes } from '../../../utilities/MusicUtils';


function generateChordOrNote(key: Key | null, notationConfig: NotationConfiguration): Chord | Note | null {
    // First, determine if we should generate a chord or a note. Assume chord, then change if needed.
    let generateChord = true;
    if (notationConfig.practiceSingleNotes && notationConfig.practiceChords) {
        generateChord = Math.random() > 0.5;
    } else if (notationConfig.practiceSingleNotes) {
        generateChord = false;
    }

    // Next, generate that chord/note
    const chordOrNote = generateChord
        ? getRandomChord(key, getAllowedChordQualities(key, notationConfig))
        : getRandomNote(key);

    return chordOrNote;

}

function getDisplayedText(key: Key | null, chordOrNote: Chord | Note | null): string {
    return (chordOrNote === null)
        ? "No chords available."
        : getStringNotation(key, chordOrNote);
}


export default function NotationPractice({ goHome, goToConfig }: { goHome: () => void, goToConfig: () => void }) {
    const notationConfig = useNotationConfig();
    const [ key, setKey ] = useState(convertKeyConfigToKey(notationConfig.key));
    const [ chordOrNote, setChordOrNote ] = useState(generateChordOrNote(key, notationConfig));
    const [ display, setDisplay ] = useState(getDisplayedText(key, chordOrNote));
    const [ progressWidth, setProgressWidth ] = useState(notationConfig.progressSelector.type === 'timed' ? 100 : 0);
    const [ cssColorClass, setCssColorClass ] = useState(null as null | string);

    function progressToNext() {
        let newChord = generateChordOrNote(key, notationConfig);
        setChordOrNote(newChord);
        setDisplay(getDisplayedText(key, newChord));
    }

    function timeBasedProgress() {
        useEffect(() => {
            const tween = new TWEEN.Tween({ remaining: 100 }, false)
                .to({remaining: 0}, notationConfig.progressSelector.timedDuration * 1000)
                .repeat(Infinity)
                .onUpdate((obj) => setProgressWidth(obj.remaining))
                .onRepeat(progressToNext)
                .start();

            let stopped = false;
            function animate(time: number) {
                if (!stopped) {
                    tween.update(time)
                    requestAnimationFrame(animate)
                }
            }
            requestAnimationFrame(animate)

            return () => {
                stopped = true;
                tween.stop();
            }
        }, []);
    }

    function midiBasedProgress() {
        useEffect(() => {
            setChangeHandler((changedInput, pressedInputs) => {
                if (chordOrNote !== null) {
                    const necessaryNotes = ('root' in chordOrNote)
                        ? getChordNotes(chordOrNote) // It's a chord!
                        : [chordOrNote];             // It's a note!

                    const numValidInputs    = pressedInputs.filter(pi => necessaryNotes.find(nn => nn.pitchClass === pi.note.pitchClass)).length;
                    const numNecessaryNotes = necessaryNotes.filter(nn => pressedInputs.find(pi => nn.pitchClass === pi.note.pitchClass)).length;
                    const allInputsAreValid    = numValidInputs === pressedInputs.length;
                    const hasAllNecessaryNotes = numNecessaryNotes === necessaryNotes.length;

                    if (allInputsAreValid && hasAllNecessaryNotes) {
                        progressToNext();
                        setCssColorClass(styles.flashGreen);
                        setTimeout(() => {
                            setCssColorClass(null);
                            setProgressWidth(0);
                        }, 500);
                    } else if (!allInputsAreValid) {
                        // Only care about failures when it's pressed, not released.
                        if (changedInput.velocity > 0) {
                            setCssColorClass(styles.flashRed);
                            setTimeout(() => setCssColorClass(null), 500);
                        }
                    } else if (!hasAllNecessaryNotes) {
                        setProgressWidth(100 * numNecessaryNotes / necessaryNotes.length);
                    }
                }
            });
            return () => {
                clearChangeHandler();
            }
        }, [chordOrNote]);
    }

    if (notationConfig.progressSelector.type === 'timed') {
        timeBasedProgress();
    } else if (notationConfig.progressSelector.type === 'midi') {
        midiBasedProgress();
    }

    return (
        <>
            {/* Breadcrumb Navigation */}
            <nav className={ styles.breadcrumbs }>
                <button className={ styles.breadcrumb } onClick={ goHome }>Home</button>&gt;
                <button className={ styles.breadcrumb } onClick={ goToConfig }>Configuration</button>&gt;
                <span className={ styles.breadcrumb }>Practice</span>
            </nav>

            {/* Chord / Note Display */}
            <div className={ styles.chordDisplay }>
                <p dangerouslySetInnerHTML={{ __html: display }} />
            </div>

            {/* Progress Feedback */}
            <div className={ styles.timeContainer }>
                <div className={`${styles.timeRemaining} ${cssColorClass !== null ? cssColorClass : ''}`} style={{ width: `${progressWidth}%` }}>
                </div>
            </div>
        </>
    );
}
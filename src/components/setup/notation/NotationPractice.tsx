
import { useEffect, useState } from 'react';
import * as TWEEN from '@tweenjs/tween.js';

import styles from './NotationPractice.module.css';
import { useNotationConfig } from './NotationConfigContext';
import { getRandomChord, getRandomNote } from '../../../utilities/Generators';
import { NotationConfiguration, convertKeyConfigToKey, getAllowedChordQualities } from '../../../datatypes/Configs';
import { Chord, Key, Note } from '../../../datatypes/Musics';
import { getStringNotation } from '../../../utilities/NotationUtils';
import { clearChangeHandler, setChangeHandler } from '../../../utilities/MidiUtils';
import { describeChordQuality, getChordNotes } from '../../../utilities/MusicUtils';


/**
 * Generates a chord or note given the key and configuration for this exercise.
 */
function generateChordOrNote(key: Key | null, notationConfig: NotationConfiguration): Chord | Note | null {
    const chordOrNote = notationConfig.practiceChords
        ? getRandomChord(key, getAllowedChordQualities(key, notationConfig))
        : getRandomNote(key);

    return chordOrNote;

}

/**
 * Converts the given key and chord/note into a human-readable string. If the chordOrNote is null,
 * returns "No chords available", as all valid chords must have been ruled out from selection.
 */
function getDisplayedText(key: Key | null, chordOrNote: Chord | Note | null): string {
    return (chordOrNote === null)
        ? "No chords available."
        : getStringNotation(key, chordOrNote);
}


export default function NotationPractice({ goHome, goToConfig }: { goHome: () => void, goToConfig: () => void }) {
    /** Configuration for this exercise */
    const notationConfig = useNotationConfig();

    /** The key we're practicing, or "null" to indicate "anything goes" */
    const [ key, setKey ] = useState(convertKeyConfigToKey(notationConfig.key));

    /** The current chord or note being displayed. May be "null" if the allowed chord qualities rules out all available chords. */
    const [ chordOrNote, setChordOrNote ] = useState(generateChordOrNote(key, notationConfig));

    /** The currently displayed text. Most likely a string representation of the chordOrNote. */
    const [ display, setDisplay ] = useState(getDisplayedText(key, chordOrNote));

    /** The width of the progress indicator. "Timed" mode goes from 100 to 0 as time progresses. "midi" mode goes from 0 to 100 as notes are played. */
    const [ progressWidth, setProgressWidth ] = useState(notationConfig.progressSelector.type === 'timed' ? 100 : 0);

    /** The css class for flashing the progress bar's color red or green. Either "styles.flashRed", "styles.flashGreen", or "null" if not set. */
    const [ cssColorClass, setCssColorClass ] = useState(null as null | string);


    /**
     * Progresses to the next note or chord by generating a new one, and updating the display.
     */
    function progressToNext() {
        let newChord = generateChordOrNote(key, notationConfig);
        setChordOrNote(newChord);
        setDisplay(getDisplayedText(key, newChord));
    }

    /**
     * Sets up the appropriate effects for animating the "time-based" progress mode. Handles updating the progress bar's
     * width, and progressing to the next chord/note when the time elapses.
     */
    function registerTimeBasedProgress() {
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

    /**
     * Sets up the appropriate effects for animating the "midi-based" progress mode. Checks the user-pressed keys against
     * what's required for the current chord/note to determine (1) if any of them are wrong, (2) if a subset of them are
     * pressed, or (3) if all of them are pressed. The progress indicator is updated in length and color appropriately.
     */
    function registerMidiBasedProgress() {
        useEffect(() => {
            setChangeHandler((changedInput, pressedInputs) => {
                if (chordOrNote !== null) {
                    const necessaryNotes = ('root' in chordOrNote)
                        ? getChordNotes(chordOrNote) // It's a chord!
                        : [chordOrNote];             // It's a note!

                    // Determine how many of the necessary notes the user is pressing.
                    const numValidInputs    = pressedInputs.filter(pi => necessaryNotes.find(nn => nn.pitchClass === pi.note.pitchClass)).length;
                    const numNecessaryNotes = necessaryNotes.filter(nn => pressedInputs.find(pi => nn.pitchClass === pi.note.pitchClass)).length;
                    // ...and whether they've gotten all the correct notes without any wrong ones.
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
                        // Only care about failures when one is pressed, not released.
                        if (changedInput.velocity > 0 && cssColorClass === null) {
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
        }, [chordOrNote, cssColorClass]);
    }

    // Registers the appropriate mode of progression.
    if (notationConfig.progressSelector.type === 'timed') {
        registerTimeBasedProgress();
    } else if (notationConfig.progressSelector.type === 'midi') {
        registerMidiBasedProgress();
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
            <div className={ styles.progressContainer }>
                <div className={styles.progressRemaining +
                    ` ${notationConfig.progressSelector.type === 'midi' ? styles.midi : ''}` +
                    ` ${cssColorClass !== null ? cssColorClass : ''}`}
                    style={{ width: `${progressWidth}%` }}>
                </div>
            </div>

            {/* Chord Description */}
            {(notationConfig.practiceChords) ? (
                <p className={ styles.chordDescription }>{ describeChordQuality((chordOrNote as Chord).quality) }</p>
            ) : ''}
        </>
    );
}

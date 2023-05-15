
import { useEffect, useState } from 'react';
import * as TWEEN from '@tweenjs/tween.js';

import styles from './NotationPractice.module.css';
import { useNotationConfig } from './NotationConfigContext';
import { getRandomChord, getRandomNote } from '../../../utilities/Generators';
import { NotationConfiguration, convertKeyConfigToKey, getAllowedChordQualities } from '../../../datatypes/Configs';
import { Key } from '../../../datatypes/Musics';
import { getStringNotation } from '../../../utilities/NotationUtils';


function generateDisplayText(key: Key | null, notationConfig: NotationConfiguration): string {
    // First, determine if we should generate a chord or a note. Assume chord, then change if needed.
    let generateChord = true;
    if (notationConfig.includeSingleNotes && notationConfig.includeChords) {
        generateChord = Math.random() > 0.5;
    } else if (notationConfig.includeSingleNotes) {
        generateChord = false;
    }

    // Next, generate that chord/note
    const chordOrNote = generateChord
        ? getRandomChord(key, getAllowedChordQualities(notationConfig))
        : getRandomNote(key);
    if (chordOrNote === null) {
        return "No chords available.";
    }

    // Lastly, convert it to its proper notation, and return it.
    return getStringNotation(key, chordOrNote);
}


export default function NotationPractice({ goHome, goToConfig }: { goHome: () => void, goToConfig: () => void }) {
    const notationConfig = useNotationConfig();
    const [ key, setKey ] = useState(convertKeyConfigToKey(notationConfig.key));
    const [ display, setDisplay ] = useState(generateDisplayText(key, notationConfig));
    const [ progressWidth, setProgressWidth ] = useState(100);

    useEffect(() => {
        const tween = new TWEEN.Tween({ remaining: 100 }, false)
            .to({remaining: 0}, notationConfig.progressSelector.timedDuration * 1000)
            .repeat(Infinity)
            .onUpdate((obj) => setProgressWidth(obj.remaining))
            .onRepeat(() => setDisplay(generateDisplayText(key, notationConfig)))
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

    return (
        <>
            {/* Breadcrumb Navigation */}
            <nav className={ styles.breadcrumbs }>
                <button className={ styles.breadcrumb } onClick={ goHome }>Home</button>&gt;
                <button className={ styles.breadcrumb } onClick={ goToConfig }>Configuration</button>&gt;
                <span className={ styles.breadcrumb }>Practice</span>
            </nav>

            {/* Chord / Note Display */}
            <div className={ styles.chordDisplay } dangerouslySetInnerHTML={{ __html: display }} />

            {/* Progress Feedback */}
            <div className={ styles.timeContainer }>
                <div className={ styles.timeRemaining } style={{ width: `${progressWidth}%` }}>
                </div>
            </div>
        </>
    );
}
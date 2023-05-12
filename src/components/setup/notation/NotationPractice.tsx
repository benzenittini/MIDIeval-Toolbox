
import { useEffect, useState } from 'react';
import * as TWEEN from '@tweenjs/tween.js';

import styles from './NotationPractice.module.css';
import { useNotationConfig } from './NotationConfigContext';
import { getRandomChord, getRandomKey } from '../../../utilities/Generators';
import { NotationConfiguration, convertKeyConfigToKey, getAllowedChordQualities } from '../../../datatypes/Configs';
import { Key } from '../../../datatypes/Musics';
import { getStringNotation } from '../../../utilities/MusicUtils';


function generateDisplayText(key: Key | null, notationConfig: NotationConfiguration): string {
    const chordKey = key ?? getRandomKey();
    return getStringNotation(chordKey, getRandomChord(chordKey, getAllowedChordQualities(notationConfig)))
}


export default function NotationPractice({ goHome, goToConfig }: { goHome: () => void, goToConfig: () => void }) {
    const notationConfig = useNotationConfig();
    // TODO-ben : I don't think "Random Key" works correctly here. I think it gets randomized every time this re-renders.
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
            <div className={ styles.chordDisplay }>{ display }</div>

            {/* Progress Feedback */}
            <div className={ styles.timeContainer }>
                <div className={ styles.timeRemaining } style={{ width: `${progressWidth}%` }}>
                </div>
            </div>
        </>
    );
}
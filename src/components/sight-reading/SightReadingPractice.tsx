

import { useEffect, useState } from 'react';
import * as TWEEN from '@tweenjs/tween.js';

import { LabeledMusic, Music, MusicStream } from '../../utilities/MusicStream';
import { useSightReadingConfig } from './SightReadingConfigContext';
import { convertKeyConfigToKey } from '../../datatypes/Configs';
import GrandStaff, { BASE_NOTE_GAP_RATIO, MEASURE_GAP_RATIO } from '../svg/SvgGrandStaff';


const GRAND_STAFF_HEIGHT = 350;
const MEASURE_WIDTH = GRAND_STAFF_HEIGHT * (BASE_NOTE_GAP_RATIO + MEASURE_GAP_RATIO);

export default function SightReadingPractice({ goHome, goToConfig }: { goHome: () => void, goToConfig: () => void }) {
    const sightReadingConfig = useSightReadingConfig();

    const [ key ] = useState(() => convertKeyConfigToKey(sightReadingConfig.key)!);
    const [ musicStream ] = useState(new MusicStream(sightReadingConfig, key));
    const [ displayedMusic, setDisplayedMusic ] = useState(() => 
        new Array(4).fill(1).map(() => musicStream.labelMusic(musicStream.getNextMeasure())));
    const [ musicXShift, setMusicXShift ] = useState(0);

    const singleMeasureTime = 1000 * 60 * sightReadingConfig.timeSignature.top / sightReadingConfig.tempo;

    function shiftMeasures() {
        // Remove first measure
        setDisplayedMusic(a => a.slice(1));
        // And push the next measure
        setDisplayedMusic(a => [...a, musicStream.labelMusic(musicStream.getNextMeasure())]);
        // We get a nasty flicker without doing this.
        setMusicXShift(0);
    }

    useEffect(() => {
        const tween = new TWEEN.Tween({ xShift: 0 }, false)
            .to({xShift: -MEASURE_WIDTH}, singleMeasureTime)
            .repeat(Infinity)
            .onUpdate((obj) => setMusicXShift(obj.xShift))
            .onRepeat(shiftMeasures)
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
            <nav className="breadcrumbs">
                <button className="breadcrumb" onClick={ goHome }>Home</button>&gt;
                <button className="breadcrumb" onClick={ goToConfig }>Configuration</button>&gt;
                <span className="breadcrumb">Practice</span>
            </nav>

            <GrandStaff width={ 1100 } height={ GRAND_STAFF_HEIGHT }
                musicKey={ key }
                musicShift={ musicXShift }
                timeSignature={ sightReadingConfig.timeSignature }
                music={ displayedMusic }
                ></GrandStaff>
        </>
    );
}



import { useState } from 'react';
import { LabeledMusic, Music, MusicStream } from '../../utilities/MusicStream';
import { useSightReadingConfig } from './SightReadingConfigContext';
import { convertKeyConfigToKey } from '../../datatypes/Configs';
import GrandStaff from '../svg/SvgGrandStaff';
import { MajorKeys } from '../../datatypes/Musics';


export default function SightReadingPractice({ goHome, goToConfig }: { goHome: () => void, goToConfig: () => void }) {
    const sightReadingConfig = useSightReadingConfig();
    const [ key ] = useState(convertKeyConfigToKey(sightReadingConfig.key)!);
    const [ musicStream ] = useState(new MusicStream(sightReadingConfig, key));
    const [ displayedMusic, setDisplayedMusic ] = useState(
        new Array(3).fill(1).map(() => musicStream.labelMusic(musicStream.getNextMeasure()))
    );

    return (
        <>
            {/* Breadcrumb Navigation */}
            <nav className="breadcrumbs">
                <button className="breadcrumb" onClick={ goHome }>Home</button>&gt;
                <button className="breadcrumb" onClick={ goToConfig }>Configuration</button>&gt;
                <span className="breadcrumb">Practice</span>
            </nav>

            <GrandStaff width={ 1100 } height={ 350 }
                musicKey={ key }
                timeSignature={ sightReadingConfig.timeSignature }
                music={ displayedMusic }
                ></GrandStaff>
        </>
    );
}

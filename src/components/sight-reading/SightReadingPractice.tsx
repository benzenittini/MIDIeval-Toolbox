

import { useState } from 'react';
import { MusicStream } from '../../utilities/MusicStream';
import { useSightReadingConfig } from './SightReadingConfigContext';
import { convertKeyConfigToKey } from '../../datatypes/Configs';
import GrandStaff from '../svg/SvgGrandStaff';
import { C_MAJOR } from '../../datatypes/ComplexTypes';


export default function SightReadingPractice({ goHome, goToConfig }: { goHome: () => void, goToConfig: () => void }) {
    const sightReadingConfig = useSightReadingConfig();
    // const [ key ] = useState(convertKeyConfigToKey(sightReadingConfig.key)!);
    const [ key ] = useState(C_MAJOR); // TODO-ben : Switch back to using the configured key
    const [ musicStream ] = useState(new MusicStream(sightReadingConfig, key));
    const [ displayedMusic, setDisplayedMusic ] = useState(
        new Array(5).fill(1).map(() => musicStream.labelMusic(musicStream.getNextMeasure()))
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



import { useState } from 'react';
import { MusicStream } from '../../utilities/MusicStream';
import { useSightReadingConfig } from './SightReadingConfigContext';
import { convertKeyConfigToKey } from '../../datatypes/Configs';
import GrandStaff from '../svg/SvgGrandStaff';
import { MajorKeys } from '../../datatypes/Musics';


export default function SightReadingPractice({ goHome, goToConfig }: { goHome: () => void, goToConfig: () => void }) {
    const sightReadingConfig = useSightReadingConfig();
    // TODO-ben : Re-enable key setting.
    // const [ key ] = useState(convertKeyConfigToKey(sightReadingConfig.key)!);
    const [ key ] = useState(MajorKeys.C_MAJOR);
    const [ musicStream ] = useState(new MusicStream(sightReadingConfig, key));

    return (
        <>
            {/* Breadcrumb Navigation */}
            <nav className="breadcrumbs">
                <button className="breadcrumb" onClick={ goHome }>Home</button>&gt;
                <button className="breadcrumb" onClick={ goToConfig }>Configuration</button>&gt;
                <span className="breadcrumb">Practice</span>
            </nav>

            <GrandStaff width={ 1100 } height={ 350 } musicKey={ key }></GrandStaff>
        </>
    );
}

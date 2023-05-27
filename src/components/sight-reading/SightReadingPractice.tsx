

import { ReactElement, useState } from 'react';
import { MusicStream } from '../../utilities/MusicStream';
import { useSightReadingConfig } from './SightReadingConfigContext';
import StaffDefinition from './StaffDefinition';
import { Clef } from '../../datatypes/Musics';
import { convertKeyConfigToKey } from '../../datatypes/Configs';
import GrandStaff from '../svg/GrandStaff';


export default function SightReadingPractice({ goHome, goToConfig }: { goHome: () => void, goToConfig: () => void }) {
    /** Configuration for this exercise */
    const sightReadingConfig = useSightReadingConfig();
    const [ key ] = useState(convertKeyConfigToKey(sightReadingConfig.key)!);
    const [ musicStream ] = useState(new MusicStream(sightReadingConfig, key));

    // for (let x = 0; x < 2; x++) {
    //     console.log(musicStream.getNextMeasure());
    // }

    // -- Treble Staff --
    let trebleStaff: ReactElement | string = ('');
    if (sightReadingConfig.includeTrebleClef) {
        trebleStaff = (<div>
            {/* Staff Definition */}
            <StaffDefinition clef={ Clef.TREBLE } musicKey={ key } timeSignature={ sightReadingConfig.timeSignature }></StaffDefinition>
            {/* Music! */}
            <svg></svg>
        </div>);
    }

    // -- Bass Staff --
    let bassStaff: ReactElement | string = ('');
    if (sightReadingConfig.includeBassClef) {
        bassStaff = (<div>
            {/* Staff Definition */}
            <StaffDefinition clef={ Clef.BASS } musicKey={ key } timeSignature={ sightReadingConfig.timeSignature }></StaffDefinition>
            {/* Music! */}
            <svg></svg>
        </div>);
    }

    return (
        <>
            {/* Breadcrumb Navigation */}
            <nav className="breadcrumbs">
                <button className="breadcrumb" onClick={ goHome }>Home</button>&gt;
                <button className="breadcrumb" onClick={ goToConfig }>Configuration</button>&gt;
                <span className="breadcrumb">Practice</span>
            </nav>

            <GrandStaff width={ 1100 } height={ 350 } ></GrandStaff>
        </>
    );
}

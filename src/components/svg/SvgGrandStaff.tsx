
import { ReactElement, useState } from "react";

import { Clef, Key, Octave, PITCH_CLASSES, PitchClass, RhythmicValue, Sound } from "../../datatypes/Musics";
import { useSightReadingConfig } from "../sight-reading/SightReadingConfigContext";

import SvgStaff from "./SvgStaff";
import SvgBarLine from "./SvgBarLine";
import SvgStaffDefinition from "./SvgStaffDefinition";
import SvgChord from "./SvgChord";
import { createNote, getChordsInKey, stepUpNote } from "../../utilities/MusicUtils";


type Params = {
    width: number;
    height: number;
    musicKey: Key;
};

// These need to add up to 100
const PADDING_RATIO = 12/100; // x2 because top and bottom
const STAFF_RATIO   = 28/100; // x2 because 2 staffs
const GAP_RATIO     = 20/100; // Gap between staffs

// TODO-ben : delete this
function createSampleSounds(height: number, staffThickness: number, musicKey: Key, clef: Clef, baseOctave: Octave): ReactElement[] {
    let eles: ReactElement[] = [];

    // // Upward notes
    // let previousNote = createNote(0, RhythmicValue.QUARTER, baseOctave, false)
    // for (let x = 0; x < 22; x++) {
    //     eles.push((<SvgChord
    //         key={ x }
    //         musicKey={ musicKey }
    //         clef={ clef }
    //         x={ 40 + x * 50 }
    //         staffLineHeight={ STAFF_RATIO * height / 4 }
    //         strokeWidth={ staffThickness }
    //         sound={ previousNote }></SvgChord>));
    //         previousNote = stepUpNote(previousNote, 1);
    // }

    // Chords in a key
    let chords = getChordsInKey(musicKey);
    for (let x = 0; x < chords.length; x++ ) {
        chords[x].root.octave = baseOctave;
        eles.push((<SvgChord
            key={ x }
            musicKey={ musicKey }
            clef={ clef }
            x={ 40 + x * 50 }
            staffLineHeight={ STAFF_RATIO * height / 4 }
            strokeWidth={ staffThickness }
            sound={ chords[x] }></SvgChord>));
    }

    return eles;
}

export default function GrandStaff({ width, height, musicKey }: Params) {
    const sightReadingConfig = useSightReadingConfig();
    const [ musicXShift, setMusicXShift ] = useState(0);

    // Line thicknesses
    const staffThickness = 1/100 * STAFF_RATIO * height;

    return (
        <svg viewBox={ `0 0 ${width} ${height}` } style={{ width: `${width}px`, height: `${height}px` }}>
            {/* Brace (to connect the two staffs) */}
            {/* TODO */}

            {/* Treble */}
            <g transform={ `translate(0 ${height * PADDING_RATIO})` }>
                <SvgStaff width={ width } height={ height * STAFF_RATIO } strokeWidth={ staffThickness }></SvgStaff>
                {/* TODO-ben : Staff Definition */}
                {/* <SvgStaffDefinition clef={ Clef.TREBLE } musicKey={ musicKey } timeSignature={ sightReadingConfig.timeSignature }></SvgStaffDefinition> */}
                <g style={{ transform: `translateX(${musicXShift}px)` }}>
                    {/* TODO-ben : Notes */}
                    { createSampleSounds(height, staffThickness, musicKey, Clef.TREBLE, 4) }
                </g>
            </g>

            {/* Bass */}
            <g transform={ `translate(0 ${height * (PADDING_RATIO + STAFF_RATIO + GAP_RATIO)})` }>
                <SvgStaff width={ width } height={ height * STAFF_RATIO } strokeWidth={ staffThickness }></SvgStaff>
                {/* TODO-ben : Staff Definition */}
                {/* <SvgStaffDefinition clef={ Clef.TREBLE } musicKey={ musicKey } timeSignature={ sightReadingConfig.timeSignature }></SvgStaffDefinition> */}
                <g style={{ transform: `translateX(${musicXShift}px)` }}>
                    {/* TODO-ben : Notes */}
                    { createSampleSounds(height, staffThickness, musicKey, Clef.BASS, 2) }
                </g>
            </g>

            {/* Initial, left-most bar line */}
            <SvgBarLine x={ 0 }
                y={ height * PADDING_RATIO }
                height={ height * (2*STAFF_RATIO + GAP_RATIO)}
                strokeWidth={ staffThickness }></SvgBarLine>
            {/* TODO */}

            {/* Bar lines to separate measures */}
            <g style={{ transform: `translateX(${musicXShift}px)` }}>
                {/* TODO */}
            </g>
        </svg>
    )
}
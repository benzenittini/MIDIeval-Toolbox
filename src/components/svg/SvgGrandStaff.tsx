
import { ReactElement, useState } from "react";

import { Clef, Key, LabeledNote, Octave, PITCH_CLASSES, PitchClass, RhythmicValue, Sound, TimeSignature } from "../../datatypes/Musics";
import { useSightReadingConfig } from "../sight-reading/SightReadingConfigContext";

import SvgStaff from "./SvgStaff";
import SvgBarLine from "./SvgBarLine";
import SvgStaffDefinition from "./SvgStaffDefinition";
import SvgChord from "./SvgChord";
import { getChordsInKey } from "../../utilities/MusicUtils";
import { LabeledMusic } from "../../utilities/MusicStream";


type Params = {
    width: number;
    height: number;
    musicKey: Key;
    timeSignature: TimeSignature;
    music: LabeledMusic[]; // Each element of the array is one measure
};

// These need to add up to 100
const PADDING_RATIO = 12/100; // x2 because top and bottom
const STAFF_RATIO   = 28/100; // x2 because 2 staffs
const GAP_RATIO     = 20/100; // Gap between staffs

export default function GrandStaff({ width, height, musicKey, timeSignature, music }: Params) {
    const [ musicXShift, setMusicXShift ] = useState(0);

    // Line thicknesses
    const staffThickness = 1/100 * STAFF_RATIO * height;

    function createSvgChord(labeledNoteGroup: LabeledNote[], x: number, clef: Clef) {
        return (<SvgChord
            key={ `chord-${x}` }
            clef={ clef }
            x={ x }
            staffLineHeight={ STAFF_RATIO * height / 4 }
            strokeWidth={ staffThickness }
            labeledNoteGroup={ labeledNoteGroup }
        ></SvgChord>);
    }

    // TODO-ben : Space "x" coordinates based on elapsed beat counts for the measure, and the shortest note in the measure.
    const trebleChords = music.map((measure, mi) => {
        return measure.trebleClef.map((noteGroup, ngi) => {
            return createSvgChord(noteGroup, 40 + (mi*200) + (ngi*50), Clef.TREBLE);
        }
    )});
    const bassChords = music.map((measure, mi) => {
        return measure.bassClef.map((noteGroup, ngi) => {
            return createSvgChord(noteGroup, 40 + (mi*200) + (ngi*50), Clef.BASS);
        }
    )});

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
                    { trebleChords }
                </g>
            </g>

            {/* Bass */}
            <g transform={ `translate(0 ${height * (PADDING_RATIO + STAFF_RATIO + GAP_RATIO)})` }>
                <SvgStaff width={ width } height={ height * STAFF_RATIO } strokeWidth={ staffThickness }></SvgStaff>
                {/* TODO-ben : Staff Definition */}
                {/* <SvgStaffDefinition clef={ Clef.TREBLE } musicKey={ musicKey } timeSignature={ sightReadingConfig.timeSignature }></SvgStaffDefinition> */}
                <g style={{ transform: `translateX(${musicXShift}px)` }}>
                    {/* TODO-ben : Notes */}
                    { bassChords }
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
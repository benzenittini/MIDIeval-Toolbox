
import { ReactElement, useState } from "react";

import { useSightReadingConfig } from "../sight-reading/SightReadingConfigContext";

import SvgStaff from "./SvgStaff";
import SvgBarLine from "./SvgBarLine";
import SvgStaffDefinition from "./SvgStaffDefinition";
import SvgChord from "./SvgChord";
import { LabeledMusic } from "../../utilities/MusicStream";
import { Key, Note } from "../../datatypes/ComplexTypes";
import { TimeSignature, Clef, Accidental } from "../../datatypes/BasicTypes";


type Params = {
    width: number;
    height: number;
    musicKey: Key;
    timeSignature: TimeSignature;
    music: LabeledMusic[]; // Each element of the array is one measure
};

// These need to add up to 100
const PADDING_RATIO = 12/100; // x2 because top and bottom
const STAFF_RATIO   = 25/100; // x2 because 2 staffs
const GAP_RATIO     = 26/100; // Gap between staffs

export default function GrandStaff({ width, height, musicKey, timeSignature, music }: Params) {
    const [ musicXShift, setMusicXShift ] = useState(0);

    /** Map of a letter to its accidental. */
    const originalKeyLetters = musicKey.getNoteLabelsInKey();

    // Line thicknesses
    const staffThickness = 1/100 * STAFF_RATIO * height;

    function createSvgChord(labeledNoteGroup: Note[], x: number, clef: Clef) {
        return (<SvgChord
            key={ `chord-${x}` }
            clef={ clef }
            x={ x }
            staffLineHeight={ STAFF_RATIO * height / 4 }
            strokeWidth={ staffThickness }
            labeledNoteGroup={ labeledNoteGroup }
            // TODO-ben : Every note in a chord will have the same accidental ... we can't do this.
            // TODO-ben : But we also want to make sure we properly set/unset accidentals based on the preceeding notes in the measure...
            // TODO-ben : Pass the current "key letters" into here. Map of letters to the accidental.
            // accidental={ Accidental.FLAT }
            // accidental={ Accidental.NATURAL }
            accidental={ Accidental.SHARP }
        ></SvgChord>);
    }

    // TODO-ben : Space "x" coordinates based on elapsed beat counts for the measure, and the shortest note in the measure.
    let trebleX = 40;
    let bassX = 40;
    const trebleMusic: ReactElement[] = [];
    const bassMusic: ReactElement[] = [];
    const barLines: ReactElement[] = [];
    music.forEach(measure => {
        // -- Treble Clef --
        measure.trebleClef.forEach(noteGroup => {
            let chord = createSvgChord(noteGroup, trebleX, Clef.TREBLE);
            trebleX += 50;
            trebleMusic.push(chord);
        });

        // -- Bass Clef --
        measure.bassClef.forEach(noteGroup => {
            let chord = createSvgChord(noteGroup, bassX, Clef.BASS);
            bassX += 50;
            bassMusic.push(chord);
        });

        // -- Bar Lines --
        let barX = Math.max(trebleX, bassX); // treble/bass should be equal, but in case they're not...
        barLines.push((<SvgBarLine
            key={ `bar-${barX}` }
            x={ barX }
            y={ height * PADDING_RATIO }
            height={ height * (2*STAFF_RATIO + GAP_RATIO)}
            strokeWidth={ staffThickness }
        ></SvgBarLine>));

        // Increment trebleX/bassX to account for the bar line
        trebleX = barX + 50;
        bassX = barX + 50;
    });

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
                    { trebleMusic }
                </g>
            </g>

            {/* Bass */}
            <g transform={ `translate(0 ${height * (PADDING_RATIO + STAFF_RATIO + GAP_RATIO)})` }>
                <SvgStaff width={ width } height={ height * STAFF_RATIO } strokeWidth={ staffThickness }></SvgStaff>
                {/* TODO-ben : Staff Definition */}
                {/* <SvgStaffDefinition clef={ Clef.TREBLE } musicKey={ musicKey } timeSignature={ sightReadingConfig.timeSignature }></SvgStaffDefinition> */}
                <g style={{ transform: `translateX(${musicXShift}px)` }}>
                    { bassMusic }
                </g>
            </g>

            {/* Initial, left-most bar line */}
            <SvgBarLine x={ 0 }
                y={ height * PADDING_RATIO }
                height={ height * (2*STAFF_RATIO + GAP_RATIO)}
                strokeWidth={ staffThickness }></SvgBarLine>

            {/* Bar lines to separate measures */}
            <g style={{ transform: `translateX(${musicXShift}px)` }}>
                { barLines }
            </g>
        </svg>
    )
}
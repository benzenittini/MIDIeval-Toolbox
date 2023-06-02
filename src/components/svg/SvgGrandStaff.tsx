
import { ReactElement, useState } from "react";

import { useSightReadingConfig } from "../sight-reading/SightReadingConfigContext";

import SvgStaff from "./SvgStaff";
import SvgBarLine from "./SvgBarLine";
import SvgStaffDefinition from "./SvgStaffDefinition";
import SvgChord from "./SvgChord";
import { LabeledMusic } from "../../utilities/MusicStream";
import { Key, Note } from "../../datatypes/ComplexTypes";
import { TimeSignature, Clef, Accidental, Letter } from "../../datatypes/BasicTypes";


type Params = {
    width: number;
    height: number;
    musicKey: Key;
    timeSignature: TimeSignature;
    music: LabeledMusic[]; // Each element of the array is one measure
};

// These need to add up to 100
const PADDING_RATIO = 20/100; // x2 because top and bottom
const STAFF_RATIO   = 20/100; // x2 because 2 staffs
const GAP_RATIO     = 20/100; // Gap between staffs

// This is relative to the overall grand staff height. Determines gap between WHOLE notes.
const BASE_NOTE_GAP_RATIO = 5 * STAFF_RATIO;

export default function GrandStaff({ width, height, musicKey, timeSignature, music }: Params) {
    const [ musicXShift, setMusicXShift ] = useState(0);

    /** Map of a letter to its accidental. */
    const originalKeyLetters: Record<Letter, Accidental> = musicKey.getNoteLabelsInKey()
        .reduce((obj, label) => {
            if (label) obj[label.letter] = label.accidental;
            return obj;
        }, {} as Record<Letter, Accidental>);

    // Line thicknesses
    const staffThickness = 1/100 * STAFF_RATIO * height;

    function createSvgChord(labeledNoteGroup: Note[], x: number, clef: Clef, accidentals: Record<Letter, Accidental>) {
        return (<SvgChord
            key={ `chord-${x}` }
            clef={ clef }
            x={ x }
            staffLineHeight={ STAFF_RATIO * height / 4 }
            strokeWidth={ staffThickness }
            labeledNoteGroup={ labeledNoteGroup }
            accidentals={ accidentals }
        ></SvgChord>);
    }

    function getDisplayedAccidentals(noteGroup: Note[], accidentals: Record<Letter, Accidental>) {
        return noteGroup
            .reduce((obj, note) => {
                const {letter, accidental} = note.getLabel();
                if (accidentals[letter] !== accidental) {
                    obj[letter] = accidental;
                }
                return obj;
            }, {} as Record<Letter, Accidental>)
    }

    let trebleX = 40;
    let bassX = 40;
    const trebleMusic: ReactElement[] = [];
    const bassMusic: ReactElement[] = [];
    const barLines: ReactElement[] = [];
    music.forEach(measure => {
        // For each measure, we need to track which notes are flats/naturals/sharps so we know what to label them.
        // At the start of each measure, they get reset to the flats/naturals/sharps in our key.
        let trebleAccidentals = {...originalKeyLetters};
        let bassAccidentals = {...originalKeyLetters};

        // let smallestRV = 

        // -- Treble Clef --
        measure.trebleClef.forEach(noteGroup => {
            let chord = createSvgChord(noteGroup, trebleX, Clef.TREBLE, trebleAccidentals);
            trebleX += BASE_NOTE_GAP_RATIO * height * noteGroup[0].rhythmicValue;
            trebleMusic.push(chord);

            // Update our displayed accidentals for this measure
            let chordAccidentals = getDisplayedAccidentals(noteGroup, trebleAccidentals);
            trebleAccidentals = {...trebleAccidentals, ...chordAccidentals};
        });

        // -- Bass Clef --
        measure.bassClef.forEach(noteGroup => {
            let chord = createSvgChord(noteGroup, bassX, Clef.BASS, bassAccidentals);
            bassX += BASE_NOTE_GAP_RATIO * height * noteGroup[0].rhythmicValue;
            bassMusic.push(chord);

            // Update our displayed accidentals for this measure
            let chordAccidentals = getDisplayedAccidentals(noteGroup, bassAccidentals);
            bassAccidentals = {...bassAccidentals, ...chordAccidentals};
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
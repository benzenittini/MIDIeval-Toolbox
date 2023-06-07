
import { ReactElement, useState } from "react";

import { useSightReadingConfig } from "../sight-reading/SightReadingConfigContext";

import SvgStaff from "./SvgStaff";
import SvgBarLine from "./SvgBarLine";
import SvgStaffDefinition from "./SvgStaffDefinition";
import SvgChord, { NOTE_WIDTH_RATIO } from "./SvgChord";
import { LabeledMusic } from "../../utilities/MusicStream";
import { Key, Note } from "../../datatypes/ComplexTypes";
import { TimeSignature, Clef, Accidental, Letter, RhythmicValue } from "../../datatypes/BasicTypes";
import { average, averageSlope } from "../../utilities/NumberUtils";
import { getPositionByNote, positionToY } from "../../utilities/MusicUtils";


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

const BEAM_SLOPE = 0.15;

function groupBeamedChords(measure: Note[][]) {
    // Go through the measure, grouping notes that are (1) the same rhythmic value, and (2) within an octave of the note before it.
    return measure.reduce((a, b) => {
        const latestBeamGroup = a[a.length-1];
        if (latestBeamGroup.length === 0) {
            // If our latest beam group is empty, we have nothing to compare that would rule it out. Add it!
            latestBeamGroup.push(b);
        } else if (latestBeamGroup.length >= 4) {
            // If our latest beam group is full, start a new group!
            a.push([b]);
        } else if (b[0].rhythmicValue !== RhythmicValue.EIGHTH) {
            // Don't want to beam non-eighth notes. Start a new beam group.
            a.push([b]);
        } else {
            // Otherwise, check if this chord fits in the beam group, or if it needs its own beam group.
            const latestChord = latestBeamGroup[latestBeamGroup.length-1];
            const sameRhythmicValue = latestChord[0].rhythmicValue === b[0].rhythmicValue;
            const pitchDistance = Math.abs(average(latestChord.map(c => c.pitch)) - average(b.map(c => c.pitch)));
            if (sameRhythmicValue && pitchDistance < 8) {
                // Use the same beam group!
                latestBeamGroup.push(b);
            } else {
                // Start a new beam group.
                a.push([b]);
            }
        }
        return a;
    }, [[]] as (Note[])[][]); // An array of beam groups, each group containing one or more chords where one chord is a Note[].
    /* In other words:
        *   [
        *     [ chord1, chord2 ], // One beamed group
        *     [ chord3 ],         // The next beamed group (but not actually beamed 'cause just one chord.)
        *   ]
        */
}

// Determine the line that makes up our beam (in slope-intercept form)
function getBeamLine(beamGroup: Note[][], clef: Clef, startingX: number, noteWidth: number, staffLineHeight: number): { beamLine: undefined | ((x: number) => number), isAbove: boolean } {
    if (beamGroup.length <= 1)
        return { beamLine: undefined, isAbove: false };

    // Determine slope
    const averagePitches = beamGroup.map(chord => average(chord.map(c => c.pitch)));
    const actualSlope = averageSlope(averagePitches);
    const displayedSlope = actualSlope === 0 ? 0 : (actualSlope > 0 ? BEAM_SLOPE : -BEAM_SLOPE);

    // Determine the y location at the start of the beam.

    // 1) Figure out if beam should go above or below the notes.
    const middlePitch = (clef === Clef.TREBLE) ? 71 : 50;
    const aboveBelow = averagePitches.reduce((counts, pitch) => {
        // Track the number above/below the middle pitch.
        if (pitch >= middlePitch) counts.above++;
        else                      counts.below++;
        // Delta is useful for tiebreakers.
        counts.delta += (pitch - middlePitch);
        return counts;
    }, { above: 0, below: 0, delta: 0 });
    const shouldBeAbove = (aboveBelow.above < aboveBelow.below) ||
        (aboveBelow.above === aboveBelow.below && aboveBelow.delta < 0);

    // 2) Figure out how far above/below based on the note locations.
    let startingY = 0;
    if (shouldBeAbove) {
        let highestNoteY = Infinity;
        for (let i = 0; i < beamGroup.length; i++) {
            // Find the Y value of each chord of this beam group.
            const chordYVals = beamGroup[i].map(note => positionToY(getPositionByNote(note, clef), staffLineHeight))
            // Grab the highest of those, and adjust its value based on the slope of the beam.
            const adjustedChordY = Math.min(...chordYVals) - displayedSlope * i * noteWidth;
            if (adjustedChordY < highestNoteY) {
                highestNoteY = adjustedChordY;
            }
        }
        startingY = highestNoteY - displayedSlope * startingX - 2 * staffLineHeight;
    } else {
        let lowestNoteY = -Infinity;
        for (let i = 0; i < beamGroup.length; i++) {
            // Find the Y value of each chord of this beam group.
            const chordYVals = beamGroup[i].map(note => positionToY(getPositionByNote(note, clef), staffLineHeight))
            // Grab the lowest of those, and adjust its value based on the slope of the beam.
            const adjustedChordY = Math.max(...chordYVals) - displayedSlope * i * noteWidth;
            if (adjustedChordY > lowestNoteY) {
                lowestNoteY = adjustedChordY;
            }
        }
        startingY = lowestNoteY - displayedSlope * startingX + 2 * staffLineHeight;
    }

    // Lastly create the line equation
    return {
        beamLine: (x: number) => displayedSlope*x + startingY,
        isAbove: shouldBeAbove,
    };
}

export default function GrandStaff({ width, height, musicKey, timeSignature, music }: Params) {
    const [ musicXShift, setMusicXShift ] = useState(200);

    /** The height of one line on the staff. */
    const staffLineHeight = STAFF_RATIO * height / 4;

    /** The base thickness of our lines. */
    const staffThickness = 1/100 * STAFF_RATIO * height;

    /** Map of a letter to its accidental. */
    const originalKeyLetters: Record<Letter, Accidental> = musicKey.getNoteLabelsInKey()
        .reduce((obj, label) => {
            if (label) obj[label.letter] = label.accidental;
            return obj;
        }, {} as Record<Letter, Accidental>);

    function createSvgChord(labeledNoteGroup: Note[], x: number, clef: Clef, accidentals: Record<Letter, Accidental>, stemTo?: number) {
        return (<SvgChord
            key={ `chord-${x}` }
            clef={ clef }
            x={ x }
            staffLineHeight={ staffLineHeight }
            strokeWidth={ staffThickness }
            labeledNoteGroup={ labeledNoteGroup }
            accidentals={ accidentals }
            stemTo={ stemTo }
        ></SvgChord>);
    }

    function createSvgBeam(beamLine: (x: number) => number, x1: number, x2: number) {
        return (
            <line
                key={ `beam-${x1}-${x2}` }
                x1={ x1 }
                x2={ x2 }
                y1={ beamLine(x1) }
                y2={ beamLine(x2) }
                strokeWidth={ 7*staffThickness }
                stroke={ 'var(--gray-light)' }
            />
        )
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

        // -- Figure out our beams --
        let trebleBeamGroups = groupBeamedChords(measure.trebleClef);
        let bassBeamGroups   = groupBeamedChords(measure.bassClef);

        const noteWidth = BASE_NOTE_GAP_RATIO * height * RhythmicValue.EIGHTH;

        // -- Treble Clef --
        trebleBeamGroups.forEach(beamGroup => {
            const { beamLine, isAbove } = getBeamLine(beamGroup, Clef.TREBLE, trebleX, noteWidth, staffLineHeight);
            let beamStartX = trebleX;
            let beamStopX  = trebleX;

            beamGroup.forEach(noteGroup => {
                beamStopX = trebleX;
                let chord = createSvgChord(noteGroup, trebleX, Clef.TREBLE, trebleAccidentals, (beamLine ? beamLine(trebleX) : undefined));
                trebleX += noteWidth;
                trebleMusic.push(chord);

                // Update our displayed accidentals for this measure
                let chordAccidentals = getDisplayedAccidentals(noteGroup, trebleAccidentals);
                trebleAccidentals = {...trebleAccidentals, ...chordAccidentals};
            });

            if (beamLine) {
                const noteHeadWidth = NOTE_WIDTH_RATIO * staffLineHeight;
                beamStartX += (isAbove) ? noteHeadWidth : -noteHeadWidth;
                beamStopX  += (isAbove) ? noteHeadWidth : -noteHeadWidth;
                trebleMusic.push(createSvgBeam(beamLine, beamStartX, beamStopX));
            }
        });

        // -- Bass Clef --
        bassBeamGroups.forEach(beamGroup => {
            const { beamLine, isAbove } = getBeamLine(beamGroup, Clef.BASS, bassX, noteWidth, staffLineHeight);
            let beamStartX = bassX;
            let beamStopX  = bassX;

            beamGroup.forEach(noteGroup => {
                beamStopX = bassX;
                let chord = createSvgChord(noteGroup, bassX, Clef.BASS, bassAccidentals, (beamLine ? beamLine(bassX) : undefined));
                bassX += noteWidth;
                bassMusic.push(chord);

                // Update our displayed accidentals for this measure
                let chordAccidentals = getDisplayedAccidentals(noteGroup, bassAccidentals);
                bassAccidentals = {...bassAccidentals, ...chordAccidentals};
            });

            if (beamLine) {
                const noteHeadWidth = NOTE_WIDTH_RATIO * staffLineHeight;
                beamStartX += (isAbove) ? noteHeadWidth : -noteHeadWidth;
                beamStopX  += (isAbove) ? noteHeadWidth : -noteHeadWidth;
                bassMusic.push(createSvgBeam(beamLine, beamStartX, beamStopX));
            }
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
                <SvgStaffDefinition
                    clef={ Clef.TREBLE }
                    musicKey={ musicKey }
                    timeSignature={ timeSignature }
                    staffLineHeight={ staffLineHeight }
                    ></SvgStaffDefinition>

                <g style={{ transform: `translateX(${musicXShift}px)` }}>
                    { trebleMusic }
                </g>
            </g>

            {/* Bass */}
            <g transform={ `translate(0 ${height * (PADDING_RATIO + STAFF_RATIO + GAP_RATIO)})` }>
                <SvgStaff width={ width } height={ height * STAFF_RATIO } strokeWidth={ staffThickness }></SvgStaff>
                <SvgStaffDefinition
                    clef={ Clef.BASS }
                    musicKey={ musicKey }
                    timeSignature={ timeSignature }
                    staffLineHeight={ staffLineHeight }
                    ></SvgStaffDefinition>

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
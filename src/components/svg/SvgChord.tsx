
import { ReactElement } from "react";
import { Accidental, Clef, Letter, RhythmicValue } from "../../datatypes/BasicTypes";
import { Note } from "../../datatypes/ComplexTypes";
import { getPairCombinations } from "../../utilities/ArrayUtils";
import SvgAccidental from "./SvgAccidental";
import { getPositionByNote, positionToY } from "../../utilities/MusicUtils";
import SvgNoteFlag from "./SvgNoteFlag";

const NOTE_COLOR = 'var(--gray-light)';

// Relative to the staffLineHeight
const NOTE_WIDTH_RATIO  = 7/12;
const NOTE_HEIGHT_RATIO = 5/12;

type Params = {
    x: number;
    staffLineHeight: number;
    strokeWidth: number;
    labeledNoteGroup: Note[];
    clef: Clef;
    stemTo?: number; // If set, will draw a stem to the given height. Used for beamed chords where the stem has a variable length.
    accidentals: Record<Letter, Accidental>;
};

function createNoteHead(x: number, y: number, staffLineHeight: number, strokeWidth: number, note: Note) {
    return (<ellipse
        key={ `note-${y}` }
        cx={ x }
        cy={ y }
        rx={ NOTE_WIDTH_RATIO * staffLineHeight }
        ry={ NOTE_HEIGHT_RATIO * staffLineHeight }
        transform={ `rotate(-5 ${staffLineHeight/2} ${staffLineHeight/2}) `}
        style={{ transformOrigin: `${x}px ${y}px`}}
        strokeWidth={ 2*strokeWidth }
        stroke={ NOTE_COLOR }
        fill={ [RhythmicValue.WHOLE, RhythmicValue.HALF].includes(note.rhythmicValue) ? 'transparent' : NOTE_COLOR }
    ></ellipse>);
}
function createNoteStem(stemX: number, stemY: number, stemY2: number, strokeWidth: number) {
    return (<line
        key={ `stem-${stemX}-${stemY}` }
        x1={ stemX }
        x2={ stemX }
        y1={ stemY }
        y2={ stemY2 }
        strokeWidth={ 2*strokeWidth }
        stroke={ NOTE_COLOR }
    ></line>)
}


export default function SvgChord({ x, staffLineHeight, strokeWidth, labeledNoteGroup, clef, stemTo, accidentals }: Params) {

    // First, determine which lines/gaps the notes are on, sorted so the highest notes come first.
    let notePositions = labeledNoteGroup
        .map(note => ({ note, position: getPositionByNote(note, clef) }))
        .sort((a, b) => b.position - a.position);
    
    // Then, calculate some useful things that span the entire group of notes.

    /** The smallest positional gap between any two notes, or null if there's just one note. */
    const closestPosition = (notePositions.length > 1)
        ? Math.min(...getPairCombinations(notePositions).map((([n1, n2]) => Math.abs(n1.position - n2.position))))
        : null;
    /** The number of notes above and below the middle line ("position 6"). */
    const aboveBelow = notePositions.reduce((counts, note) => {
        if (note.position >= 6) counts.above++;
        else                    counts.below++;
        return counts;
    }, { above: 0, below: 0 });

    // Convert the note positions into x/y coordinates for the note heads and stems.
    let renderData = notePositions
        .map((np, i, notes) => {

            // =====================
            // Note Head Positioning
            // ---------------------

            let noteX = x;
            let noteY = positionToY(np.position, staffLineHeight);

            // If the note after this one is just one position away, draw this note 1 note-width to the right.
            if (i+1 < notes.length && Math.abs(notes[i+1].position - notes[i].position) <= 1) {
                noteX += 2 * NOTE_WIDTH_RATIO * staffLineHeight;
            }


            // ======================
            // Accidental Positioning
            // ----------------------

            let accidentalX = x - NOTE_WIDTH_RATIO*staffLineHeight - 3; // -3 is an arbitrary budge factor.


            // ================
            // Stem Positioning
            // ----------------

            // -- Stem X Position --

            const notesAreClose = closestPosition && closestPosition <= 1;
            const majorityBelow = aboveBelow.below > aboveBelow.above;
            // Stem goes on the right side of the left-most note if either:
            //   - Any two of the notes are within one position of each other (stem goes down middle)
            //   - If majority of notes are below the middle line
            // Otherwise, stem goes on left side.
            let stemX = (notesAreClose || majorityBelow)
                ? x + NOTE_WIDTH_RATIO * staffLineHeight
                : x - NOTE_WIDTH_RATIO * staffLineHeight;

            // -- Stem Y Position --

            let stemY = noteY;
            let stemY2 = stemTo ??
                (aboveBelow.above > aboveBelow.below)
                    ? stemY + 3*staffLineHeight
                    : stemY - 3*staffLineHeight;


            // ===================
            // Final Return Object
            // -------------------

            return {
                ...np,
                noteX, noteY,
                stemX, stemY, stemY2,
                accidentalX,
            };
        });

    // Finally, convert all of that position data to actual SVG elements to display.
    let elements: ReactElement[] = [];
    for (let {note, noteX, noteY, stemX, stemY, stemY2, accidentalX} of renderData) {
        // -- Note Head --
        elements.push(createNoteHead(noteX, noteY, staffLineHeight, strokeWidth, note));

        // -- Note Stem --
        if (note.rhythmicValue !== RhythmicValue.WHOLE) {
            elements.push(createNoteStem(stemX, stemY, stemY2, strokeWidth));
        }

        // -- Accidental --
        const displayedAccidental = note.getLabel().getDisplayedAccidental(accidentals);
        if (displayedAccidental) {
            elements.push((<SvgAccidental
                key={ `accidental-${accidentalX}-${noteY}` }
                x={ accidentalX }
                y={ noteY }
                staffLineHeight={ staffLineHeight }
                accidental={ displayedAccidental }
                color={ NOTE_COLOR }
                ></SvgAccidental>));
        }
    }

    // -- Flag --

    // The "closest note" is closest to the end of the stem. This is the note that gets the flag attached to it.
    let closestNote = renderData.reduce((a, b) => {
        // Returns the note which is closer to the end of the stem
        return (a.noteY > a.stemY2)
            ? (a.stemY2 > b.stemY2 ? b : a)  // Stem points upwards
            : (a.stemY2 > b.stemY2 ? a : b); // Stem points downwards
    });

    if (closestNote.note.getRhythmicValue() === RhythmicValue.EIGHTH && stemTo === undefined) {
        elements.push((<SvgNoteFlag
            key={ `flag-${closestNote.stemX}-${closestNote.stemY2}` }
            x={ closestNote.stemX }
            y={ closestNote.stemY2 }
            flipVertically={ closestNote.stemY2 > closestNote.stemY }
            height={ 3*staffLineHeight }
            color={ NOTE_COLOR }
            ></SvgNoteFlag>))
    }

    return (
        <>
            { elements }
        </>
    )
}
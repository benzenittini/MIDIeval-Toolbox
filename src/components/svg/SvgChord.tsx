
import { ReactElement } from "react";
import { Accidental, Clef, Letter, RhythmicValue } from "../../datatypes/BasicTypes";
import { Note } from "../../datatypes/ComplexTypes";
import { getPairCombinations } from "../../utilities/ArrayUtils";

/** Starting with the ledger line below the staff and going upwards for one octave, the Treble Clef's letters. */
const TREBLE_CLEF: Letter[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
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

// TODO-ben : Pull this into a separate React SVG file..? Could be useful for displaying the key signature.
function createAccidental(accidentalX: number, noteY: number, staffLineHeight: number, accidental: Accidental) {
    // Each symbol needs to be moved up or down slightly to properly center them.
    let budge = 0;
    switch (accidental) {
        case Accidental.FLAT:    budge = -3; break;
        case Accidental.NATURAL: budge = 5;  break;
        case Accidental.SHARP:   budge = 3;  break;
    }

    return (<text
        key={ `accidental-${accidentalX}-${noteY}` }
        x={ accidentalX }
        y={ noteY + budge }
        fill={ NOTE_COLOR }
        fontSize={ 2*staffLineHeight }
        dominantBaseline="middle"
        textAnchor="end"
    >{ accidental }</text>);
}

/**
 * Calculates and returns the "position" of the note. The position is the line or gap the note appears on, starting
 * one ledger line below the staff ("position 0") and counting upwards. Each line or gap increases the position by 1.
 */
function getNotePosition(labeledNote: Note, clef: Clef) {
    const baseClefOctave = clef === Clef.BASS ? 2 : 4;
    const label = labeledNote.getLabel();

    // Determine the line/gap the note goes into by:
    // 1.) Using the letter and the clef to determine the base position for this clef. Bass clef is 2 spots lower.
    let basePosition = TREBLE_CLEF.indexOf(label.letter) + ((Clef.BASS === clef) ? -2 : 0);

    // 2.) Adjust based on the "Octave borderline" notes.
    //     Cb should be rendered one octave higher to go with the B below it.
    //     B# should be rendered one octave lower to go with the C above it.
    let octaveAdjustment = 0;
    if (label.letter === 'C' && label.accidental === Accidental.FLAT)  octaveAdjustment = 1;
    if (label.letter === 'B' && label.accidental === Accidental.SHARP) octaveAdjustment = -1;

    // 3.) Use the octave to determine the final shift
    basePosition += ((labeledNote.getOctave() - baseClefOctave + octaveAdjustment) * 7);

    return basePosition;
}
function positionToY(position: number, staffLineHeight: number): number {
    return (5*staffLineHeight) - (position  * staffLineHeight/2);
}

export default function SvgChord({ x, staffLineHeight, strokeWidth, labeledNoteGroup, clef, stemTo, accidentals }: Params) {

    // First, determine which lines/gaps the notes are on, sorted so the highest notes come first.
    let notePositions = labeledNoteGroup
        .map(note => ({ note, position: getNotePosition(note, clef) }))
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
            elements.push(createAccidental(accidentalX, noteY, staffLineHeight, displayedAccidental));
        }
    }

    return (
        <>
            { elements }
        </>
    )
}
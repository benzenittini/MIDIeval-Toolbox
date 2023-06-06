
import { Clef, Accidental, Letter, Octave } from "../datatypes/BasicTypes";
import { Note, NoteLabel } from "../datatypes/ComplexTypes";


/** Starting with the ledger line below the staff and going upwards for one octave, the Treble Clef's letters. */
const TREBLE_CLEF: Letter[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];


/**
 * Calculates and returns the "position" of the note. The position is the line or gap the note appears on, starting
 * one ledger line below the staff ("position 0") and counting upwards. Each line or gap increases the position by 1.
 */
export function getPositionByNote(labeledNote: Note, clef: Clef) {
    return getPositionByOctave(labeledNote.getLabel(), labeledNote.getOctave(), clef);
}

export function getPositionByOctave(noteLabel: NoteLabel, octave: Octave, clef: Clef, adjustBorderline: boolean = true) {
    const baseClefOctave = clef === Clef.BASS ? 2 : 4;

    // Determine the line/gap the note goes into by:
    // 1.) Using the letter and the clef to determine the base position for this clef. Bass clef is 2 spots lower.
    let basePosition = TREBLE_CLEF.indexOf(noteLabel.letter) + ((Clef.BASS === clef) ? -2 : 0);

    // 2.) Adjust based on the "Octave borderline" notes.
    //     Cb should be rendered one octave higher to go with the B below it.
    //     B# should be rendered one octave lower to go with the C above it.
    let octaveAdjustment = 0;
    if (adjustBorderline) {
        if (noteLabel.letter === 'C' && noteLabel.accidental === Accidental.FLAT)  octaveAdjustment = 1;
        if (noteLabel.letter === 'B' && noteLabel.accidental === Accidental.SHARP) octaveAdjustment = -1;
    }

    // 3.) Use the octave to determine the final shift
    basePosition += ((octave - baseClefOctave + octaveAdjustment) * 7);

    return basePosition;
}

export function positionToY(position: number, staffLineHeight: number): number {
    return (5*staffLineHeight) - (position  * staffLineHeight/2);
}
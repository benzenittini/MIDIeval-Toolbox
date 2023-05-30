
import { ReactElement } from "react";

import { Clef, Key, LabeledNote, Note } from "../../datatypes/Musics";
import { getChordNotes } from "../../utilities/MusicUtils";
import { Letter, pitchClassToLetter } from "../../utilities/NotationUtils";

/** Starting with the ledger line below the staff and going upwards, the Treble Clef's letters. */
const TREBLE_CLEF: Letter[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

type Params = {
    x: number;
    staffLineHeight: number;
    strokeWidth: number;
    labeledNoteGroup: LabeledNote[];
    clef: Clef;
};

function createNoteHead(x: number, y: number, staffLineHeight: number, strokeWidth: number) {
    return (<ellipse
        key={ `note-${y}` }
        cx={ x }
        cy={ y }
        rx={ 7/12*staffLineHeight }
        ry={ 5/12*staffLineHeight }
        transform={ `rotate(-5 ${staffLineHeight/2} ${staffLineHeight/2}) `}
        style={{ transformOrigin: `${x}px ${y}px`}}
        strokeWidth={ 2*strokeWidth }
        stroke="var(--gray-vlight)"
        fill="transparent"></ellipse>);
}

function getNoteY(labeledNote: LabeledNote, clef: Clef, staffLineHeight: number) {
    const baseClefOctave = clef === Clef.BASS ? 2 : 4;

    // Determine the line/gap the note goes into by:
    // 1.) Using the letter and the clef to determine the base position for this clef. Bass clef is 2 spots lower.
    let basePosition = TREBLE_CLEF.indexOf(labeledNote.letter) + ((Clef.BASS === clef) ? -2 : 0);
    // 2.) Use the octave to determine the final shift
    basePosition += ((labeledNote.octave - baseClefOctave) * 7);

    // Determine the y height by using the line/gap for this note
    return (5*staffLineHeight) - (basePosition * staffLineHeight/2);
}

export default function SvgChord({ x, staffLineHeight, strokeWidth, labeledNoteGroup, clef }: Params) {

    let heads: ReactElement[] = [];
    for (let labeledNote of labeledNoteGroup) {
        const y = getNoteY(labeledNote, clef, staffLineHeight);
        heads.push(createNoteHead(x, y, staffLineHeight, strokeWidth));
    }

    return (
        <>
            { heads }
        </>
    )
}

import { ReactElement } from "react";
import { Accidental, Clef, Octave, TimeSignature } from "../../datatypes/BasicTypes";
import { C_FLAT, F_FLAT, G_FLAT, G_SHARP, Key, NoteLabel } from "../../datatypes/ComplexTypes";
import SvgAccidental from "./SvgAccidental";
import SvgBassClef from "./SvgBassClef";
import SvgTrebleClef from "./SvgTrebleClef";
import { getPositionByOctave, positionToY } from "../../utilities/MusicUtils";

type Props = {
    clef: Clef,
    musicKey: Key,
    timeSignature: TimeSignature,
    staffLineHeight: number,
}

export default function SvgStaffDefinition({ clef, musicKey, timeSignature, staffLineHeight }: Props) {

    let currentX = 10;

    // =========
    // Clef Icon
    // ---------

    const clefIcon = (clef === Clef.TREBLE)
        ? (<SvgTrebleClef height={ staffLineHeight * 7.0 } x={ currentX } y={ -1.25*staffLineHeight }></SvgTrebleClef>)
        : (<SvgBassClef   height={ staffLineHeight * 3.5 } x={ currentX } y={ 0 }></SvgBassClef>);
    currentX += 80;


    // =============
    // Key Signature
    // -------------

    /** List of sharps/flats in the current key. */
    const flatsSharps = musicKey.getNoteLabelsInKey().filter(nl => nl !== null && nl.accidental !== Accidental.NATURAL) as NoteLabel[];

    // Make sure they show up in the right order.
    if (flatsSharps.length > 1) {
        // (They should all be flat, or all be sharp. Using the first as an indicator.)
        const sortOrder = (flatsSharps[0].accidental === Accidental.FLAT)
            ? ['B', 'E', 'A', 'D', 'G', 'C', 'F']
            : ['F', 'C', 'G', 'D', 'A', 'E', 'B'];
        flatsSharps.sort((a, b) => sortOrder.indexOf(a.letter) - sortOrder.indexOf(b.letter));
    }

    const keySignature: ReactElement[] = [];
    for (let i = 0; i < flatsSharps.length; i++) {
        // Putting the accidentals in the correct octave is ... weird.
        let octave = (clef === Clef.BASS ? 3 : 5) as Octave;
        if (['A', 'B'].includes(flatsSharps[i].letter)) octave = octave - 1 as Octave;
        if ([G_FLAT, F_FLAT].includes(flatsSharps[i]))  octave = octave - 1 as Octave

        // Figure out the correct x/y coordinates for this symbol.
        const accidentalX = currentX;
        const accidentalY = positionToY(getPositionByOctave(flatsSharps[i], octave, clef, false), staffLineHeight);
        currentX += 10;

        // Lastly, construct the SVG element!
        keySignature.push(<SvgAccidental
            key={ `key-${accidentalX}-${accidentalY}` }
            x={ accidentalX }
            y={ accidentalY }
            staffLineHeight={ staffLineHeight }
            accidental={ flatsSharps[i].accidental }
            color="var(--gray-dark)"
            ></SvgAccidental>);
    }


    // ==============
    // Time Signature
    // --------------

    const timeSig = [timeSignature.top, timeSignature.bottom].map((ts, i) => {
        return (<text x={ currentX }
            key={ `timesig-${i}` }
            y={ (i === 0 ? 1 : 3) * staffLineHeight }
            fill="var(--gray-dark)"
            fontSize={ 2.5*staffLineHeight }
            fontFamily="serif"
            fontWeight="bold"
            dominantBaseline="central"
            >{ ts }</text>);
    });


    return (
        <>
            { clefIcon }
            { keySignature }
            { timeSig }
        </>
    );
}

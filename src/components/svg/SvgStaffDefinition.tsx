
import { Clef, TimeSignature } from "../../datatypes/BasicTypes";
import { Key } from "../../datatypes/ComplexTypes";
import SvgBassClef from "./SvgBassClef";
import SvgTrebleClef from "./SvgTrebleClef";

type Props = {
    clef: Clef,
    musicKey: Key,
    timeSignature: TimeSignature,
    staffLineHeight: number,
}

export default function SvgStaffDefinition({ clef, musicKey, timeSignature, staffLineHeight }: Props) {

    const clefIcon = (clef === Clef.TREBLE)
        ? (<SvgTrebleClef height={ staffLineHeight * 7.0 } x={ 10 } y={ -1.25*staffLineHeight }></SvgTrebleClef>)
        : (<SvgBassClef   height={ staffLineHeight * 3.5 } x={ 10 } y={ 0 }></SvgBassClef>);

    return (
        <>
            { clefIcon }
            {/* TODO-ben : Key signature */}
            {/* TODO-ben : Time signature */}
        </>
    );
}

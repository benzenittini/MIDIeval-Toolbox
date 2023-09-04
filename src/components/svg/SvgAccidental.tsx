import { memo } from "react";
import { Accidental } from "../../datatypes/BasicTypes"

type Props = {
    x: number,
    y: number,
    staffLineHeight: number,
    accidental: Accidental,
    color?: string,
}

export default memo(function SvgAccidental({ x, y, staffLineHeight, accidental, color = "var(--gray-light)" }: Props) {
    // Each symbol needs to be moved up or down slightly to properly center them.
    let budge = 0;
    switch (accidental) {
        case Accidental.FLAT:    budge = -3; break;
        case Accidental.NATURAL: budge = 5;  break;
        case Accidental.SHARP:   budge = 3;  break;
    }

    return (<text
        x={ x }
        y={ y + budge }
        fill={ color }
        fontSize={ 2*staffLineHeight }
        dominantBaseline="middle"
        textAnchor="end"
    >{ accidental }</text>);
});
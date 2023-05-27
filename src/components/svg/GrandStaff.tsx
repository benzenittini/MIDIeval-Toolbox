
import { useState } from "react";

import StaffDefinition from "../sight-reading/StaffDefinition";
import SvgStaff from "./SvgStaff";
import SvgBarLine from "./SvgBarLine";


type Params = {
    width: number;
    height: number;
};

// These need to add up to 100
const PADDING_RATIO = 5/100;  // x2 because top and bottom
const STAFF_RATIO   = 30/100; // x2 because 2 staffs
const GAP_RATIO     = 20/100; // Gap between staffs

export default function GrandStaff({ width, height }: Params) {
    const [ musicXShift, setMusicXShift ] = useState(0);
    // TODO-ben : Set up ratios for the width/height, and 800/250 in this file similar to SvgStaff

    // Line thicknesses
    const staffThickness = 1/100 * STAFF_RATIO * height;

    return (
        <svg viewBox={ `0 0 ${width} ${height}` } style={{ width: `${width}px`, height: `${height}px` }}>
            {/* Brace (to connect the two staffs) */}
            {/* TODO */}

            {/* Treble */}
            <g transform={ `translate(0 ${height * PADDING_RATIO})` }>
                <SvgStaff width={ width } height={ height * STAFF_RATIO } strokeWidth={ staffThickness }></SvgStaff>
                {/* <StaffDefinition></StaffDefinition> */}
                <g style={{ transform: `translateX(${musicXShift}px)` }}>
                    {/* TODO-ben : Notes */}
                </g>
            </g>

            {/* Bass */}
            <g transform={ `translate(0 ${height * (PADDING_RATIO + STAFF_RATIO + GAP_RATIO)})` }>
                <SvgStaff width={ width } height={ height * STAFF_RATIO } strokeWidth={ staffThickness }></SvgStaff>
                {/* <StaffDefinition></StaffDefinition> */}
                <g style={{ transform: `translateX(${musicXShift}px)` }}>
                    {/* TODO-ben : Notes */}
                </g>
            </g>

            {/* Initial, left-most bar line */}
            <SvgBarLine x={ 0 }
                y={ height * PADDING_RATIO }
                height={ height * (2*STAFF_RATIO + GAP_RATIO)}
                strokeWidth={ staffThickness }></SvgBarLine>
            {/* TODO */}

            {/* Bar lines to separate measures */}
            <g style={{ transform: `translateX(${musicXShift}px)` }}>
                {/* TODO */}
            </g>
        </svg>
    )
}
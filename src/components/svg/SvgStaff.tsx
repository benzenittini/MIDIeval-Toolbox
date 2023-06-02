
import { ReactElement } from "react";

type Params = {
    width: number;
    height: number;
    strokeWidth: number;
    stroke?: string;
};

const GAP_RATIO = 1/4; // 4 gaps make a staff

export default function SvgStaff({ width, height, strokeWidth, stroke = "var(--gray)" }: Params) {
    const lines: ReactElement[] = [];
    let currentY = 0;
    for (let x = 0; x < 5; x++) {
        lines.push((<line
            key={ `line-${x}` }
            x1="0"
            x2={ width }
            y1={ currentY }
            y2={ currentY }
            strokeWidth={ strokeWidth }
            stroke={ stroke }
        />));
        currentY += (GAP_RATIO * height);
    }
    return (
        <>
            { lines }
        </>
    )
}

type Params = {
    x: number;
    y: number;
    height: number;
    strokeWidth: number;
    stroke?: string;
};

export default function SvgBarLine({ x, y, height, strokeWidth, stroke = "var(--gray-dark)" }: Params) {
    return (
        <line
            x1={ x }
            x2={ x }
            y1={ y }
            y2={ y + height }
            strokeWidth={ strokeWidth }
            stroke={ stroke }
        />
    )
}
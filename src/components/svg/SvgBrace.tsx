

type Params = {
    x: number;
    y: number;
    height: number;
    color?: string;
};

const WIDTH_RATIO = 25/330;

export default function SvgNoteFlag({ x, y, height, color = "var(--gray-light)" }: Params) {
    return (
        <g transform={ `translate(${x} ${y})` }>
            <svg width={ WIDTH_RATIO * height } height={ height } viewBox="0 0 25 330" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0.5 165C32.5 217 -22.5 280 24 329.5C-8.5 281 42.5 221.5 3 165C42 104.5 -8 54 24.5 0C-21.5 41.5 31 120 0.5 165Z" fill={ color }/>
            </svg>
        </g>
    );
}


type Params = {
    x: number;
    y: number;
    height: number;
    flipVertically?: boolean;
    color?: string;
};

const WIDTH_RATIO = 22/68;

export default function SvgNoteFlag({ x, y, height, flipVertically = false, color = "var(--gray-light)" }: Params) {
    return (
        <g transform={ `translate(${x} ${y}) scale(1, ${flipVertically ? -1 : 1})` }>
            <svg width={ WIDTH_RATIO * height } height={ height } viewBox="0 0 22 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.4698 68C22.4276 44.8889 16.271 24 0 22.6667V0C0 10.6667 32.542 34.2222 18.4698 68Z" fill={ color }/>
            </svg>
        </g>
    );
}
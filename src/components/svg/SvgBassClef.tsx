
type Params = {
    height: number;
    x?: number;
    y?: number;
    color?: string;
};

const WIDTH_RATIO = 79/90;

export default function SvgBassClef({ height, x = 0, y = 0, color = "var(--gray-dark)" }: Params) {
    return (
        <g transform={ `translate(${x} ${y})` }>
            <svg width={ WIDTH_RATIO * height } height={ height } viewBox="0 0 79 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill={ color } d="M6.17193e-06 89.5C45 85.5 67 38.5 53.5 14.5C42.9226 -4.30423 5.99999 -5.5 0.500022 17C0.500022 17 -0.000140205 20.5 0 25C0.000215786 31.9256 4.82101 38.5 11.5 38.5C18.179 38.5 22.5 33 22.5 26.5C22.5 21.5 18.5 17.5 14 17.5C10.7797 17.5 6.00001 19.5 6.00001 19.5C10.5 -3.5 45 0.500004 45 27.5C45 39.0109 40 69 6.17193e-06 89.5Z"/>
                <circle cx="73" cy="15" r="6" fill={ color }/>
                <circle cx="73" cy="42" r="6" fill={ color }/>
            </svg>
        </g>
    );
}
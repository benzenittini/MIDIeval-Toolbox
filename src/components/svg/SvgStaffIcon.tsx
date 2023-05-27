
type Params = {
    width: string;
    height: string;
    strokeWidth?: string;
    stroke?: string;
};

export default function SvgStaffIcon({ width, height, strokeWidth = "1px", stroke = "var(--gray-light)" }: Params) {
    return (
        <svg viewBox="0 0 90 90" preserveAspectRatio="none" style={{ width, height, strokeWidth, stroke }}>
            <line x1="0" x2="90" y1="5" y2="5" />
            <line x1="0" x2="90" y1="25" y2="25" />
            <line x1="0" x2="90" y1="45" y2="45" />
            <line x1="0" x2="90" y1="65" y2="65" />
            <line x1="0" x2="90" y1="85" y2="85" />
        </svg>
    )
}
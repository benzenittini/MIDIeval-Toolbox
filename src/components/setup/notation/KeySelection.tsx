
export default function KeySelection() {
    return (
        <>
            <label className="labelBefore">Key:</label>
            <select>
                <option>(All Keys)</option>
                <option>(Random Key)</option>
                <optgroup label="Major Keys">
                    <option>C Major</option>
                    <option>C# Major</option>
                    <option>D Major</option>
                    <option>D# Major</option>
                    <option>E Major</option>
                    <option>F Major</option>
                    <option>F# Major</option>
                    <option>G Major</option>
                    <option>G# Major</option>
                    <option>A Major</option>
                    <option>A# Major</option>
                    <option>B Major</option>
                </optgroup>
            </select>
        </>
    );
}
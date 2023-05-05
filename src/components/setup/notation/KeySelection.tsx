import { MajorKeyConfigOpts, MiscKeyConfigOpts } from "../../../datatypes/Configs";

export default function KeySelection() {

    const miscKeyOpts  = Object.entries(MiscKeyConfigOpts).map(([key, val]) => (<option value={key}>{val}</option>));
    const majorKeyOpts = Object.entries(MajorKeyConfigOpts).map(([key, val]) => (<option value={key}>{val}</option>));

    return (
        <>
            <label className="labelBefore">Key:</label>
            <select>
                {miscKeyOpts}
                <optgroup label="Major Keys">{majorKeyOpts}</optgroup>
            </select>
        </>
    );
}

import { MajorKeyConfigOpts, MiscKeyConfigOpts } from "../../../datatypes/Configs";
import { useNotationConfigDispatch } from "./NotationConfigContext";


export default function KeySelection() {
    const notationConfigDispatch = useNotationConfigDispatch();

    /** The key is the underlying identifier (C_MAJOR), whereas the val is the displayed content ("C Major") */
    const getOption = ([key, val]: [string, string]) => (<option key={key} value={key}>{val}</option>);

    const miscKeyOpts  = Object.entries(MiscKeyConfigOpts) .map(getOption);
    const majorKeyOpts = Object.entries(MajorKeyConfigOpts).map(getOption);

    function changeKey(event: any) {
        notationConfigDispatch({ type: 'setKey', data: event.target.value });
    }

    return (
        <div>
            <label className="labelBefore">Key:</label>
            <select onChange={ changeKey }>
                {miscKeyOpts}
                <optgroup label="Major Keys">{majorKeyOpts}</optgroup>
            </select>
        </div>
    );
}
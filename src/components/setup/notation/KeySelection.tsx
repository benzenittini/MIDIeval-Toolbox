
import { MiscKeys } from "../../../datatypes/Configs";
import { MajorKeys } from "../../../datatypes/Musics";
import { useNotationConfig, useNotationConfigDispatch } from "./NotationConfigContext";


export default function KeySelection() {
    const notationConfig = useNotationConfig();
    const notationConfigDispatch = useNotationConfigDispatch();

    const getOption = ([key, val]: [string, string]) => (<option key={key} value={val}>{val}</option>);

    const miscKeyOpts  = Object.entries(MiscKeys) .map(getOption);
    const majorKeyOpts = Object.entries(MajorKeys).map(getOption);

    function changeKey(event: any) {
        notationConfigDispatch({ type: 'setKey', data: event.target.value });
    }

    return (
        <div>
            <label className="labelBefore">Key:</label>
            <select onChange={ changeKey } value={ notationConfig.key }>
                {miscKeyOpts}
                <optgroup label="Major Keys">{majorKeyOpts}</optgroup>
            </select>
        </div>
    );
}
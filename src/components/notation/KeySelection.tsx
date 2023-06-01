
import { MAJOR_KEY_LOOKUP } from "../../datatypes/ComplexTypes";
import { MiscKeys } from "../../datatypes/Configs";
import { useNotationConfig, useNotationConfigDispatch } from "./NotationConfigContext";


export default function KeySelection() {
    const notationConfig = useNotationConfig();
    const notationConfigDispatch = useNotationConfigDispatch();

    const getOption = ([key, val]: [string, string]) => (<option key={key} value={key}>{val}</option>);

    const miscKeyOpts  = Object.entries(MiscKeys)        .map(entry => getOption([entry[1], entry[1]]));
    const majorKeyOpts = Object.entries(MAJOR_KEY_LOOKUP).map(entry => getOption([entry[0], entry[1].toString()]));

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
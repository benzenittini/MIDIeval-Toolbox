
import { MAJOR_KEY_LOOKUP } from "../../datatypes/ComplexTypes";
import { KeyConfigOpts, MiscKeys } from "../../datatypes/Configs";

type Props = {
    currentValue: KeyConfigOpts,
    selectKey: (key: KeyConfigOpts) => void,
};

export default function KeySelection({ currentValue, selectKey }: Props) {
    const getOption = ([key, val]: [string, string]) => (<option key={key} value={key}>{val}</option>);

    const miscKeyOpts  = Object.entries(MiscKeys)        .map(entry => getOption([entry[1], entry[1]]));
    const majorKeyOpts = Object.entries(MAJOR_KEY_LOOKUP).map(entry => getOption([entry[0], entry[1].toString()]));

    function changeKey(event: any) {
        selectKey(event.target.value);
    }

    return (
        <div>
            <label className="labelBefore">Key:</label>
            <select onChange={ changeKey } value={ currentValue }>
                {miscKeyOpts}
                <optgroup label="Major Keys">{majorKeyOpts}</optgroup>
            </select>
        </div>
    );
}
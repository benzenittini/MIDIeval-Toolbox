
import { MAJOR_KEY_LOOKUP } from "../../datatypes/ComplexTypes";
import { KeyConfigOpts, MiscKeys } from "../../datatypes/Configs";

type Props = {
    currentValue: KeyConfigOpts,
    filterKeysById?: (id: string) => boolean,
    selectKey: (key: KeyConfigOpts) => void,
};

export default function KeySelection({ currentValue, filterKeysById = () => true, selectKey }: Props) {
    const getOption = (id: string, display: string) => (<option key={id} value={id}>{display}</option>);

    const miscKeyOpts  = Object.entries(MiscKeys)
        .map(entry => ({ id: entry[1], display: entry[1] }))
        .filter(({id}) => filterKeysById(id))
        .map(entry => getOption(entry.id, entry.display));

    const majorKeyOpts = Object.entries(MAJOR_KEY_LOOKUP)
        .map(entry => ({ id: entry[0], display: entry[1].toString() }))
        .filter(({id}) => filterKeysById(id))
        .map(entry => getOption(entry.id, entry.display));

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
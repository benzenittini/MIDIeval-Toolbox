
import styles from './LabeledSlider.module.css';

type Props = {
    label: string,
    min: number,
    max: number,
    value: number,
    onChange: (val: string) => void,
}

export default function LabeledSlider({ label, min, max, value, onChange }: Props) {
    return (
        <div className={ styles.labeledSlider }>
            <label className="labelBefore">{ label }</label>
            <input type="range" min={ min } max={ max } value={ `${value}` } onChange={ (e) => onChange(e.target.value) }></input>
            <label className={ styles.valueDisplay }>{ value }</label>
        </div>
    );
}
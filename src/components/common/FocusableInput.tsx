
import { useState } from "react";

import styles from './FocusableInput.module.css';

type Props = {
    value: string,
    label: string,
    type?: InputType,
    inputConfigs?: any,
    onChange: (newValue: string) => void,
}

export enum InputType {
    NUMBER = 'number',
    TEXT = 'text',
}

export default function FocusableInput({ value, label, type = InputType.TEXT, inputConfigs = {}, onChange}: Props) {
    const [inEditMode, setInEditMode] = useState(false);

    const timeInput = inEditMode ? (
        <input type={type}
            {...inputConfigs}
            autoFocus
            onFocus={(e) => e.target.select()}
            className={styles.secondsSelector}
            onChange={(e) => onChange(e.target.value)}
            onBlur={() => setInEditMode(false)}
            value={value} />
    ) : (
        <div className={styles.secondsDisplay}
            onClick={() => setInEditMode(true)}>
            {value} {label}
        </div>
    );

    return (
        <>
        {timeInput}
        </>
    );
}
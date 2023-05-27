import { Clef, Key, TimeSignature } from "../../datatypes/Musics";

type Props = {
    clef: Clef,
    musicKey: Key,
    timeSignature: TimeSignature
}

export default function StaffDefinition({ clef, musicKey, timeSignature }: Props) {

    console.log({ clef, musicKey, timeSignature });

    return (
        <svg>
            {/* TODO-ben : Clef icon */}
            {/* TODO-ben : Key signature */}
            {/* TODO-ben : Time signature */}
        </svg>
    );
}

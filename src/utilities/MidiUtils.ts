
import { MidiInput } from "../datatypes/Midi";
import { Note, Octave, PitchClass, RhythmicValue } from "../datatypes/Musics";
import { createNote } from "./MusicUtils";

let midiAccess: MIDIAccess | null = null;
let pressedInputs: MidiInput[] = [];
let changeHandler: (changedInput: MidiInput, pressedInputs: MidiInput[]) => void = () => {};

export function initializeMidiConnection(onSuccess: () => void, onFailure: (err: Error) => void) {
    navigator.requestMIDIAccess()
        .then((access) => {
            midiAccess = access;
            pressedInputs = [];
            if (midiAccess.inputs.size == 0) {
                throw new Error("No MIDI devices detected");
            }
            midiAccess.inputs.forEach((entry) => {
                // TODO-ben : Make sure this doesn't get double-registered.
                entry.onmidimessage = (e: Event) => processMidiEvent(e as MIDIMessageEvent);
            });
            onSuccess();
        }).catch((err: Error) => {
            console.error("MIDI failed to initialize: " + err);
            onFailure(err);
        });
}

export function setChangeHandler(handler: (changedInput: MidiInput, pressedInputs: MidiInput[]) => void) {
    changeHandler = handler;
}
export function clearChangeHandler() {
    changeHandler = () => {};
}

const NOTE_PRESSED_OR_RELEASED = 144;
function processMidiEvent(event: MIDIMessageEvent) {
    let [action, pitch, velocity] = event.data;
    if (action === NOTE_PRESSED_OR_RELEASED) {
        console.log("Processing event: " + JSON.stringify({ action, pitch, velocity })); // TODO-ben : delete
        let changedInput = {
            note: convertToNote(pitch),
            velocity,
            timestampMillis: event.timeStamp
        };
        if (velocity > 0) {
            // Note was pressed
            pressedInputs.push(changedInput);
        } else {
            // Note was released
            let index = pressedInputs.findIndex(i => 
                i.note.pitchClass === changedInput.note.pitchClass &&
                i.note.octave     === changedInput.note.octave);
            if (index !== -1) {
                pressedInputs.splice(index, 1);
            }
        }
        changeHandler(changedInput, pressedInputs);
    } else if (action === 176) {
        // Pedal pressed/released. Pitch is always 64, velocity is 127 or 0.
        // Currently a no-op, but captured here in case we want to incorporate it later.
    }
}

function convertToNote(pitch: number): Note {
    // Middle c gives pitch 60, which has pitchClass 0 and is octave 4.
    const pitchClass = pitch % 12 as PitchClass;
    const octave = Math.floor(pitch / 12) - 1 as Octave;
    return createNote(pitchClass, RhythmicValue.QUARTER, octave);
}
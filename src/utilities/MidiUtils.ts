
import { MidiInput } from "../datatypes/Midi";
import { Note, Octave, PitchClass, RhythmicValue } from "../datatypes/Musics";
import { createNote } from "./MusicUtils";

let midiAccess: MIDIAccess | null = null;
let pressedInputs: MidiInput[] = [];
let changeHandler: (changedInput: MidiInput, pressedInputs: MidiInput[]) => void = () => {};

const midiInputIdsWithEvents: string[] = [];

export function initializeMidiConnection(onSuccess: () => void, onFailure: (err: Error) => void) {
    navigator.requestMIDIAccess()
        .then((access) => {
            midiAccess = access;
            pressedInputs = [];
            if (midiAccess.inputs.size == 0) {
                throw new Error("No MIDI devices detected");
            }
            registerMidiInputs(midiAccess);
            midiAccess.onstatechange = (ev: Event) => registerMidiInputs(midiAccess!);

            onSuccess();
        }).catch((err: Error) => {
            console.error("MIDI failed to initialize: " + err);
            onFailure(err);
        });
}

function registerMidiInputs(midiAccess: MIDIAccess) {
    midiAccess.inputs.forEach((entry) => {
        const id = entry.id;

        let registrationIndex = midiInputIdsWithEvents.indexOf(id);
        let alreadyRegistered = registrationIndex !== -1;

        if (!alreadyRegistered) {
            entry.addEventListener('midimessage', processMidiEvent);
            midiInputIdsWithEvents.push(id);
        }
    });
}

export function setChangeHandler(handler: (changedInput: MidiInput, pressedInputs: MidiInput[]) => void) {
    changeHandler = handler;
}
export function clearChangeHandler() {
    changeHandler = () => {};
}

const NOTE_PRESSED_OR_RELEASED = 144; // My keyboard sends 144 for both presses and releases...
const NOTE_RELEASED = 128;
const PEDAL_PRESSED_OR_RELEASED = 176;

function processMidiEvent(event: Event) {
    let [action, pitch, velocity] = (event as MIDIMessageEvent).data;
    if (action === NOTE_PRESSED_OR_RELEASED || action === NOTE_RELEASED) {
        let changedInput = {
            note: convertToNote(pitch),
            velocity,
            timestampMillis: Date.now(),
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
    } else if (action === PEDAL_PRESSED_OR_RELEASED) {
        // Pedal pressed/released. Pitch is always 64, velocity is 127 or 0.
        // Currently a no-op, but captured here in case we want to incorporate it later.
    } else {
        console.log({ action, pitch, velocity });
    }
}

function convertToNote(pitch: number): Note {
    // Middle c gives pitch 60, which has pitchClass 0 and is octave 4.
    const pitchClass = pitch % 12 as PitchClass;
    const octave = Math.floor(pitch / 12) - 1 as Octave;
    return createNote(pitchClass, RhythmicValue.QUARTER, octave);
}

import { MidiInput } from "../datatypes/Midi";
import { Note, Octave, PitchClass, RhythmicValue } from "../datatypes/Musics";
import { createNote } from "./MusicUtils";

// -- Some MIDI action IDs --
const NOTE_PRESSED_OR_RELEASED = 144; // My keyboard sends 144 for both presses and releases...
const NOTE_RELEASED = 128;
const PEDAL_PRESSED_OR_RELEASED = 176;

/**
 * Sets up the MIDI connection by registering event handlers for all connected MIDI inputs. Calls "onSuccess" when it
 * completes successfully, and "onFailure" (with an error) when it fails. It may fail due to permissions, or if there
 * are no MIDI devices connected.
 */
export function initializeMidiConnection(onSuccess: () => void, onFailure: (err: Error) => void) {
    navigator.requestMIDIAccess()
        .then((midiAccess) => {
            if (midiAccess.inputs.size === 0) {
                throw new Error("No MIDI devices detected");
            }

            pressedInputs = [];
            registerMidiInputs(midiAccess);
            midiAccess.onstatechange = (_: Event) => registerMidiInputs(midiAccess!);

            onSuccess();
        }).catch((err: Error) => {
            console.error("MIDI failed to initialize: " + err);
            onFailure(err);
        });
}


// ==============
// Change Handler
// --------------

/** Gets executed every time a note is pressed or released. */
let changeHandler: (changedInput: MidiInput, pressedInputs: MidiInput[]) => void = () => {};

/**
 * Registers a handler which gets executed every time a note is pressed or released. "changedInput" is the changed
 * note, and "pressedInputs" is an array containing every note currently being pressed.
 */
export function setChangeHandler(handler: (changedInput: MidiInput, pressedInputs: MidiInput[]) => void) {
    changeHandler = handler;
}

/** Clears the currently-registered change handler, if any. */
export function clearChangeHandler() {
    changeHandler = () => {};
}


// =======================
// MIDI Event Registration
// -----------------------

/** A list of all the midi input IDs that are being watched for events. Useful for preventing double-registrations. */
const midiInputIdsWithEvents: string[] = [];

/** Registers an event handler for every MIDI input that doesn't already have an event handler registered. */
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


// ===================
// MIDI Event Handling
// -------------------

/** A list of all the notes currently being pressed. */
let pressedInputs: MidiInput[] = [];

/**
 * Processes a MIDI event by determining the event type and acting appropriately. Mainly, handles MIDI key presses
 * and releases, tracks which notes are actively being pressed, and then calls the currently-registered changeHandler.
 */
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

/**
 * Converts the given MIDI "pitch" to a note. Only the note's pitchClass and octave will have meaning.
 */
function convertToNote(pitch: number): Note {
    // Middle c gives pitch 60, which has pitchClass 0 and is octave 4.
    const pitchClass = pitch % 12 as PitchClass;
    const octave = Math.floor(pitch / 12) - 1 as Octave;
    return createNote(pitchClass, RhythmicValue.QUARTER, octave);
}
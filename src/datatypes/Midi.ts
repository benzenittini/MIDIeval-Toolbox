
import { Note } from "./ComplexTypes";


export type MidiInput = {
    note: Note;
    velocity: number;
    timestampMillis: number;
};
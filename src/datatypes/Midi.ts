import { Note } from "./Musics"

export type MidiInput = {
    note: Note;
    velocity: number;
    timestampMillis: number;
};
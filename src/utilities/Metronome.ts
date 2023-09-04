import { Howl } from 'howler';

import soundUrl from '../assets/Perc_MetronomeQuartz_lo.wav';

class Metronome {

    private howl?: Howl;

    play() {
        if (!this.howl) {
            this.howl = new Howl({ src: [soundUrl] });
        }
        this.howl?.play();
    }
}

export const metronome = new Metronome();
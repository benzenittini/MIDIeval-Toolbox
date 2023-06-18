
...also known as "MIDI Evaluation Toolbox" and "you spelled medieval wrong".

# Introduction

A haiku description:

> MIDIeval Toolbox:<br>
> Chord and sight-reading practice<br>
> ...for MIDI keyboards<br>

The app is accessible here: https://benzenittini.github.io/midieval-toolbox. It works best when using a MIDI keyboard as input, but it's not a requirement. Currently, only "notation practice" is available, but "sight-reading practice" is about half-way done and will (hopefully) be ready in the coming months.


# Contributing

If you find any bugs or want to make a suggestion, feel free to either open up a GitHub issue or email me at [ben@zenittini.dev](mailto:ben@zenittini.dev). If you'd like to try and make the change yourself (or with some guidance), see the below steps for checking out and building the code.

1. Clone the repository:
    ```bash
    git clone git@github.com:benzenittini/midieval-toolbox.git
    ```
1. Create a new branch off of `master` to house your changes:
    ```bash
    git checkout master
    git pull origin master
    git checkout -b MyNewBranch
    ```
1. Install node dependencies:
    ```bash
    npm install
    ```
1. Run the build, watching for changes, and hot-reloading your browser with updates:
    ```bash
    npm run dev
    ```
1. Open your browser to http://localhost:5173
1. Code away!


# Notation Practice

Random chords/notes are displayed on the screen in varying text-based notations. The goal is for you to play the chord/note shown on screen.

## Configuration

When opening "Notation Practice", you'll be greeted with a config page that looks like this:

![Notation Practice Config](/readme-images/NotationPracticeConfig.png)

You can choose which key you want to practice in (if any), whether to practice single notes or chords, which chords, and whether to use "Timed" progression or "MIDI Input" progression.

* **Key:** We currently only support the major keys, but have plans to add minor keys in the future.
* **Chord Selection:** Only available when practicing chords. This is split into triads (3 notes) and sevenths (4 notes). Some chords are not in-key, and will be disabled / unselectable unless your key selection is "Anything Goes".
* There are two modes which control how you go from one chord to the next:
    * **Timed Progression:** After the configured number of seconds passes, the next chord/note is displayed. You do not need to have a MIDI keyboard connected to use this mode.
    * **MIDI Input Progression:** After the you press the correct keys for the chord/note, the next chord/note is displayed. You can play any inversion on any octave, and can include "duplicate notes" if you want to get fancy (ex: playing a perfect octave of the root note on your left hand, and the full chord on your right). If you're using Firefox, you may need to restart your browser for it to detect your MIDI keyboard.

## Practice

Once you press "Begin", you'll see something that looks like this:

![Notation Practice](/readme-images/NotationPractice.png)

Breaking this down:

* The text in the box is the note/chord you should play ("C♭dim" here)
* The blue line underneath is the "progress marker" (counts down for time-based progression, counts up for MIDI-based progression)
* The description of the chord is shown in case this particular notation is new to you

It's worth noting that a single chord quality may have multiple widely-accepted notations, but only one is randomly chosen and displayed.


# Sight-Reading Practice

Sight-reading practice isn't available yet, but will (hopefully) be ready in the coming months. In short, you'll see a scrolling staff of (marginally-cohesive) notes to play along with. There will be a number of configurations to adjust the difficulty, keys, chords, etc.


# Troubleshooting

## *"It can't detect my MIDI keyboard."*

... this can be caused by a pretty big variety of things. As solutions are discovered, please let me know and I'll add them to this list.

* If you're using Firefox, you may need to fully restart your browser after plugging in your MIDI keyboard.
* If you're using Linux, MIDI keyboards aren't as plug-and-play as we might like. You may need to download drivers or make some extra OS configurations. These steps vary OS to OS, and keyboard to keyboard. I'd be happy to help troubleshoot, but may not be to helpful since I don't have the hardware in front of me. If you resolve your issues, please share your steps and I can add them to this list for others :)

## *"It's detecting my keyboard, but keystrokes aren't being properly recorded."*

A MIDI standard exists which defines how keyboards should send their MIDI events. Unfortunately, there seems to be some leeway in how those details are implemented keyboard-to-keyboard. If you have a keyboard that's misbehaving, it should be a quick/easy fix, but will require a code change. The piece of code that processes MIDI events is `processMidiEvent()` inside `MIDIUtils.ts`. I'd recommend adding a log statement near the top of that function that prints the action, pitch, and velocity of the keypress, then try pressing a few keys to see what it prints out and adjust the function as appropriate.
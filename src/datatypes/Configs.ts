
export enum MiscKeyConfigOpts {
    ALL_KEYS = '(All Keys)',
    RANDOM_KEY = '(Random Key)',
}
export enum MajorKeyConfigOpts {
    C_MAJOR = 'C Major',
    CSHARP_MAJOR = 'C# Major',
    D_MAJOR = 'D Major',
    DSHARP_MAJOR = 'D# Major',
    E_MAJOR = 'E Major',
    F_MAJOR = 'F Major',
    FSHARP_MAJOR = 'F# Major',
    G_MAJOR = 'G Major',
    GSHARP_MAJOR = 'G# Major',
    A_MAJOR = 'A Major',
    ASHARP_MAJOR = 'A# Major',
    B_MAJOR = 'B Major',
}
export type KeyConfigOpts = MiscKeyConfigOpts | MajorKeyConfigOpts;

export type NotationConfiguration = {
    key: KeyConfigOpts;
    progressSelector: { type: 'midi' | 'timed', timedDuration: number },
    includeSingleNotes: boolean;
    includeChords: boolean;

    // Triads
    includeTriads: boolean;
    includeMaj3: boolean;
    includeMin3: boolean;
    includeAug3: boolean;
    includeDim3: boolean;

    // Sevenths
    includeSevenths: boolean;
    includeMaj7: boolean;
    includeMin7: boolean;
    includeDom7: boolean;
    includeDim7: boolean;
    includeAug7: boolean;
    includeMinMaj7: boolean;
    includeAugMaj7: boolean;
}
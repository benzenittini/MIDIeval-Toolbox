
import { randInt } from "./NumberUtils";


export function randomItemFrom<T>(arr: T[]): T {
    return arr[randInt(0, arr.length)];
}

export function getPairCombinations<T>(arr: T[]): T[][] {
    if (arr.length <= 1) return [];

    let pairs: T[][] = [];
    for (let x = 0; x < arr.length; x++) {
        for (let y = x+1; y < arr.length; y++) {
            pairs.push([arr[x], arr[y]]);
        }
    }

    return pairs;
}
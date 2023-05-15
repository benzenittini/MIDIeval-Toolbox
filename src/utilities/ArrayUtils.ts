
import { randInt } from "./NumberUtils";


export function randomItemFrom<T>(arr: T[]): T {
    return arr[randInt(0, arr.length)];
}
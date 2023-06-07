import { getPairCombinations } from "./ArrayUtils";

/**
 * @param lower is inclusive
 * @param upper is exclusive
 */
export function randInt(lower: number, upper: number): number {
    return Math.floor(Math.random() * (upper - lower) + lower);
}

export function clamp(num: number, min: number, max: number) {
    return Math.min(Math.max(num, min), max);
}

export function average(nums: number[]): number {
    return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/**
 * Groups the provided numbers into sets of two, calculates the slope of each, then averages those slopes.
 * The "x" distance between two items in the array is always 1.
 */
export function averageSlope(nums: number[]): number {
    // Split into pairs
    const slopes = getPairCombinations(nums)
        // Calculate slopes between each pair. (x distance is always 1)
        .map(([a, b]) => (a - b));

    // Return the average
    return average(slopes);
}
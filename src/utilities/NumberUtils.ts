
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

/**
 * @param lower is inclusive
 * @param upper is exclusive
 */
export function randInt(lower: number, upper: number): number {
    return Math.floor(Math.random() * (upper - lower) + lower);
}
/**
 * Utility functions
 */

/**
 * Coerce the given value into an array.
 * @param {any} x
 * @returns any[]
 */
export function arr(x) {
	return Array.isArray(x) ? x : [x];
}

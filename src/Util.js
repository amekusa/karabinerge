/**
 * Utility
 */
class Util {
	/**
	 * Coerce the given value into an array.
	 * @param {any} x
	 * @returns any[]
	 */
	arr(x) {
		return Array.isArray(x) ? x : [x];
	}
}

export default new Util();
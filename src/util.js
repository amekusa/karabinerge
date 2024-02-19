/**
 * Utility functions
 * @private
 */

export function arr(x) {
	return Array.isArray(x) ? x : [x];
}

export function isEmpty(x) {
	if (Array.isArray(x)) return x.length == 0;
	switch (typeof x) {
	 case 'boolean':
		return false;
	 case 'string':
		return !x;
	 case 'object':
		if (x === null) return true;
		for (let i in x) return false;
	 case 'undefined':
		return true;
	}
	return false;
}

export function clean(x, recurse = 8) {
	if (recurse) {
		if (Array.isArray(x)) {
			let r = [];
			for (let i = 0; i < x.length; i++) {
				let I = clean(x[i], recurse - 1);
				if (!isEmpty(I)) r.push(I);
			}
			return r;
		}
		if (typeof x == 'object') {
			let r = {};
			for (let k in x) {
				let v = clean(x[k], recurse - 1);
				if (!isEmpty(v)) r[k] = v;
			}
			return r;
		}
	}
	return x;
}

/**
 * Merges the 2nd object into the 1st object recursively (deep-merge). The 1st object will be modified.
 * @param {object} x - The 1st object
 * @param {object} y - The 2nd object
 * @param {object} [opts] - Options
 * @param {number} opts.recurse=8 - Recurstion limit. Negative number means unlimited
 * @param {boolean|string} opts.mergeArrays - How to merge arrays
 * - `true`: merge x with y
 * - 'push': push y elements to x
 * - 'concat': concat x and y
 * - other: replace x with y
 * @return {object} The 1st object
 * @author amekusa
 */
export function merge(x, y, opts = {}) {
	if (!('recurse' in opts)) opts.recurse = 8;
	switch (Array.isArray(x) + Array.isArray(y)) {
	 case 0: // no array
		if (opts.recurse && x && y && typeof x == 'object' && typeof y == 'object') {
			opts.recurse--;
			for (let k in y) x[k] = merge(x[k], y[k], opts);
			opts.recurse++;
			return x;
		}
	 case 1: // 1 array
		return y;
	}
	// 2 arrays
	switch (opts.mergeArrays) {
	 case true:
		for (let i = 0; i < y.length; i++) {
			if (!x.includes(y[i])) x.push(y[i]);
		}
		return x;
	 case 'push':
		x.push(...y);
		return x;
	 case 'concat':
		return x.concat(y);
	}
	return y;
}
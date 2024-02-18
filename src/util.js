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
			for (let i in x) {
				let I = clean(x[i], recurse - 1);
				if (!isEmpty(I)) r[i] = I;
			}
			return r;
		}
	}
	return x;
}

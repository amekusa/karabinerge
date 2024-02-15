import dig from 'obj-digger';

class Sanitizer {
	constructor() {
		this.filters = [];
	}
	addFilter(q, fn) {
		this.filters.push({ q: arr(q), fn });
		return this;
	}
	sanitize(obj) {
		for (let f of this.filters) {
			for (let q of f.q) dig(obj, q, { mutate: found => f.fn(found) });
		}
		return obj;
	}
}

export default Sanitizer;
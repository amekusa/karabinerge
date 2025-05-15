import { stdout } from 'node:process';
import fs from 'node:fs';
import { exec as exec$1 } from 'node:child_process';
import os from 'node:os';
import * as fsp from 'node:fs/promises';
import path from 'node:path';
import { Transform } from 'node:stream';
import 'node:assert';

/*!
 * === @amekusa/util.js/web === *
 * MIT License
 *
 * Copyright (c) 2024 Satoshi Soma
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */


const escHTML_map = {
	'&': 'amp',
	'"': 'quot',
	"'": 'apos',
	'<': 'lt',
	'>': 'gt'
};

new RegExp(`["'<>]|(&(?!${Object.values(escHTML_map).join('|')};))`, 'g');

/*!
 * === @amekusa/util.js/time === *
 * MIT License
 *
 * Copyright (c) 2024 Satoshi Soma
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * Coerces the given value into a `Date` object.
 * @param {...any} args - A `Date` object or args to pass to `Date()`
 * @return {Date}
 */
function date(...args) {
	if (!args.length || !args[0]) return new Date();
	if (args[0] instanceof Date) return args[0];
	return new Date(...args);
}

/**
 * Coerces the given value into a number of milliseconds.
 * @param {...args} args - A number or args to pass to `Date()`
 * @return {number} milliseconds
 */
function ms(...args) {
	if (!args.length || !args[0]) return Date.now();
	let x = args[0];
	if (typeof x == 'number') return x;
	if (x instanceof Date) return x.getTime();
	return (new Date(...args)).getTime();
}

/**
 * Adds the given amount of time to a `Date` object.
 * @param {Date} d - Date object to modify
 * @param {number} amount - Millieconds to add
 * @return {Date} modified Date
 */
function addTime(d, amount) {
	d.setTime(d.getTime() + amount);
	return d;
}

/**
 * Subtracts the timezone offset from a `Date` object.
 * @param {Date} d - Date object to modify
 * @return {Date} modified Date
 */
function localize(d) {
	d.setTime(d.getTime() - d.getTimezoneOffset() * 60000);
	return d;
}

/**
 * Quantizes a `Date` object with the given amount of time.
 * @param {Date} d - Date object to modify
 * @param {number} step - Quantization step size
 * @param {string} [method='round'] - `Math` method to apply
 * @return {Date} modified Date
 */
function quantize(d, step, method = 'round') {
	d.setTime(Math[method](d.getTime() / step) * step);
	return d;
}

/**
 * Alias of `quantize(d, step, 'round')`.
 */
function round(d, step) {
	return quantize(d, step, 'round');
}

/**
 * Alias of `quantize(d, step, 'floor')`.
 */
function floor(d, step) {
	return quantize(d, step, 'floor');
}

/**
 * Alias of `quantize(d, step, 'ceil')`.
 */
function ceil(d, step) {
	return quantize(d, step, 'ceil');
}

/**
 * Returns `YYYY`, `MM`, and `DD` representations of a `Date` object.
 * @param {Date} d - Date object
 * @param {string|object} [format]
 * - If omitted, the return value will be an array consists of the three parts.
 * - If a string is passed, the three parts will be joined with the string as a separator.
 * - If an object is passed, the three parts will be assigned as `Y`, `M`, and `D` properties.
 * @return {string|string[]|object}
 */
function ymd(d, format = null) {
	let r = [
		d.getFullYear().toString(),
		(d.getMonth() + 1).toString().padStart(2, '0'),
		d.getDate().toString().padStart(2, '0'),
	];
	if (!format) return r;
	switch (typeof format) {
	case 'string':
		return r.join(format);
	case 'object':
		format.Y = r[0];
		format.M = r[1];
		format.D = r[2];
		return format;
	default:
		throw `invalid type`;
	}
}

/**
 * Returns `hh`, `mm`, and `ss` representations of a `Date` object.
 * @param {Date} d - Date object
 * @param {string|object} [format]
 * - If omited, the return value will be an array consists of the three parts.
 * - If a string is passed, the three parts will be joined with the string as a separator.
 * - If an object is passed, the three parts will be assigned as `h`, `m`, and `s` properties.
 * @return {string|string[]|object}
 */
function hms(d, format = null) {
	let r = [
		d.getHours().toString().padStart(2, '0'),
		d.getMinutes().toString().padStart(2, '0'),
		d.getSeconds().toString().padStart(2, '0'),
	];
	if (!format) return r;
	switch (typeof format) {
	case 'string':
		return r.join(format);
	case 'object':
		format.h = r[0];
		format.m = r[1];
		format.s = r[2];
		return format;
	default:
		throw `invalid type`;
	}
}

/**
 * Returns a string representation of the given `Date` in ISO 9075 format, which is standard for MySQL.
 * @param {Date} d - Date object
 * @return {string} a string like `YYYY-MM-DD hh:mm:ss`
 */
function iso9075(d) {
	return ymd(d, '-') + ' ' + hms(d, ':');
}

var time = /*#__PURE__*/Object.freeze({
__proto__: null,
addTime: addTime,
ceil: ceil,
date: date,
floor: floor,
hms: hms,
iso9075: iso9075,
localize: localize,
ms: ms,
quantize: quantize,
round: round,
ymd: ymd
});

/*!
 * === @amekusa/util.js === *
 * MIT License
 *
 * Copyright (c) 2024 Satoshi Soma
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * Coerces the given value into an array.
 * @param {any} x
 * @return {any[]}
 */
function arr(x) {
	return Array.isArray(x) ? x : [x];
}

/**
 * Returns whether the given value can be considered as "empty".
 * @param {any} x
 * @return {boolean}
 */
function isEmpty(x) {
	if (Array.isArray(x)) return x.length == 0;
	switch (typeof x) {
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

/**
 * Removes "empty" values from the given object or array.
 * @param {object|any[]} x
 * @param {number} recurse - Recursion limit
 * @return {object|any[]} modified `x`
 */
function clean$1(x, recurse = 8) {
	if (recurse) {
		if (Array.isArray(x)) {
			let r = [];
			for (let i = 0; i < x.length; i++) {
				let I = clean$1(x[i], recurse - 1);
				if (!isEmpty(I)) r.push(I);
			}
			return r;
		}
		if (typeof x == 'object') {
			let r = {};
			for (let k in x) {
				let v = clean$1(x[k], recurse - 1);
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
 */
function merge(x, y, opts = {}) {
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

/*!
 * Shell Utils
 * @author amekusa
 */

/**
 * Executes the given shell command, and returns a Promise that resolves the stdout
 * @param {string} cmd
 * @param {object} [opts]
 * @return {Promise}
 */
function exec(cmd, opts = {}) {
	opts = Object.assign({
		dryRun: false,
	}, opts);
	return new Promise((resolve, reject) => {
		if (opts.dryRun) {
			console.log(`[DRYRUN] ${cmd}`);
			return resolve();
		}
		exec$1(cmd, (err, stdout) => {
			return err ? reject(err) : resolve(stdout);
		});
	});
}

/*!
 * I/O Utils
 * @author amekusa
 */

/**
 * Alias of `os.homedir()`.
 * @type {string}
 */
const home = os.homedir();

/**
 * Searchs the given file path in the given directories.
 * @param {string} file - File to find
 * @param {string[]} dirs - Array of directories to search
 * @param {object} [opts] - Options
 * @return {string|boolean} found file path, or false if not found
 */
function find(file, dirs = [], opts = {}) {
	let {allowAbsolute = true} = opts;
	if (allowAbsolute && path.isAbsolute(file)) return fs.existsSync(file) ? file : false;
	for (let i = 0; i < dirs.length; i++) {
		let find = path.join(dirs[i], file);
		if (fs.existsSync(find)) return find;
	}
	return false;
}

/**
 * Replaces the beginning `~` character with `os.homedir()`.
 * @param {string} file - File path
 * @param {string} [replace=os.homedir()] - Replacement
 * @return {string} modified `file`
 */
function untilde(file, replace = home) {
	if (!file.startsWith('~')) return file;
	if (file.length == 1) return replace;
	if (file.startsWith(path.sep, 1)) return replace + file.substring(1);
	return file;
}

/**
 * Deletes the contents of the given directory.
 * @return {Promise}
 */
function clean(dir, pattern, depth = 1) {
	return exec(`find '${dir}' -type f -name '${pattern}' -maxdepth ${depth} -delete`);
}

/**
 * Deletes the given file or directory.
 * @param {string} file
 * @return {Promise}
 */
function rm(file) {
	return fsp.rm(file, {recursive: true, force: true});
}

/**
 * Deletes the given file or directory synchronously.
 * @param {string} file
 */
function rmSync(file) {
	return fs.rmSync(file, {recursive: true, force: true});
}

/**
 * Copies the given file(s) to another directory
 * @param {string|object|string[]|object[]} src
 * @param {string} dst Base destination directory
 * @return {Promise}
 */
function copy(src, dst) {
	return Promise.all((Array.isArray(src) ? src : [src]).map(item => {
		let _src, _dst;
		switch (typeof item) {
		case 'object':
			_src = item.src;
			_dst = item.dst;
			break;
		case 'string':
			_src = item;
			break;
		default:
			throw 'invalid type';
		}
		_dst = path.join(dst, _dst || path.basename(_src));
		return fsp.mkdir(path.dirname(_dst), {recursive: true}).then(fsp.copyFile(_src, _dst));
	}));
}

/**
 * Returns a Transform stream object with the given function as its transform() method.
 * `fn` must return a string which is to be the new content, or a Promise which resolves a string.
 *
 * @example
 * return gulp.src(src)
 *   .pipe(modify((data, enc) => {
 *     // do stuff
 *     return newData;
 *   }));
 *
 * @param {function} fn
 * @return {Transform}
 */
function modifyStream(fn) {
	return new Transform({
		objectMode: true,
		transform(file, enc, done) {
			let r = fn(file.contents.toString(enc), enc);
			if (r instanceof Promise) {
				r.then(modified => {
					file.contents = Buffer.from(modified, enc);
					this.push(file);
					done();
				});
			} else {
				file.contents = Buffer.from(r, enc);
				this.push(file);
				done();
			}
		}
	});
}

var io = /*#__PURE__*/Object.freeze({
__proto__: null,
clean: clean,
copy: copy,
find: find,
home: home,
modifyStream: modifyStream,
rm: rm,
rmSync: rmSync,
untilde: untilde
});

/**
 * File I/O manager.
 */
class IO {
	/**
	 * @param {string} file - File to read/write
	 * @param {object} [opts] - Options
	 * @param {boolean} [opts.backup=true] - Whether to create a backup before overwrite
	 * @param {string} [opts.backupExt='.bak'] - Backup file extension
	 */
	constructor(file, opts = {}) {
		this.opts = Object.assign({
			encoding: 'utf8',
			backup: true,
			backupExt: '.bak',
		}, opts);
		this.file;
		if (file) this.setFile(file);
	}
	/**
	 * Sets the file to {@link IO#load} and {@link IO#save}.
	 * @param {string} file - File path
	 * @return {IO} Itself
	 */
	setFile(file) {
		this.file = io.untilde(file);
		return this;
	}
	/**
	 * Reads the data from the file.
	 * @param {object} [opts] - Option to pass to `fs.readFileSync()`
	 * @return {string} Data
	 */
	read(opts = {}) {
		return fs.readFileSync(this.file, Object.assign({encoding: this.opts.encoding}, opts));
	}
	/**
	 * Writes the given data on the file.
	 * If `options.backup` is `true`, creats a backup before overwrite.
	 * @param {string} data - Data to write
	 * @param {object} [opts] - Option to pass to `fs.writeFileSync()`
	 * @return {IO} Itself
	 */
	write(data, opts = {}) {
		if (this.opts.backup && fs.existsSync(this.file)) {
			let now = Date.now();
			let backup = this.file + '.'
				+ time.ymd(now, '-') + '.'
				+ time.hms(now, '') +
				+ this.opts.backupExt;
			fs.copyFileSync(this.file, backup);
		}
		fs.writeFileSync(this.file, data, Object.assign({encoding: this.opts.encoding}, opts));
		return this;
	}
}

/*!
 *  obj-digger
 * ------------ -
 *  Safely access properties of deeply nested objects
 *  @author Satoshi Soma (https://amekusa.com)
 * =================================================== *
 *
 *  MIT License
 *
 *  Copyright (c) 2022 Satoshi Soma
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all
 *  copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *  SOFTWARE.
 *
 */

function error(throws, name, info) {
	if (!throws) return {name, info};
	let msg = '';
	switch (name) {
	case 'InvalidArgument':
		msg = `argument is not diggable`;
		break;
	case 'NoSuchKey':
		msg = `property '${info.key}' is not found`;
		break;
	case 'TypeMismatch':
		msg = `unexpected type of value`;
		break;
	}
	let e = new Error(msg);
	e.name = name;
	e.info = info;
	throw e;
}

function isDiggable(x) {
	switch (typeof x) {
	case 'object':
	case 'function':
		return true;
	}
	return false;
}

function modify(obj, key, opts) {
	if ('set' in opts) obj[key] = opts.set;
	if (opts.mutate) obj[key] = opts.mutate(obj[key]);
	return obj;
}

function pushStack(stack, data) {
	data.prev = stack[stack.length - 1];
	data.prev.next = data;
	stack.push(data);
}

function _has(obj, key) {
	return key in obj;
}

/**
 * @param {object} obj - Object to dig into
 * @param {string|string[]} path - Sequence of property-keys to go through
 * @param {object} [opts] - Options
 * @return {object} the result
 */
function dig(obj, path, opts = {}) {
	if (!isDiggable(obj)) return {err: error(opts.throw, 'InvalidArgument', {value: obj})};
	if (!Array.isArray(path)) path = path.split('.');
	if (!path.length) return obj;
	return _dig(obj, path, opts);
}

function _dig(obj, path, opts) {
	let r = opts.stack ? {stack: [{value: obj}]} : {};
	let last = path.length - 1;
	let has = opts.has || _has;
	for (let i = 0;; i++) {
		let p = path[i]; // pick up a crumb

		if (p == '*') { // Path: Wildcard
			r.found = {};
			let keys = Object.keys(obj);
			if (i == last) {
				// wildcard destination; add every property to results
				for (let j = 0; j < keys.length; j++) {
					modify(obj, keys[j], opts);
					r.found[keys[j]] = obj[keys[j]];
				}
			} else {
				// wildcard branching; dig every property one by one
				path = path.slice(i + 1); // remaining crumbs to pick up
				for (let j = 0; j < keys.length; j++) {
					if (isDiggable(obj[keys[j]])) {
						let dug = _dig(obj[keys[j]], path, opts); // recursion
						if (!dug.err) r.found[keys[j]] = dug;
					}
				}
			}
			r.results = r.found; // @deprecated alias of 'found'
			return r;
		}

		if (p.endsWith('[]')) { // Path: Array
			p = p.substring(0, p.length - 2);
			if (has(obj, p)) {
				obj = obj[p];
				if (!Array.isArray(obj)) { // not an array
					r.err = error(opts.throw, 'TypeMismatch', {
						key: p,
						value: obj,
						expectedType: 'Array'
					});
					return r;
				}
				r.found = [];
				if (i == last) {
					// array destination; add every element to results
					for (let j = 0; j < obj.length; j++) {
						modify(obj, j, opts);
						r.found.push(obj[j]);
					}
				} else {
					// array branching; dig every element
					if (r.stack) pushStack(r.stack, {key: p, value: obj});
					path = path.slice(i + 1); // remaining crumbs to pick up
					for (let j = 0; j < obj.length; j++) {
						if (isDiggable(obj[j])) {
							let dug = _dig(obj[j], path, opts); // recursion
							if (!dug.err) r.found.push(dug);
						}
					}
				}
				r.results = r.found; // @deprecated alias of 'found'
				return r;
			}
			// path not found
			r.err = error(opts.throw, 'NoSuchKey', {key: p});
			return r;
		}

		if (has(obj, p)) { // Path Found
			if (i == last) { // destination
				modify(obj, p, opts);
				r.key   = p;
				r.value = obj[p];
				return r;
			}
			if (isDiggable(obj[p])) { // dig
				obj = obj[p];
				if (r.stack) pushStack(r.stack, {key: p, value: obj});

			} else { // not diggable
				r.err = error(opts.throw, 'TypeMismatch', {
					key: p,
					value: obj[p],
					expectedType: 'object'
				});
				return r;
			}

		} else if (opts.makePath) { // Make Path
			for (;; i++) {
				p = path[i];
				if (i == last) { // destination
					obj[p] = undefined;
					modify(obj, p, opts);
					r.key   = p;
					r.value = obj[p];
					return r;
				}
				// make the rest of the path
				obj[p] = (opts.makePath === true) ? {} : opts.makePath(obj, p, i);
				obj = obj[p];
				if (r.stack) pushStack(r.stack, {key: p, value: obj});
			}

		} else { // Path Not Found
			r.err = error(opts.throw, 'NoSuchKey', {key: p});
			return r;
		}
	}
}

/**
 * Object sanitizer
 */
class Sanitizer {
	constructor() {
		this.filters = [];
	}
	addFilter(q, fn) {
		this.filters.push({q: arr(q), fn});
		return this;
	}
	sanitize(obj) {
		for (let f of this.filters) {
			for (let q of f.q) dig(obj, q, {mutate: found => f.fn(found)});
		}
		return obj;
	}
}

/**
 * Returns an object with `key_code` property,
 * which can be passed to {@link Rule#remap} as `from` or `to` properties.
 * @param {string|string[]|array[]} code - key code(s)
 * @param {string|object|string[]} mods - modifiers
 * @param {object} [opts] - optional properties
 * @return {object} an object like: `{ key_code: ... }`
 */
function key(code, mods = null, opts = null) {
	if (Array.isArray(code)) {
		let r = [];
		for (let i = 0; i < code.length; i++) {
			let I = code[i];
			if (Array.isArray(I)) {
				r.push(key(
					I[0],
					I.length > 1 ? I[1] : mods,
					I.length > 2 ? I[2] : opts
				));
				continue;
			}
			r.push(key(I, mods, opts));
		}
		return r;
	}

	let _mods = {
		mandatory: [],
		optional: []
	};

	function addModifier(mod) {
		mod = mod.trim();
		let m = mod.match(/^\((.+?)\)$/); // is '(optional-key)' ?
		if (m) _mods.optional.push(m[1]);
		else _mods.mandatory.push(mod);
	}

	// parse 'modifier + keycode' expression
	code = (code + '').split('+');
	for (let i = 0; i < code.length - 1; i++) addModifier(code[i]);
	code = code[code.length - 1].trim();

	// parse modifiers
	if (mods) {
		switch (typeof mods) {
		case 'string':
			mods.split('+').forEach(addModifier);
			break;
		case 'object':
			if (Array.isArray(mods)) mods.forEach(addModifier);
			else {
				if (mods.mandatory) _mods.mandatory = _mods.mandatory.concat(arr(mods.mandatory));
				if (mods.optional) _mods.optional = _mods.optional.concat(arr(mods.optional));
			}
		}
	}

	// format & return
	let r = {key_code: code};
	if (!isEmpty(_mods.optional)) r.modifiers = {optional: _mods.optional};
	if (!isEmpty(_mods.mandatory)) {
		if (r.modifiers) r.modifiers.mandatory = _mods.mandatory;
		else r.modifiers = _mods.mandatory;
	}
	return opts ? merge(r, opts, {mergeArrays: true}) : r;
}

/**
 * Returns an object with `pointing_button` property, which can be passed to {@link Rule#remap} as `from` or `to` properties.
 * @param {string} btn - button name
 * - `button1`
 * - `button2`
 * - `button3`
 * - `left` (alias for `button1`)
 * - `right` (alias for `button2`)
 * - `middle` (alias for `button3`)
 * @return {object} an object like: `{ pointing_button: ... }`
 */
function click(btn) {
	let btns = {
		left: 'button1',
		right: 'button2',
		middle: 'button3'
	};
	return {
		pointing_button: btn in btns ? btns[btn] : btn
	};
}

/**
 * Returns an object with `set_variable` property, which can be passed to {@link Rule#remap} as `to` property.
 * @param {string} name - variable name
 * @param {string|number} value - value to assign
 * @param {object} [opts] - optional properties
 * @return {object} an object like: `{ set_variable: { ... } }`
 */
function set_var(name, value, opts = null) {
	let r = {
		set_variable: {
			name: name,
			value: value
		}
	};
	return opts ? Object.assign(r, opts) : r;
}

/**
 * Returns an object with `type: 'variable_if'` property, which can be passed to {@link Rule#cond} as a condition.
 * @param {string} name - variable name
 * @param {string|number} value - value to check
 * @return {object} an object like: `{ type: 'variable_if', ... }`
 */
function if_var(name, value) {
	return {
		type: 'variable_if',
		name: name,
		value: value
	};
}

/**
 * Returns an object with `type: 'variable_unless'` property, which can be passed to {@link Rule#cond} as a condition.
 * @param {string} name - variable name
 * @param {string|number} value - value to check
 * @return {object} an object like: `{ type: 'variable_unless', ... }`
 */
function unless_var(name, value) {
	return {
		type: 'variable_unless',
		name: name,
		value: value
	};
}

/**
 * Returns an object with `type: 'frontmost_application_if'` property, which can be passed to {@link Rule#cond} as a condition.
 * @param {...string} id - application id
 * @return {object} an object like: `{ type: 'frontmost_application_if', ... }`
 */
function if_app(...id) {
	return {
		type: 'frontmost_application_if',
		bundle_identifiers: id
	};
}

/**
 * Returns an object with `type: 'frontmost_application_unless'` property, which can be passed to {@link Rule#cond} as a condition.
 * @param {...string} id - application id
 * @return {object} an object like: `{ type: 'frontmost_application_unless', ... }`
 */
function unless_app(...id) {
	return {
		type: 'frontmost_application_unless',
		bundle_identifiers: id
	};
}

/**
 * Returns an object with `type: 'input_source_if'` property, which can be passed to {@link Rule#cond} as a condition.
 * @param {...string} lang - language code
 * @return {object} an object like: `{ type: 'input_source_if', ... }`
 */
function if_lang(...lang) {
	return {
		type: 'input_source_if',
		input_sources: lang.map(item => {
			return {language: item};
		})
	};
}

/**
 * Returns an object with `type: 'input_source_unless'` property, which can be passed to {@link Rule#cond} as a condition.
 * @param {...string} lang - language code
 * @return {object} an object like: `{ type: 'input_source_unless', ... }`
 */
function unless_lang(...lang) {
	return {
		type: 'input_source_unless',
		input_sources: lang.map(item => {
			return {language: item};
		})
	};
}

/**
 * @typedef {object|string} Keymap
 * A keymap definition which can be passed to {@link Rule#remap} as `from` or `to` properties.
 * It can be an object like `{ key_code: 'a', ... }`, or a string in the special format.
 *
 * #### Object Format
 * A plain object that loosely follows [the Karabiner's specifications](https://karabiner-elements.pqrs.org/docs/json/complex-modifications-manipulator-definition/from/).
 * {@link key} function returns in this format.
 *
 * #### String Format
 * A special expression that is only supported by Karabinerge for user's convenience.
 * Here are some examples:
 *
 * | Expression | Meaning |
 * |:-----------|:--------|
 * | `'a'` | `a` key |
 * | `'shift + a'` | `a` key with `shift` modifier |
 * | `'shift + control + a'` | `a` key with `shift` + `control` modifiers |
 * | `'shift + (control) + a'` | `a` key with `shift` + optional `control` modifiers |
 *
 **/

/**
 * A complex modification rule
 */
class Rule {
	/**
	 * Instantiates a {@link Rule} from the given JSON string or object.
	 * @param {string|object} data - JSON string or object
	 * @return {Rule} new instance
	 */
	static fromJSON(data) {
		switch (typeof data) {
		case 'object':
			break;
		case 'string':
			data = JSON.parse(data);
			break;
		default:
			throw `invalid argument`;
		}
		let r = new this(data.description);
		if (data.manipulators) r.remaps = arr(data.manipulators);
		return r;
	}
	/**
	 * @param {string} desc - rule description
	 */
	constructor(desc) {
		/**
		 * Rule description.
		 * @type {string}
		 */
		this.desc = desc || '';
		/**
		 * Remap definitions.
		 * @type {object[]}
		 */
		this.remaps = [];
		/**
		 * Remap conditions.
		 * @type {object[]}
		 */
		this.conds = [];
	}
	/**
	 * Defines a `from-to` remap rule
	 * @param {object} map - Rule definition like: `{ from: ... , to: ... }`
	 * @param {Keymap} map.from - An object like `{ key_code: 'a' }`, or a string of the special expression. (See {@link Keymap})
	 * @param {Keymap|Keymap[]} map.to - An object like `{ key_code: 'a' }`, or a string of the special expression. Also can be an array for multiple keymaps. (See {@link Keymap})
	 * @param {any} map.* - Any property that Karabiner supports for [manipulator](https://karabiner-elements.pqrs.org/docs/json/complex-modifications-manipulator-definition/)
	 * @return {Rule} itself
	 * @example <caption>Remap control + H to backspace</caption>
	 * let rule = new Rule('control + H to backspace')
	 *   .remap({
	 *     from: key('h', 'control'),
	 *     to:   key('delete_or_backspace')
	 *   });
	 * @example <caption>Multiple remap rules</caption>
	 * let rule = new Rule('Various Remaps')
	 *   .remap( ... )
	 *   .remap( ... )
	 *   .remap( ... );
	 */
	remap(map) {
		if (!map.type) map.type = 'basic';
		if (this.conds.length) map = Object.assign(map, {conditions: this.conds});
		map = clean$1(remapSanitizer.sanitize(map));
		if (isEmpty(map)) console.warn(`Rule.remap: empty argument`);
		else this.remaps.push(map);
		return this;
	}
	/**
	 * Defines a condition
	 * @param {object} cond - condition definition like: `{ type: 'variable_if', ... }`
	 * @return {Rule} this
	 * @example <caption>Remap rules only for VSCode</caption>
	 * let rule = new Rule('VSCode Rules')
	 *   .cond(if_app('com.microsoft.VSCode'))
	 *   .remap( ... )
	 *   .remap( ... );
	 * @example <caption>Multiple conditions</caption>
	 * let rule = new Rule('VSCode Rules')
	 *   .cond(if_var('foo', 1))  // if variable 'foo' is 1
	 *   .cond(if_app('com.microsoft.VSCode'))
	 *   .remap( ... )
	 *   .remap( ... );
	 */
	cond(cond) {
		cond = clean$1(cond);
		if (isEmpty(cond)) console.warn(`Rule.cond: empty argument`);
		else this.conds.push(cond);
		return this;
	}
	/**
	 * Returns a plain object representation of this rule
	 * @return {object} an object like: `{ description: ... , manipulators: ... }`
	 */
	toJSON() {
		return {
			description: this.desc,
			manipulators: this.remaps
		};
	}
}

const remapSanitizer = new Sanitizer()
	.addFilter([
		'from',
		'to',
		'to[]',
	], prop => {
		if (typeof prop == 'string') return key(prop);
		return prop;
	})
	.addFilter('from.modifiers', prop => {
		if (Array.isArray(prop)) return {mandatory: prop};
		switch (typeof prop) {
		case 'string':
			return {mandatory: [prop]};
		}
		return prop;
	})
	.addFilter([
		'from.modifiers.mandatory',
		'from.modifiers.optional',
		'to',
		'to[].modifiers',
		'to_if_alone',
		'to_if_held_down',
		'to_after_key_up',
		'to_delayed_action.to_if_invoked',
		'to_delayed_action.to_if_canceled'
	], prop => {
		return arr(prop);
	});

/**
 * A collection of one or more modification rules.
 *
 * @example // Create a new RuleSet
 * let rules = new RuleSet('My Rules');
 *
 */
class RuleSet {
	/**
	 * Instantiates RuleSet from a JSON string or object.
	 * @param {string|object} data - JSON string or object
	 * @return {RuleSet} New instance
	 */
	static fromJSON(data) {
		return new this().loadJSON(data);
	}
	/**
	 * Instantiates RuleSet from a JSON file.
	 * Ruleset files are normally located at `~/.config/karabiner/complex_modifications/*.json`.
	 * @param {string} file - JSON file path
	 * @param {object} [opts] - IO options
	 * @return {RuleSet} New instance
	 */
	static fromFile(file, opts = {}) {
		return new this().setIO(file, opts).load();
	}
	/**
	 * @param {string} title - Title of this ruleset
	 */
	constructor(title) {
		/**
		 * Title of this RuleSet, which is recognized by Karabiner.
		 * @type {string}
		 */
		this.title = title || '';
		/**
		 * Added rules.
		 * @type {Rule[]}
		 */
		this.rules = [];
		/**
		 * IO object for reading/writing this ruleset from/to a file.
		 * @type {IO}
		 */
		this.io;
	}
	/**
	 * Returns a JSON representation of this ruleset.
	 * @param {boolean} [stringify=false] - If `true`, returns a stringified result
	 * @return {object|string} An object like: `{ title: ... , rules: ... }`
	 * @example
	 * let rules = new RuleSet('My Rules');
	 * let obj = rules.toJSON();
	 * console.log( obj.title ); // 'My Rules'
	 */
	toJSON(stringify = false) {
		let r = {
			title: this.title,
			rules: this.rules.map(item => item.toJSON())
		};
		return stringify ? JSON.stringify(r, null, 2) : r;
	}
	/**
	 * Outputs JSON representation of this ruleset to STDOUT.
	 */
	out() {
		stdout.write(this.toJSON(true));
	}
	/**
	 * Setup {@link IO} object for reading/writing this ruleset from/to a file.
	 * Ruleset files are normally located at `~/.config/karabiner/complex_modifications/*.json`.
	 * @param {string} file - Ruleset file path
	 * @param {object} [opts] - IO options
	 * @return {RuleSet} Itself
	 */
	setIO(file, opts = {}) {
		this.io = new IO(file, opts);
		return this;
	}
	/**
	 * Adds an rule to this ruleset.
	 * If the provided argument is a string, a new instance of {@link Rule} will be created with the string as its description.
	 * If the provided argument is an instance of {@link Rule}, simply adds it to the collection.
	 * @param {string|Rule} rule - rule description or an instance of {@link Rule}
	 * @return {Rule} added rule
	 * @example <caption>Adding a new rule with description</caption>
	 * let rule = rules.add('My 1st rule');
	 * @example <caption>Adding a rule instance</caption>
	 * let rule = rules.add(new Rule('My 1st rule'));
	 */
	add(rule) {
		if (!(rule instanceof Rule)) rule = new Rule(rule);
		this.rules.push(rule);
		return rule;
	}
	/**
	 * Loads JSON data.
	 * @param {string|object} data - JSON string or object
	 * @return {RuleSet} Itself
	 */
	loadJSON(data) {
		data = (typeof data == 'string') ? JSON.parse(data) : data;
		this.title = data.title || '';
		if (Array.isArray(data.rules)) { // add rules
			for (let i = 0; i < data.rules.length; i++) this.add(Rule.fromJSON(data.rules[i]));
		}
		return this;
	}
	/**
	 * Loads data from the ruleset file.
	 * @return {RuleSet} Itself
	 */
	load() {
		if (!this.io) throw `io is not set`;
		this.loadJSON(this.io.read());
		return this;
	}
	/**
	 * Saves this ruleset to the given file in JSON format.
	 * @return {RuleSet} Itself
	 */
	save() {
		if (!this.io) throw `io is not set`;
		this.io.write(this.toJSON(true));
		return this;
	}
}

/**
 * User configuration of Karabiner-Elements.
 */
class Config {
	/**
	 * Instantiates Config from a JSON string or object.
	 * @param {string|object} data - JSON string or object
	 * @return {Config} New instance
	 */
	static fromJSON(data) {
		return new this().loadJSON(data);
	}
	/**
	 * Instantiates Config from a JSON file.
	 * Config file is normally located at `~/.config/karabiner/karabiner.json`
	 * @param {string} file - JSON file path
	 * @param {object} [opts] - IO options
	 * @return {Config} New instance
	 */
	static fromFile(file, opts = {}) {
		return new this().setIO(file, opts).load();
	}
	constructor() {
		/**
		 * Config data
		 * @type {object}
		 */
		this.data;
		/**
		 * IO object for reading/writing this config from/to a file.
		 * @type {IO}
		 */
		this.io;
	}
	/**
	 * Returns a JSON representation of this config.
	 * @param {boolean} [stringify=false] - If `true`, returns a stringified result
	 * @return {object|string} A JSON object
	 */
	toJSON(stringify = false) {
		let r = this.data;
		return stringify ? JSON.stringify(r, null, 4) : r;
	}
	/**
	 * Outputs JSON representation of this config to STDOUT.
	 */
	out() {
		stdout.write(this.toJSON(true));
	}
	/**
	 * Setup {@link IO} object for reading/writing this config from/to a file.
	 * @param {string} [file='~/.config/karabiner/karabiner.json'] - Config file path
	 * @param {object} [opts] - IO options
	 * @return {Config} Itself
	 */
	setIO(file = null, opts = {}) {
		this.io = new IO(file || path.join(io.home, '.config', 'karabiner', 'karabiner.json'), opts);
		return this;
	}
	/**
	 * Loads JSON data.
	 * @param {string|object} data - JSON string or object
	 * @return {Config} Itself
	 */
	loadJSON(data) {
		this.data = (typeof data == 'string') ? JSON.parse(data) : data;
		return this;
	}
	/**
	 * Loads data from the config file.
	 * @return {Config} Itself
	 */
	load() {
		if (!this.io) throw `io is not set`;
		return this.loadJSON(this.io.read());
	}
	/**
	 * Writes the current data on the config file.
	 * @return {Config} Itself
	 */
	save() {
		if (!this.io) throw `io is not set`;
		this.io.write(this.toJSON(true));
		return this;
	}
	/**
	 * The current profile object.
	 * @type {object}
	 */
	get currentProfile() {
		if (!this.data) this.load();
		let profs = this.data.profiles;
		if (!profs.length) throw `no profiles`;
		for (let i = 0; i < profs.length; i++) {
			if (profs[i].selected) return profs[i];
		}
		throw `no active profile`;
	}
	/**
	 * Switches to the specified profile.
	 * @param {number|string|RegExp} prof - Profile index, name, or regex for name
	 * @return {Config} Itself
	 */
	selectProfile(prof) {
		let curr = this.currentProfile;
		let profs = this.data.profiles;
		switch (typeof prof) {
		case 'number': // by index
			if (!profs[prof]) throw `index out of bounds`;
			curr.selected = false;
			profs[prof].selected = true;
			break;
		case 'string': // by name
			for (let i = 0; i < profs.length; i++) {
				if (profs[i].name == prof) {
					curr.selected = false;
					profs[i].selected = true;
					break;
				}
			}
			break;
		case 'object': // by regex
			if (!(prof instanceof RegExp)) throw `invalid argument`;
			for (let i = 0; i < profs.length; i++) {
				if (profs[i].name.match(prof)) {
					curr.selected = false;
					profs[i].selected = true;
					break;
				}
			}
			break;
		default:
			throw `invalid argument`;
		}
		return this;
	}
	/**
	 * Clears all the rules in the current profile.
	 * @return {Config} Itself
	 */
	clearRules() {
		return this.setRules([]);
	}
	/**
	 * Sets the given rules to the current profile.
	 * @param {object[]|Rule[]} rules - An array of rule definitions
	 * @return {Config} Itself
	 */
	setRules(rules) {
		dig(this.currentProfile, 'complex_modifications.rules', {
			set: rules.map(rule => (rule instanceof Rule) ? rule.toJSON() : rule),
			makePath: true,
			throw: true
		});
		return this;
	}
}

export { Config, Rule, RuleSet, click, if_app, if_lang, if_var, key, set_var, unless_app, unless_lang, unless_var };

'use strict';

var os = require('node:os');
var fs = require('node:fs');
var path = require('node:path');

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
function clean(x, recurse = 8) {
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
 *  obj-digger
 * ------------ ---- -  *
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

function isDiggable(x) {
	switch (typeof x) {
	case 'object':
	case 'function':
		return true;
	}
	return false;
}

function error(throws, msg, name, info) {
	let r = new Error(msg);
	if (name) r.name = name;
	if (info) r.info = info;
	if (throws) throw r;
	return r;
}

function dig(obj, path, opts = {}) {
	let r = { path: [] };
	if (!isDiggable(obj)) {
		r.err = error(opts.throw, `argument is not diggable`, 'InvalidArgument', { value: obj });
		return r;
	}
	let p = Array.isArray(path) ? path : path.split('.');
	r.path.push(obj);

	for (let i = 0;; i++) {
		let iP = p[i];

		if (iP == '*') { // wildcard
			r.results = [];
			let pRest = p.slice(i + 1);
			let keys = Object.keys(obj);
			for (let j = 0; j < keys.length; j++) {
				if (isDiggable(obj[keys[j]])) r.results.push(dig(obj[keys[j]], pRest, opts)); // recursion
			}
			return r;
		}

		if (iP.endsWith('[]')) { // array access
			iP = iP.substring(0, iP.length - 2);
			if (iP in obj) {
				if (!Array.isArray(obj[iP])) { // not an array
					r.err = error(opts.throw, `property '${iP}' is not an array`, 'TypeMismatch', {
						path: r.path,
						key: iP, value: obj[iP],
						expectedType: 'Array'
					});
					return r;
				}
				// dig each elements in the array
				r.path.push(obj[iP]);
				r.results = [];
				let pRest = p.slice(i + 1);
				for (let j = 0; j < obj[iP].length; j++) {
					if (isDiggable(obj[iP][j])) r.results.push(dig(obj[iP][j], pRest, opts)); // recursion
				}
				return r;
			}
			// path not found
			r.err = error(opts.throw, `property '${iP}' is not found`, 'NoSuchKey', {
				path: r.path,
				key: iP
			});
			return r;
		}

		if (iP in obj) { // path found
			if (i == p.length - 1) { // destination
				if ('set'    in opts) obj[iP] = opts.set;
				if ('mutate' in opts) obj[iP] = opts.mutate(obj[iP]);
				r.found = obj[iP];
				return r;
			}
			if (isDiggable(obj[iP])) { // dig
				obj = obj[iP];
				r.path.push(obj);

			} else { // not diggable
				r.err = error(opts.throw, `property '${iP}' is not an object`, 'TypeMismatch', {
					path: r.path,
					key: iP, value: obj[iP],
					expectedType: 'object'
				});
				return r;
			}

		} else if (opts.makePath) { // make path
			for (;; i++) {
				iP = p[i];
				if (i == p.length - 1) { // destination
					obj[iP] = ('set' in opts) ? opts.set : opts.default;
					if ('mutate' in opts) obj[iP] = opts.mutate(obj[iP]);
					r.found = obj[iP];
					return r;
				}
				// make the rest of the path
				obj[iP] = (opts.makePath === true) ? {} : opts.makePath(obj, iP, i);
				obj = obj[iP];
				r.path.push(obj);
			}

		} else { // path not found
			r.err = error(opts.throw, `property '${iP}' is not found`, 'NoSuchKey', {
				path: r.path,
				key: iP
			});
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

/**
 * A complex modification rule
 */
class Rule {
	/**
	 * @param {string} desc - rule description
	 */
	constructor(desc) {
		this.desc = desc;
		this.remaps = [];
		this.conds = [];
	}
	/**
	 * Defines a `from-to` remap rule
	 * @param {object} map - rule definition like: `{ from: ... , to: ... }`
	 * @return {Rule} this
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
		if (this.conds.length) map = Object.assign(map, { conditions: this.conds });
		map = clean(remapSanitizer.sanitize(map));
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
		cond = clean(cond);
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
	.addFilter('from.modifiers', prop => {
		if (Array.isArray(prop)) return { mandatory: prop };
		switch (typeof prop) {
		case 'string':
			return { mandatory: [prop] };
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
 * A collection of one or more modification rules
 *
 * @example
 * let rules = new RuleSet('My Rules');
 */
class RuleSet {
	/**
	 * @param {string} title - title of this ruleset
	 */
	constructor(title) {
		this.title = title;
		this.rules = [];
	}
	/**
	 * Adds an rule to this ruleset.
	 * If the provided argument is a string, a new instance of {@link Rule} will be created with the string as its description.
	 * If the provided argument is an instance of {@link Rule}, simply adds it to the collection
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
	 * Returns a plain object representation of this ruleset
	 * @return {object} an object like: `{ title: ... , rules: ... }`
	 * @example
	 * let rules = new RuleSet('My Rules');
	 * let obj = rules.toJSON();
	 * console.log( obj.title ); // 'My Rules'
	 */
	toJSON() {
		return {
			title: this.title,
			rules: this.rules.map(item => item.toJSON())
		};
	}
	/**
	 * Outputs JSON representation of the whole rule set to STDOUT
	 */
	out() {
		console.log(JSON.stringify(this, null, 2));
	}
}

/**
 * User configuration of Karabiner-Elements
 */
class Config {
	static new(...args) {
		return new this(...args);
	}
	/**
	 * @param {string} [file='~/.config/karabiner/karabiner.json'] - config file to read/write
	 */
	constructor(file = null) {
		this.setFile(file || path.join(os.homedir(), '.config', 'karabiner', 'karabiner.json'));
		this.data = null;
	}
	/**
	 * Sets the config file path
	 * @param {string} file - config file path
	 * @return {Config} this
	 */
	setFile(file) {
		this.file = file;
		return this;
	}
	/**
	 * Reads data from the config file
	 * @return {Config} this
	 */
	load(file = null) {
		if (!file) file = this.file;
		let content = fs.readFileSync(file, 'utf8');
		this.data = JSON.parse(content);
		return this;
	}
	/**
	 * Writes the current data on the config file
	 * @return {Config} this
	 */
	save(file = null) {
		if (!file) file = this.file;
		let content = JSON.stringify(this.data, null, 4);
		fs.writeFileSync(file, content, 'utf8');
		return this;
	}
	/**
	 * Creates a backup of the config file with `.bak` extension in the same directory as the original file.
	 * If an old backup exists, it will be overwritten
	 * @return {Config} this
	 */
	backup() {
		return this.save(this.file + '.bak');
	}
	/**
	 * Restores data from a backup file
	 * @return {Config} this
	 */
	loadBackup() {
		return this.load(this.file + '.bak');
	}
	/**
	 * Deletes a backup file
	 * @return {Config} this
	 */
	deleteBackup() {
		fs.unlinkSync(this.file + '.bak');
		return this;
	}
	/**
	 * The current profile object
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
	 * Clears all the rules in the current profile
	 * @return {Config} this
	 */
	clearRules() {
		return this.setRules([]);
	}
	/**
	 * Sets the provided rules to the current profile
	 * @param {object[]} rules - an array of rule definitions
	 * @return {Config} this
	 */
	setRules(rules) {
		dig(this.currentProfile, 'complex_modifications.rules', { set: rules, makePath: true, throw: true });
		return this;
	}
}

/*!
 *  karabinerge
 * ----------------------------------------------------
 *  Karabiner Elements complex modifications generator
 *  @author Satoshi Soma (https://amekusa.com)
 * ==================================================== *
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
			return { language: item };
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
			return { language: item };
		})
	};
}

exports.Config = Config;
exports.Rule = Rule;
exports.RuleSet = RuleSet;
exports.click = click;
exports.if_app = if_app;
exports.if_lang = if_lang;
exports.if_var = if_var;
exports.key = key;
exports.set_var = set_var;
exports.unless_app = unless_app;
exports.unless_lang = unless_lang;
exports.unless_var = unless_var;

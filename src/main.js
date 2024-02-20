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

import RuleSet from './RuleSet.js';
import Rule from './Rule.js';
import Config from './Config.js';

export {
	RuleSet,
	Rule,
	Config,
};

/**
 * Returns an object with `key_code` property, which can be passed to {@link Rule#remap} as `from` or `to` properties.
 * @param {string} code - key code
 * @param {string|object|string[]} mods - modifiers
 * @param {object} [opts] - optional properties
 * @return {object} an object like: `{ key_code: ... }`
 */
export function key(code, mods = null, opts = null) {
	let r = { key_code: code + '' };
	if (mods) r.modifiers = mods;
	return opts ? Object.assign(r, opts) : r;
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
export function click(btn) {
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
export function set_var(name, value, opts = null) {
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
export function if_var(name, value) {
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
export function unless_var(name, value) {
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
export function if_app(...id) {
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
export function unless_app(...id) {
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
export function if_lang(...lang) {
	return {
		type: 'input_source_if',
		input_sources: lang.map(item => {
			return { language: item }
		})
	};
}

/**
 * Returns an object with `type: 'input_source_unless'` property, which can be passed to {@link Rule#cond} as a condition.
 * @param {...string} lang - language code
 * @return {object} an object like: `{ type: 'input_source_unless', ... }`
 */
export function unless_lang(...lang) {
	return {
		type: 'input_source_unless',
		input_sources: lang.map(item => {
			return { language: item }
		})
	};
}

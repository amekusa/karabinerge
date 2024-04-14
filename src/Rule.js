import {arr, clean, isEmpty} from '@amekusa/util.js';
import Sanitizer from './Sanitizer.js';

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
	 * @param {Keymap|Keymap[]} map.to - An object like `{ key_code: 'a' }`, or a string of the special expression. Also can be an array for multiple keymaps (See {@link Keymap})
	 * @param {any} map.* - Any property that Karabiner supports for [manipulator](https://karabiner-elements.pqrs.org/docs/json/complex-modifications-manipulator-definition/)
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

export default Rule;

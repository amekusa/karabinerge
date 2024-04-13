import {arr, clean, isEmpty} from '@amekusa/util.js';
import Sanitizer from './Sanitizer.js';

/**
 * A complex modification rule
 */
class Rule {
	static fromJSON(json) {
		switch (typeof json) {
		case 'object':
			break;
		case 'string':
			json = JSON.parse(json);
			break;
		default:
			throw `invalid argument`;
		}
		let r = new this(json.desc);
		if (json.manipulators) r.remaps = arr(json.manipulators);
		return r;
	}
	/**
	 * @param {string} desc - rule description
	 */
	constructor(desc) {
		this.desc = desc || '';
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

export default Rule;

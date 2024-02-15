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
		if (!map.type) map = { type: 'basic', ...map };
		if (this.conds.length) map = Object.assign(map, { conditions: this.conds });
		this.remaps.push(remapSanitizer.sanitize(map));
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
		this.conds.push(cond);
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

export default Rule;
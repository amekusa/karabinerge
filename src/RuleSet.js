import Rule from './Rule.js';

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

export default RuleSet;
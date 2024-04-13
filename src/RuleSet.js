import fs from 'node:fs';
import Rule from './Rule.js';

/**
 * A collection of one or more modification rules
 *
 * @example
 * let rules = new RuleSet('My Rules');
 */
class RuleSet {
	/**
	 * Instanciates a RuleSet from the given JSON file.
	 * @param {string} file - JSON file to load, which is normally located in `~/.config/karabiner/complex_modifications`
	 * @return {RuleSet} new instance
	 */
	static load(file) {
		file = fs.realpathSync(file);
		let r = this.fromJSON(fs.readFileSync(file, 'utf8'));
		r.file = file;
		return r;
	}
	/**
	 * Instanciate a RuleSet from a JSON string or object.
	 * @param {string|object} data - JSON string or object
	 * @return {RuleSet} new instance
	 */
	static fromJSON(data) {
		data = (typeof data == 'string') ? JSON.parse(data) : data;
		let r = new this(data.title);
		if (Array.isArray(data.rules)) { // add rules
			for (let i = 0; i < data.rules.length; i++) {
				r.add(Rule.fromJSON(data.rules[i]));
			}
		}
		return r;
	}
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
	/**
	 * Saves this ruleset to the given file in JSON format.
	 * @param {string} [file] - Save destination. Defaults to {@link RuleSet#file}
	 * @return {string} written data
	 */
	save(file = '') {
		if (file) {
			this.file = file;
		} else {
			if (!this.file) throw new Error(`argument required`);
		}
		let data = JSON.stringify(this, null, 2);
		fs.writeFileSync(data, 'utf8');
		return data;
	}
}

export default RuleSet;
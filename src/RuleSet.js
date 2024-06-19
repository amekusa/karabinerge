import {stdout} from 'node:process';
import fs from 'node:fs';
import {io} from '@amekusa/nodeutil';
import {IO} from './IO.js';
import {Rule} from './Rule.js';

/**
 * A collection of one or more modification rules.
 *
 * @example // Create a new RuleSet
 * let rules = new RuleSet('My Rules');
 *
 */
export class RuleSet {
	/**
	 * Instantiates a RuleSet from a JSON string or object.
	 * @param {string|object} data - JSON string or object
	 * @return {RuleSet} New instance
	 */
	static fromJSON(data) {
		return new this().loadJSON(data);
	}
	/**
	 * Instantiates a RuleSet from a JSON file.
	 * Ruleset JSON files are normally located in `~/.config/karabiner/complex_modifications`.
	 * @param {string} file - JSON file path
	 * @param {object} [opts] - IO options
	 * @return {RuleSet} New instance
	 */
	static fromFile(file, opts = {}) {
		return new this().setIO(file, opts).load();
	}
	/**
	 * @param {string} title - title of this ruleset
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
		 * The JSON file path to save/load.
		 * @type {string}
		 */
		this.file = null;
		/**
		 * @type {IO}
		 */
		this.io;
	}
	/**
	 * Setup {@link IO} object for reading/writing this ruleset from/to a file.
	 * Ruleset files are normally located in `~/.config/karabiner/complex_modifications/*.json`.
	 * @param {string} file - Ruleset file path
	 * @param {object} [opts] - IO options
	 * @return {Config} Itself
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


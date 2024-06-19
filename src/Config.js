import path from 'node:path';
import dig from 'obj-digger';
import {io} from '@amekusa/nodeutil';
import {IO} from './IO.js';
import {Rule} from './Rule.js';

/**
 * User configuration of Karabiner-Elements.
 */
export class Config {
	constructor() {
		/**
		 * @type {object}
		 */
		this.data;
		/**
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
	 * Loads data from the config file.
	 * @return {Config} Itself
	 */
	load() {
		if (!this.io) throw `io is not set`;
		this.data = JSON.parse(this.io.read());
		return this;
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


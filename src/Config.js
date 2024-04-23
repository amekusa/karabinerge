import fs from 'node:fs';
import path from 'node:path';
import dig from 'obj-digger';
import {io} from '@amekusa/nodeutil';
import {Rule} from './Rule.js';

/**
 * User configuration of Karabiner-Elements.
 */
export class Config {
	/**
	 * @param {string} [file='~/.config/karabiner/karabiner.json'] - Config file path
	 */
	constructor(file = null) {
		this.data = null;
		this.file = null;
		this.setFile(file);
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
	 * Sets the config file path.
	 * The file is used as the default location for {@link Config#load} and {@link Config#save}.
	 * @param {string} [file='~/.config/karabiner/karabiner.json'] - Config file path
	 * @return {Config} Itself
	 */
	setFile(file = null) {
		this.file = file ? io.untilde(file) : path.join(io.home, '.config', 'karabiner', 'karabiner.json');
		return this;
	}
	/**
	 * Reads the data from the config file.
	 * @param {string} [file] - Config file path
	 * @return {Config} Itself
	 */
	load(file = null) {
		if (file) file = io.untilde(file);
		else if (!this.file) throw `argument required`;
		else file = this.file;
		this.data = JSON.parse(fs.readFileSync(file, 'utf8'));
		return this;
	}
	/**
	 * Writes the current data on the config file.
	 * @param {string} [file] - Config file path
	 * @return {Config} Itself
	 */
	save(file = null) {
		if (file) file = io.untilde(file);
		else if (!this.file) throw `argument required`;
		else file = this.file;
		let data = this.toJSON(true);
		fs.writeFileSync(file, data, 'utf8');
		return this;
	}
	/**
	 * Creates a backup of the config file with `.bak` extension in the same directory as the original file.
	 * If an old backup exists, it will be overwritten
	 * @return {Config} Itself
	 */
	backup() {
		return this.save(this.file + '.bak');
	}
	/**
	 * Restores the data from the backup file.
	 * @return {Config} Itself
	 */
	loadBackup() {
		return this.load(this.file + '.bak');
	}
	/**
	 * Deletes the backup file.
	 * @return {Config} Itself
	 */
	deleteBackup() {
		fs.unlinkSync(this.file + '.bak');
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


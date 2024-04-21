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
	toJSON() {
		return this.data;
	}
	/**
	 * Sets the config file path.
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
		if (!file) file = this.file;
		this.data = JSON.parse(fs.readFileSync(file, 'utf8'));
		return this;
	}
	/**
	 * Writes the current data on the config file.
	 * @param {string} [file] - Config file path
	 * @return {Config} Itself
	 */
	save(file = null) {
		if (!file) file = this.file;
		fs.writeFileSync(file, JSON.stringify(this, null, 4), 'utf8');
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


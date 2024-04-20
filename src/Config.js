import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path';
import dig from 'obj-digger';

/**
 * User configuration of Karabiner-Elements
 */
export class Config {
	/**
	 * @param {string} [file='~/.config/karabiner/karabiner.json'] - config file path
	 */
	constructor(file = null) {
		this.data = null;
		this.file = null;
		this.setFile(file);
	}
	/**
	 * Sets the config file path
	 * @param {string} [file='~/.config/karabiner/karabiner.json'] - config file path
	 * @return {Config} itself
	 */
	setFile(file = null) {
		this.file = file || path.join(os.homedir(), '.config', 'karabiner', 'karabiner.json');
		return this;
	}
	/**
	 * Reads the data from the config file
	 * @param {string} [file] - config file path
	 * @return {Config} itself
	 */
	load(file = null) {
		if (!file) file = this.file;
		let content = fs.readFileSync(file, 'utf8');
		this.data = JSON.parse(content);
		return this;
	}
	/**
	 * Writes the current data on the config file
	 * @param {string} [file] - config file path
	 * @return {Config} itself
	 */
	save(file = null) {
		if (!file) file = this.file;
		let content = JSON.stringify(this.data, null, 4);
		fs.writeFileSync(file, content, 'utf8');
		return this;
	}
	/**
	 * Creates a backup of the config file with `.bak` extension in the same directory as the original file.
	 * If an old backup exists, it will be overwritten
	 * @return {Config} itself
	 */
	backup() {
		return this.save(this.file + '.bak');
	}
	/**
	 * Restores the data from the backup file
	 * @return {Config} itself
	 */
	loadBackup() {
		return this.load(this.file + '.bak');
	}
	/**
	 * Deletes the backup file
	 * @return {Config} itself
	 */
	deleteBackup() {
		fs.unlinkSync(this.file + '.bak');
		return this;
	}
	/**
	 * The current profile object
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
	 * Clears all the rules in the current profile
	 * @return {Config} itself
	 */
	clearRules() {
		return this.setRules([]);
	}
	/**
	 * Sets the given rules to the current profile
	 * @param {object[]} rules - an array of rule definitions
	 * @return {Config} itself
	 */
	setRules(rules) {
		dig(this.currentProfile, 'complex_modifications.rules', {set: rules, makePath: true, throw: true});
		return this;
	}
}


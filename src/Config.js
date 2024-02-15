import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path';
import dig from 'obj-digger';

/**
 * User configuration of Karabiner-Elements
 */
class Config {
	static new(...args) {
		return new this(...args);
	}
	/**
	 * @param {string} [file='~/.config/karabiner/karabiner.json'] - config file to read/write
	 */
	constructor(file = null) {
		this.setFile(file || path.join(os.homedir(), '.config', 'karabiner', 'karabiner.json'));
		this.data = null;
	}
	/**
	 * Sets the config file path
	 * @param {string} file - config file path
	 * @return {Config} this
	 */
	setFile(file) {
		this.file = file;
		return this;
	}
	/**
	 * Reads data from the config file
	 * @return {Config} this
	 */
	load(file = null) {
		if (!file) file = this.file;
		let content = fs.readFileSync(file, 'utf8');
		this.data = JSON.parse(content);
		return this;
	}
	/**
	 * Writes the current data on the config file
	 * @return {Config} this
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
	 * @return {Config} this
	 */
	backup() {
		return this.save(this.file + '.bak');
	}
	/**
	 * Restores data from a backup file
	 * @return {Config} this
	 */
	loadBackup() {
		return this.load(this.file + '.bak');
	}
	/**
	 * Deletes a backup file
	 * @return {Config} this
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
	 * @return {Config} this
	 */
	clearRules() {
		return this.setRules([]);
	}
	/**
	 * Sets the provided rules to the current profile
	 * @param {object[]} rules - an array of rule definitions
	 * @return {Config} this
	 */
	setRules(rules) {
		dig(this.currentProfile, 'complex_modifications.rules', { set: rules, makePath: true, throw: true });
		return this;
	}
}

export default Config;
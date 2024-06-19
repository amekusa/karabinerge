import fs from 'node:fs';
import {time} from '@amekusa/util.js';
import {io} from '@amekusa/nodeutil';

/**
 * File I/O manager.
 */
export class IO {
	/**
	 * @param {string} file - File to read/write
	 * @param {object} [opts] - Options
	 * @param {boolean} [opts.backup=true] - Whether to create a backup before overwrite
	 * @param {string} [opts.backupExt='.bak'] - Backup file extension
	 */
	constructor(file, opts = {}) {
		this.opts = Object.assign({
			encoding: 'utf8',
			backup: true,
			backupExt: '.bak',
		}, opts);
		this.file;
		if (file) this.setFile(file);
	}
	/**
	 * Sets the file to {@link IO#load} and {@link IO#save}.
	 * @param {string} file - File path
	 * @return {IO} Itself
	 */
	setFile(file) {
		this.file = io.untilde(file);
		return this;
	}
	/**
	 * Reads the data from the file.
	 * @param {object} [opts] - Option to pass to `fs.readFileSync()`
	 * @return {string} Data
	 */
	read(opts = {}) {
		return fs.readFileSync(this.file, Object.assign({encoding: this.opts.encoding}, opts));
	}
	/**
	 * Writes the given data on the file.
	 * If `options.backup` is `true`, creats a backup before overwrite.
	 * @param {string} data - Data to write
	 * @param {object} [opts] - Option to pass to `fs.writeFileSync()`
	 * @return {IO} Itself
	 */
	write(data, opts = {}) {
		if (this.opts.backup && fs.existsSync(this.file)) {
			let now = Date.now();
			let backup = this.file + '.'
				+ time.ymd(now, '-') + '.'
				+ time.hms(now, '') +
				+ this.opts.backupExt;
			fs.copyFileSync(this.file, backup);
		}
		fs.writeFileSync(this.file, data, Object.assign({encoding: this.opts.encoding}, opts));
		return this;
	}
}


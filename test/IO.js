import assert from 'node:assert';
const
	eq = assert.equal,
	seq = assert.strictEqual,
	deq = assert.deepEqual,
	dseq = assert.deepStrictEqual;

import {homedir} from 'node:os';
import {join} from 'node:path';
import fs from 'node:fs';

import {test} from '@amekusa/nodeutil';
const {testFn, testMethod, testInstance} = test;

import {IO} from '../dist/import/bundle.mjs';

describe(`class: IO`, () => {

	testMethod(IO, 'setFile', {
		'relative path': {
			args: ['path/to/file.txt'],
			returnSelf: true,
			props: {
				file: 'path/to/file.txt',
			}
		},
		'absolute path': {
			args: ['/path/to/file.txt'],
			returnSelf: true,
			props: {
				file: '/path/to/file.txt',
			}
		},
		'path with a tilde': {
			args: ['~/path/to/file.txt'],
			returnSelf: true,
			props: {
				file: join(homedir(), '/path/to/file.txt'),
			}
		}
	});

	testMethod(() => {
		return new IO('test/data/io-read-sample.txt');
	}, 'read', {
		'default args': {
			args: [],
			returnType: 'string',
			return: 'IO :: read - sample data\n',
		}
	});

	testMethod(() => {
		return new IO('test/outputs/io-write-sample.txt');
	}, 'write', {
		'default opts': {
			args: ['IO :: write - sample data'],
			returnSelf: true,
			test(r, obj, data) {
				seq(fs.readFileSync(obj.file, {encoding: obj.opts.encoding}), data);
				fs.rmSync(obj.file);
			}
		}
	});

});

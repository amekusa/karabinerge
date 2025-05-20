import assert from 'node:assert';
const
	eq = assert.equal,
	seq = assert.strictEqual,
	deq = assert.deepEqual,
	dseq = assert.deepStrictEqual;

import {homedir} from 'node:os';
import {join} from 'node:path';

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
});

import assert from 'node:assert';
const
	ok = assert.ok,
	eq = assert.equal,
	seq = assert.strictEqual,
	deq = assert.deepEqual,
	dseq = assert.deepStrictEqual;

import {test} from '@amekusa/nodeutil';
const {
	testFn,
	testMethod,
	testInstance,
	assertProps,
} = test;

import {Config} from '../dist/import/bundle.mjs';

import fs from 'node:fs';
const secrets = JSON.parse(fs.readFileSync('./test/secrets.json'));

testInstance(Config, {
	'no args': {
		args: [],
		props: {
			file: secrets.home + '/.config/karabiner/karabiner.json'
		}
	},
	'file': {
		args: ['foo/bar'],
		props: {
			file: 'foo/bar'
		}
	},
	'file with tilde': {
		args: ['~/foo/bar'],
		props: {
			file: secrets.home + '/foo/bar'
		}
	},
	'test file': {
		args: ['./test/config.json'],
		props: {
			file: './test/config.json'
		},
		test(x) {
			x.load();
			eq(x.data.profiles.length, 2);
			eq(x.data.profiles[0].selected, true);
			seq(x.currentProfile, x.data.profiles[0]);
			eq(x.currentProfile.name, 'Default profile');
		}
	}
});


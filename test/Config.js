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

describe(`class: Config`, () => {

	testMethod(Config, 'setIO', {
		'no args': {
			returnsSelf: true,
			test(x) {
				eq(x.io.file, secrets.home + '/.config/karabiner/karabiner.json');
			}
		},
		'file': {
			args: ['foo/bar'],
			returnsSelf: true,
			test(x) {
				eq(x.io.file, 'foo/bar');
			}
		},
		'file with tilde': {
			args: ['~/foo/bar'],
			test(x) {
				eq(x.io.file, secrets.home + '/foo/bar');
			}
		},
		'test file': {
			args: ['./test/config.json'],
			test(x) {
				eq(x.io.file, './test/config.json');
				x.load();
				eq(x.data.profiles.length, 3);
				eq(x.data.profiles[0].selected, true);
				seq(x.currentProfile, x.data.profiles[0]);
				eq(x.currentProfile.name, 'Default profile');
			}
		},
	});

	testMethod(() => new Config().setIO('./test/config.json'), 'selectProfile', {
		'index': {
			args: [1],
			test(x) {
				eq(x.data.profiles[0].selected, false);
				eq(x.data.profiles[1].selected, true);
				eq(x.data.profiles[2].selected, false);
				seq(x.currentProfile, x.data.profiles[1]);
				eq(x.currentProfile.name, 'Profile Alice');
			}
		},
		'name': {
			args: ['Profile Alice'],
			test(x) {
				eq(x.data.profiles[0].selected, false);
				eq(x.data.profiles[1].selected, true);
				eq(x.data.profiles[2].selected, false);
				seq(x.currentProfile, x.data.profiles[1]);
				eq(x.currentProfile.name, 'Profile Alice');
			}
		},
		'regex': {
			args: [/Bob/],
			test(x) {
				eq(x.data.profiles[0].selected, false);
				eq(x.data.profiles[1].selected, false);
				eq(x.data.profiles[2].selected, true);
				seq(x.currentProfile, x.data.profiles[2]);
				eq(x.currentProfile.name, 'Profile Bob');
			}
		},
	});
});


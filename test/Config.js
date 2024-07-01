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
	const file = './test/config.json';
	const data = JSON.parse(fs.readFileSync(file));
	const newConfig = () => Config.fromFile(file);

	testMethod(Config, 'setIO', {
		'no args': {
			returnsSelf: true,
			test(r) {
				eq(r.io.file, secrets.home + '/.config/karabiner/karabiner.json');
			}
		},
	});

	testMethod(Config, 'fromFile', {
		'test file': {
			args: [file],
			returnType: Config,
			test(r, _, file) {
				eq(r.io.file, file);
			}
		}
	}, {static: true});

	testMethod(newConfig, 'toJSON', {
		'default': {
			returnType: 'object',
			test(r) {
				dseq(r, data);
			}
		},
		'stringify': {
			args: [true],
			returnType: 'string',
			test(r) {
				dseq(JSON.parse(r), data);
			}
		}
	});

	testMethod(newConfig, 'selectProfile', {
		'index': {
			args: [1],
			test(r) {
				eq(r.data.profiles[0].selected, false);
				eq(r.data.profiles[1].selected, true);
				eq(r.data.profiles[2].selected, false);
				seq(r.currentProfile, r.data.profiles[1]);
				eq(r.currentProfile.name, 'Profile Alice');
			}
		},
		'name': {
			args: ['Profile Alice'],
			test(r) {
				eq(r.data.profiles[0].selected, false);
				eq(r.data.profiles[1].selected, true);
				eq(r.data.profiles[2].selected, false);
				seq(r.currentProfile, r.data.profiles[1]);
				eq(r.currentProfile.name, 'Profile Alice');
			}
		},
		'regex': {
			args: [/Bob/],
			test(r) {
				eq(r.data.profiles[0].selected, false);
				eq(r.data.profiles[1].selected, false);
				eq(r.data.profiles[2].selected, true);
				seq(r.currentProfile, r.data.profiles[2]);
				eq(r.currentProfile.name, 'Profile Bob');
			}
		},
	});
});


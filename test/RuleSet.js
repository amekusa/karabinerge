import assert from 'node:assert';
const
	eq = assert.equal,
	seq = assert.strictEqual,
	deq = assert.deepEqual,
	dseq = assert.deepStrictEqual;

import fs from 'node:fs';
import {test} from '@amekusa/nodeutil';
const {
	testFn,
	testMethod,
	testInstance,
	assertProps,
} = test;

import {RuleSet} from '../dist/import/bundle.mjs';

describe(`class: RuleSet`, () => {
	const file = './test/ruleset.json';

	testMethod(RuleSet, 'setIO', {
		'test file': {
			args: [file],
			returnsSelf: true,
			test(r, o, f) {
				eq(o.io.file, f);
			}
		}
	});

	testMethod(RuleSet, 'fromFile', {
		'test file': {
			args: [file],
			returnType: RuleSet,
			test(r) {
				assertProps(r, {
					title: 'Test RuleSet',
				});
				// ---- check rules ----
				let {rules} = r;
				eq(rules.length, 2);
				assertProps(rules[0], {
					desc: 'Rule Alfa',
					remaps: [
						{
							type: 'basic',
							from: {key_code: 'a'},
							to:  [{key_code: 'b'}]
						}
					]
				});
				assertProps(rules[1], {
					desc: 'Rule Bravo',
					remaps: [
						{
							type: 'basic',
							from: {key_code: 'b'},
							to:  [{key_code: 'c'}]
						}
					]
				});
			}
		}
	}, {static: true, strict: true});
});

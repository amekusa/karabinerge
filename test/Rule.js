import assert from 'node:assert';
const
	eq = assert.equal,
	seq = assert.strictEqual,
	deq = assert.deepEqual,
	dseq = assert.deepStrictEqual;

import {test} from '@amekusa/nodeutil';
const {testFn, testMethod, testInstance} = test;

import {Rule} from '../dist/import/bundle.mjs';

testMethod(Rule, 'fromJSON', {
	'object': {
		args: [{
			description: 'Test Rule',
			manipulators: [
				{
					type: 'basic',
					from: {key_code: 'a'},
					to:  [{key_code: 'b'}]
				}
			]
		}],
		returnType: Rule,
		test(r) {
			eq(r.desc, 'Test Rule');
			deq(r.remaps, [
				{
					type: 'basic',
					from: {key_code: 'a'},
					to:  [{key_code: 'b'}]
				}
			]);
		}
	},
	'JSON string': {
		args: [`{
			"description": "Test Rule",
			"manipulators": [
				{
					"type": "basic",
					"from": {"key_code": "a"},
					"to":  [{"key_code": "b"}]
				}
			]
		}`],
		returnType: Rule,
		test(r) {
			eq(r.desc, 'Test Rule');
			deq(r.remaps, [
				{
					type: 'basic',
					from: {key_code: 'a'},
					to:  [{key_code: 'b'}]
				}
			]);
		}
	}
}, {static: true, strict: true});

testInstance(Rule, {
	'desc': {
		args: ['This is a test rule.'],
		props: {
			desc: 'This is a test rule.',
		}
	},
	'remap': {
		test(rule) {
			rule.remap({from: 'a', to: 'b'});
			dseq(rule.remaps, [
				{
					type: 'basic',
					from: 'a',
					to: ['b'],
				}
			]);
		}
	},
	'multi-remap': {
		test(rule) {
			let r = rule.remap({from: 'a', to: 'b'});
			seq(r, rule);

			r.remap({from: 'c', to: 'd'})
			 .remap({from: 'e', to: 'f'});
			dseq(rule.remaps, [
				{
					type: 'basic',
					from: 'a',
					to: ['b'],
				},
				{
					type: 'basic',
					from: 'c',
					to: ['d'],
				},
				{
					type: 'basic',
					from: 'e',
					to: ['f'],
				},
			]);
		}
	}
});

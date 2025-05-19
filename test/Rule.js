import assert from 'node:assert';
const
	eq = assert.equal,
	seq = assert.strictEqual,
	deq = assert.deepEqual,
	dseq = assert.deepStrictEqual;

import {test} from '@amekusa/nodeutil';
const {testFn, testMethod, testInstance} = test;

import {Rule} from '../dist/import/bundle.mjs';

describe(`class: Rule`, () => {

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
				rule.remap({
					from: {key_code: 'a'},
					to:  [{key_code: 'b'}]
				});
				dseq(rule.remaps, [{
					type: 'basic',
					from: {key_code: 'a'},
					to:  [{key_code: 'b'}]
				}]);
			}
		},
		'remap (multiple)': {
			test(rule) {
				seq(rule.remap({
					from: {key_code: 'a'},
					to:  [{key_code: 'b'}]
				}), rule); // must return itself

				rule.remap({
					from: {key_code: 'b'},
					to:  [{key_code: 'c'}]
				})
				.remap({
					from: {key_code: 'c'},
					to:  [{key_code: 'd'}]
				});
				dseq(rule.remaps, [
					{
						type: 'basic',
						from: {key_code: 'a'},
						to:  [{key_code: 'b'}]
					},
					{
						type: 'basic',
						from: {key_code: 'b'},
						to:  [{key_code: 'c'}]
					},
					{
						type: 'basic',
						from: {key_code: 'c'},
						to:  [{key_code: 'd'}]
					},
				]);
			}
		},
		'remap + string expr.': {
			test(rule) {
				rule.remap({from: 'a', to: 'b'});
				dseq(rule.remaps, [{
					type: 'basic',
					from: {key_code: 'a'},
					to:  [{key_code: 'b'}]
				}]);
			}
		},
		'remap + string expr. (multiple-to)': {
			test(rule) {
				rule.remap({from: 'a', to: ['b', 'c']});
				dseq(rule.remaps, [{
					type: 'basic',
					from: {key_code: 'a'},
					to:  [
						{key_code: 'b'},
						{key_code: 'c'}
					]
				}]);
			}
		},
		'remap + string expr. (modifiers)': {
			test(rule) {
				rule.remap({
					from: 'shift + a',
					to:   'control + b'
				});
				dseq(rule.remaps, [{
					type: 'basic',
					from: {
						key_code: 'a',
						modifiers: {
							mandatory: ['shift']
						}
					},
					to: [{
						key_code: 'b',
						modifiers: ['control']
					}]
				}]);
			}
		},
		'remap + string expr. (optional modifiers)': {
			test(rule) {
				rule.remap({
					from: 'shift + (control) + a',
					to:   'control + b'
				});
				dseq(rule.remaps, [{
					type: 'basic',
					from: {
						key_code: 'a',
						modifiers: {
							mandatory: ['shift'],
							optional:  ['control']
						}
					},
					to: [{
						key_code: 'b',
						modifiers: ['control']
					}]
				}]);
			}
		},
		'remap + string expr. (multiple-to with modifiers)': {
			test(rule) {
				rule.remap({
					from: 'shift + (control) + a',
					to: [
						'control + b',
						'shift + command + c',
					]
				});
				dseq(rule.remaps, [{
					type: 'basic',
					from: {
						key_code: 'a',
						modifiers: {
							mandatory: ['shift'],
							optional:  ['control']
						}
					},
					to: [
						{
							key_code: 'b',
							modifiers: ['control']
						},
						{
							key_code: 'c',
							modifiers: ['shift', 'command']
						}
					]
				}]);
			}
		},
	});
});

import {test} from '@amekusa/nodeutil';
const {testFn} = test;

import {
	key
} from '../dist/import/bundle.mjs';

describe(`functions:`, () => {

	testFn(key, {
		'simple key': {
			args: ['a'],
			return: {key_code: 'a'}
		},
		'number key': {
			args: [0],
			return: {key_code: '0'}
		},
		'single modifier': {
			args: ['a', 'control'],
			return: {
				key_code: 'a',
				modifiers: ['control']
			}
		},
		'multiple modifiers': {
			args: ['a', ['control', 'shift']],
			return: {
				key_code: 'a',
				modifiers: ['control', 'shift']
			}
		},
		'optional modifier': {
			args: ['a', {mandatory: 'control', optional: 'shift'}],
			return: {
				key_code: 'a',
				modifiers: {
					mandatory: ['control'],
					optional: ['shift']
				}
			}
		},
		'multiple mandatory & optional modifiers': {
			args: ['a', {mandatory: ['control', 'command'], optional: ['shift', 'option']}],
			return: {
				key_code: 'a',
				modifiers: {
					mandatory: ['control', 'command'],
					optional: ['shift', 'option']
				}
			}
		},
		'options': {
			args: [
				'a', {mandatory: 'control', optional: 'shift'},
				{
					str: 'abc',
					num: 0,
					bool: false,
					arr: [0, 1, 2],
					obj: {x: 0, y: 1, z: 2}
				}
			],
			return: {
				key_code: 'a',
				modifiers: {
					mandatory: ['control'],
					optional: ['shift']
				},
				str: 'abc',
				num: 0,
				bool: false,
				arr: [0, 1, 2],
				obj: {x: 0, y: 1, z: 2}
			}
		},

		'multiple keys': {
			args: [['a', 'b', 'c']],
			return: [
				{key_code: 'a'},
				{key_code: 'b'},
				{key_code: 'c'}
			]
		},
		'multiple keys with a common modifier': {
			args: [['a', 'b', 'c'], 'control'],
			return: [
				{key_code: 'a', modifiers: ['control']},
				{key_code: 'b', modifiers: ['control']},
				{key_code: 'c', modifiers: ['control']},
			]
		},
		'multiple keys with common modifiers and options': {
			args: [['a', 'b', 'c'], ['control', 'shift'], {x: 1, y: 2, z: 3}],
			return: [
				{key_code: 'a', modifiers: ['control', 'shift'], x: 1, y: 2, z: 3},
				{key_code: 'b', modifiers: ['control', 'shift'], x: 1, y: 2, z: 3},
				{key_code: 'c', modifiers: ['control', 'shift'], x: 1, y: 2, z: 3},
			]
		},
		'multiple keys with modifiers for each': {
			args: [[
				['a', 'control'],
				['b', 'shift'],
				['c', ['control', 'shift']],
			]],
			return: [
				{key_code: 'a', modifiers: ['control']},
				{key_code: 'b', modifiers: ['shift']},
				{key_code: 'c', modifiers: ['control', 'shift']},
			]
		},

		'string expression :: single modifier': {
			args: ['control + a'],
			return: {
				key_code: 'a',
				modifiers: ['control']
			}
		},
		'string expression :: multiple modifiers': {
			args: ['control + shift + a'],
			return: {
				key_code: 'a',
				modifiers: ['control', 'shift']
			}
		},
		'string expression :: optional modifier': {
			args: ['control + (shift) + a'],
			return: {
				key_code: 'a',
				modifiers: {
					mandatory: ['control'],
					optional: ['shift']
				}
			}
		},
		'string expression :: multiple mandatory & optional modifiers': {
			args: ['control + command + (shift) + (option) + a'],
			return: {
				key_code: 'a',
				modifiers: {
					mandatory: ['control', 'command'],
					optional: ['shift', 'option']
				}
			}
		},
		'string expression :: multiple keys': {
			args: [[
				'control + a',
				'control + shift + a',
				'(control) + a',
				'control + (shift) + a',
				'control + command + (shift) + (option) + a',
			]],
			return: [
				{key_code: 'a', modifiers: ['control']},
				{key_code: 'a', modifiers: ['control', 'shift']},
				{key_code: 'a', modifiers: {
					optional: ['control']
				}},
				{key_code: 'a', modifiers: {
					mandatory: ['control'],
					optional: ['shift']
				}},
				{key_code: 'a', modifiers: {
					mandatory: ['control', 'command'],
					optional: ['shift', 'option']
				}},
			]
		},

	}, 'deepEqual');
});

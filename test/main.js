import {test} from '@amekusa/nodeutil';
const {testFn} = test;

import {
	key
} from '../dist/import/bundle.mjs';

testFn(key, {
	'simple key': {
		args: ['a'],
		return: {
			key_code: 'a',
			modifiers: []
		}
	},
	'number key': {
		args: [0],
		return: {
			key_code: '0',
			modifiers: []
		}
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
}, 'deepEqual');
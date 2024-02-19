import {test} from '@amekusa/nodeutil';
import {
	isEmpty,
	clean,
	merge,
} from '../src/util.js';

const {testFn} = test;

testFn(isEmpty, {
	'empty string': {
		args: [''],
		return: true
	},
	'empty array': {
		args: [[]],
		return: true
	},
	'empty object': {
		args: [{}],
		return: true
	},
	'null': {
		args: [null],
		return: true
	},
	'undefined': {
		args: [undefined],
		return: true
	},
	'non-empty string': {
		args: ['abc'],
		return: false
	},
	'non-empty array': {
		args: [[0, 1, 2]],
		return: false
	},
	'non-empty object': {
		args: [{a: 0, b: 1, c: 2}],
		return: false
	},
	'false is not empty': {
		args: [false],
		return: false
	},
	'0 is not empty': {
		args: [0],
		return: false
	},
});

testFn(clean, {
	'array': {
		args: [[0, 1, 2, 'hello', '', true, false, null, undefined]],
		return: [0, 1, 2, 'hello', true, false]
	},
	'object': {
		args: [{
			a: 0, b: 1, c: 2,
			str1: 'hello',
			str2: '',
			bool1: true,
			bool2: false,
			null: null,
			undefined: undefined
		}],
		return: {
			a: 0, b: 1, c: 2,
			str1: 'hello',
			bool1: true,
			bool2: false,
		}
	},
	'complex array': {
		args: [[
			0, 1, 2, 'hello', '', true, false, null, undefined,
			[0, 1, 2, 'hello', '', true, false, null, undefined],
			[],
			['', null, undefined],
			['str.0', ['str.1.0', '', 'str.1.1', [null], ['str.1.2.0', undefined]]]
		]],
		return: [
			0, 1, 2, 'hello', true, false,
			[0, 1, 2, 'hello', true, false],
			['str.0', ['str.1.0', 'str.1.1', ['str.1.2.0']]]
		]
	},
	'complex object': {
		args: [{
			a: 0, b: 1, c: 2,
			str1: 'hello',
			str2: '',
			bool1: true,
			bool2: false,
			null: null,
			undefined: undefined,
			arr1: ['str.0', ['str.1.0', '', 'str.1.1', [null], ['str.1.2.0', undefined]]],
			arr2: [],
			obj1: {x: 0, y: 1, z: 2},
			obj2: {str: ''}
		}],
		return: {
			a: 0, b: 1, c: 2,
			str1: 'hello',
			bool1: true,
			bool2: false,
			arr1: ['str.0', ['str.1.0', 'str.1.1', ['str.1.2.0']]],
			obj1: {x: 0, y: 1, z: 2}
		}
	},
}, 'deepEqual');

testFn(merge, {
	'replace array': {
		args: [['a', 'b', 'c'], ['x', 'y', 'z']],
		return: ['x', 'y', 'z']
	},
	'merge arrays': {
		args: [['a', 'b', 'c'], ['c', 'd', 'e'], {mergeArrays: true}],
		return: ['a', 'b', 'c', 'd', 'e']
	},
	'concat arrays': {
		args: [['a', 'b', 'c'], ['c', 'd', 'e'], {mergeArrays: 'concat'}],
		return: ['a', 'b', 'c', 'c', 'd', 'e']
	},
	'concat arrays (push)': {
		args: [['a', 'b', 'c'], ['c', 'd', 'e'], {mergeArrays: 'push'}],
		return: ['a', 'b', 'c', 'c', 'd', 'e']
	},
	'merge objects': {
		args: [
			{a: 0, b: 1, c: 2},
			{b: 10, c: 20, d: 30},
		],
		return:
			{a: 0, b: 10, c: 20, d: 30}
	},
	'merge complex objects': {
		args: [
			{
				mammals: {
					dog: {
						legs: 4,
						hasTail: true,
					},
					human: {
						legs: 2,
					}
				}
			},
			{
				mammals: {
					monkey: {
						legs: 2,
						hasTail: true,
					},
					human: {
						hasTail: false,
					}
				}
			}
		],
		return:
			{
				mammals: {
					dog: {
						legs: 4,
						hasTail: true,
					},
					monkey: {
						legs: 2,
						hasTail: true,
					},
					human: {
						legs: 2,
						hasTail: false
					}
				}
			}
	},
	'merge complex objects including arrays': {
		args: [
			{
				games: {
					hollow_knight: {
						rating: null,
						developers: [
							'Team Cherry',
						],
						genres: [
							'metroidvania',
						],
					},
					a_link_to_the_past: {
						rating: 10,
						genres: [
							'roleplaying',
							'action',
						]
					},
					sin_and_punishment: {
						rating: undefined,
						developers: [
						],
						genres: [
							'railshooter',
						]
					},
				},
				movies: {
					mulholland_drive: {
						rating: '?',
						directors: [
							'David Lynch',
						],
						cast: [
							'Naomi Watts',
						]
					},
					the_big_lebowski: {
						rating: 9,
						directors: [
							'Ethan Coen',
							'Joel Coen',
						],
						cast: [
							'John Goodman',
						]
					},
				}
			},
			{
				games: {
					hollow_knight: {
						rating: 10,
						developers: [
							'Team Cherry',
						],
						genres: [
							'platformer',
							'exploration',
						],
					},
					a_link_to_the_past: {
						developers: [
							'Nintendo',
						],
						genres: [
							'exploration',
							'puzzle',
						]
					},
					sin_and_punishment: {
						rating: 10,
						developers: [
							'Treasure',
						],
						genres: [
							'railshooter',
							'action',
						]
					},
				},
				movies: {
					mulholland_drive: {
						rating: 10,
						directors: [
							'David Lynch',
						],
						cast: [
							'Laura Harring',
						]
					},
					the_big_lebowski: {
						directors: [
							'Ethan Coen',
						],
						cast: [
							'Jeff Bridges',
						]
					},
				}
			},
			{mergeArrays: true}
		],
		return:
			{
				games: {
					hollow_knight: {
						rating: 10,
						developers: [
							'Team Cherry',
						],
						genres: [
							'metroidvania',
							'platformer',
							'exploration',
						],
					},
					a_link_to_the_past: {
						rating: 10,
						developers: [
							'Nintendo',
						],
						genres: [
							'roleplaying',
							'action',
							'exploration',
							'puzzle',
						]
					},
					sin_and_punishment: {
						rating: 10,
						developers: [
							'Treasure',
						],
						genres: [
							'railshooter',
							'action',
						]
					},
				},
				movies: {
					mulholland_drive: {
						rating: 10,
						directors: [
							'David Lynch',
						],
						cast: [
							'Naomi Watts',
							'Laura Harring',
						]
					},
					the_big_lebowski: {
						rating: 9,
						directors: [
							'Ethan Coen',
							'Joel Coen',
						],
						cast: [
							'John Goodman',
							'Jeff Bridges',
						]
					},
				}
			}
	},
	'recursion limit': {
		args: [
			{i: {ii: {iii: {iv: {v: {viA: 0, viC: 2}, vA: 0, vC: 2}}}}},
			{i: {ii: {iii: {iv: {v: {viA: 0, viB: 1}, vA: 0, vB: 1}}}}},
			{recurse: 5}
		],
		return:
			{i: {ii: {iii: {iv: {v: {viA: 0, viB: 1}, vA: 0, vB: 1, vC: 2}}}}}
	},
}, 'deepEqual');

import {test} from '@amekusa/nodeutil';
import {
	isEmpty,
	clean,
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

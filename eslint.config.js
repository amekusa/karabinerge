export default [
	{
		ignores: [
			'node_modules/',
			'test/',
			'dist/',
			'docs/',
		]
	},
	{
		files: [
			'src/**/*.js',
		],
		rules: {
			semi: ['error', 'always'],
			indent: ['error', 'tab', {
				ignoreComments: true,
				ignoredNodes: ['SwitchCase']
			}],
			'object-curly-spacing': ['warn', 'never'],
		}
	}
];

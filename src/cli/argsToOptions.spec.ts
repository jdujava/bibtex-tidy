import { deepStrictEqual } from 'assert';
import { test } from '../../test/utils';
import { argsToOptions } from './argsToOptions';

test('argsToOptions', async () => {
	deepStrictEqual(
		argsToOptions(
			'foo.bib something.txt --no-wrap --space 3 foo --align=10,11'
		),
		{
			inputFiles: ['foo.bib', 'something.txt'],
			options: { wrap: false, space: 3, align: 10 },
			unknownArgs: [],
		}
	);

	deepStrictEqual(
		argsToOptions(
			'--no-wrap --space 3 foo --moo --align=10,11 foo.bib something.txt'
		),
		{
			inputFiles: ['foo.bib', 'something.txt'],
			options: { wrap: false, space: 3, align: 10 },
			unknownArgs: ['--moo'],
		}
	);

	deepStrictEqual(argsToOptions('/some/path/to/a/file -mo foo'), {
		inputFiles: ['/some/path/to/a/file'],
		options: { outputPath: 'foo', modify: true },
		unknownArgs: [],
	});

	deepStrictEqual(argsToOptions('/some/path/to/a/file -m --output foo'), {
		inputFiles: ['/some/path/to/a/file'],
		options: { outputPath: 'foo', modify: true },
		unknownArgs: [],
	});

	deepStrictEqual(argsToOptions('-'), {
		inputFiles: ['-'],
		options: {},
		unknownArgs: [],
	});
});

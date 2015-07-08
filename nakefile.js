var nake = require('nake');
var task = nake.task;
var fileSet = nake.fileSet;
var tsc = require('tsc');

// Define file set using wildcards
// var files = fileSet(nake.workingDirectory, '**/*.ts', ['all.references.ts']);

// Define file set using explicit list
var files = fileSet(nake.workingDirectory, [
	'qunit/qunit.d.ts',
	'lib/Base.ts',
	'lib/Base.tests.ts',
	'lib/Geometry.ts',
	'Driver.ts',
	'Features.ts',
	'Game.ts',
	'Position.ts'			
]);

// creating a TypeScript builder
var builder = tsc.createBuilder(files, {
	target: 'ES3'
});

exports.fullBuild = builder.fullBuildTask;
exports.incrementalBuild = builder.incrementalBuildTask;
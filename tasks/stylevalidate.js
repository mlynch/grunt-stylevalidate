/*
 * grunt-html
 * https://github.com/jzaefferer/grunnt-html
 *
 * Copyright (c) 2012 Jörn Zaefferer
 * Licensed under the MIT license.
 */

var fs = require('fs');
var file = require('file');
var diff = require('diff');
var codepainter = require('codepainter');

module.exports = function(grunt) {

	// Please see the grunt documentation for more information regarding task and
	// helper creation: https://github.com/cowboy/grunt/blob/master/docs/toc.md

	// ==========================================================================
	// TASKS
	// ==========================================================================

	function runCodePainter(directory, style, callback) {
		file.walk(directory, function(unused, dirPath, dirs, files) {
			for(var i = 0; i < files.length; i++) {
				var file = files[i];

				var input = fs.createReadStream(file);
				input.pause();

				/*
				var stream = process.stdout;

				codepainter.transform(input, styleObj, stream, function() {
					console.log(stream);
				});
				*/

				grunt.utils.spawn({
					cmd: '/Users/max/Projects/codepainter/bin/codepaint',
					args: ['--style', style, '-i', file]
					}, function(error, output) {

						fs.readFile(files[0], 'utf-8', function(err, data) {
							if(err) {
								console.error('Unable to open source file: %s', err);
								process.exit(1);
							}

							callback(files[0], data, output.toString());
							//var diffResult = compareFormattedWithSource(files[0], data, output.toString());
						});
				});
			}
			//callback(dirPath);
		});
	}

	grunt.registerMultiTask('stylevalidate', 'Validate Javascript style against a style definition', function() {
		var done = this.async(), 
			files = grunt.file.expand(this.file.src);
		grunt.helper('stylevalidate', files, function(error, result) {

		});
	});
	
	grunt.registerHelper('stylevalidate', function(files, done) {
	});
	
	grunt.registerMultiTask('styleformat', 'Format Javascript code into a desired style', function() {
		var done = this.async(), 
			files = grunt.file.expand(this.file.src);
		console.log('Style formatting', files, done);
		grunt.helper('styleformat', files, function(error, result) {
			//console.log(error, result);
		});
	});

	grunt.registerHelper('styleformat', function(files, done) {
		grunt.utils.spawn({
			cmd: 'krasota',
			args: ['-i', files[0], '-b', 'krasota/lib/beautifiers/join-vars', '-b', 'krasota/lib/beautifiers/always-semicolons']
			}, function(error, output) {
				//console.log('\n', output.toString());
		});
	});
	
	grunt.registerMultiTask('styleformatpainter', 'Format Javascript code into a desired style', function() {
		var done = this.async(), 
			files = grunt.file.expand(this.file.src);
		//console.log('Style formatting', files, done);
		grunt.helper('styleformatpainter', files, function(error, result) {
			console.log(error, result);
		});
	});

	grunt.registerHelper('styleformatpainter', function(files, style, done) {
		runCodePainter(files[0], style, function(filename, sourceData, outputData) {
			//console.log(filename, sourceData, outputData);
			var diffed = compareFormattedWithSource(filename, sourceData, outputData);
			//console.log('Found', diffed.length, 'style guideline violations');

			//console.log(outputData);

			for(var i = 0; i < diffed.length; i++) {
				var change = diffed[i];
				console.log(change);
			}
		}, function(err) {
			done(!!err);
		});
	});

	function compareFormattedWithSource(originalFileName, original, formatted) {
		//var diffed = diff.createPatch(originalFileName, original, formatted, "Old Header", "New Header");
		var diffed = diff.diffLines(original, formatted, "Old Header", "New Header");
		console.log(diffed);
		return diffed;
	}
};

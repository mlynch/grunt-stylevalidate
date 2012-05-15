/*
 * grunt-html
 * https://github.com/jzaefferer/grunnt-html
 *
 * Copyright (c) 2012 Jörn Zaefferer
 * Licensed under the MIT license.
 */

var async = require('async');
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
				console.log('Code painter on file', file);

				var input = fs.createReadStream(file);
				input.pause();

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
						});
				});
			}
		});
	}

	grunt.registerMultiTask('styleformat', 'Validate Javascript style against a style definition', function() {
		var done = this.async(), 
			dirs = grunt.file.expand(this.file.src);
		grunt.helper('styleformat', dirs, function(error, result) {
			console.log(error, result);
		});
	});
	
	grunt.registerHelper('styleformat', function(dirs, style, done) {
		var result = [];

		async.forEach(dirs, function(dir, callback) {
			console.log('Validating directory', dir);
			console.log('Running code painter');
			runCodePainter(dir, style, function(filename, sourceData, outputData) {
				result.push({
					file: filename,
					result: 'success',
					output: outputData
				});
				callback();
			}, function(err) {
				result.push({
					file: filename,
					result: 'error',
					message: err
				});
				callback();
			});
		}, function(err) {
			console.log('Done with code painter');
			done(null, result);
		});
	});

	/*
	Old krasota stuff
	grunt.registerHelper('styleformat', function(files, done) {
		grunt.utils.spawn({
			cmd: 'krasota',
			args: ['-i', files[0], '-b', 'krasota/lib/beautifiers/join-vars', '-b', 'krasota/lib/beautifiers/always-semicolons']
			}, function(error, output) {
				//console.log('\n', output.toString());
		});
	});
	*/
	
	grunt.registerMultiTask('stylevalidate', 'Format Javascript code into a desired style', function() {
		var done = this.async(), 
			files = grunt.file.expand(this.file.src);
		//console.log('Style formatting', files, done);
		grunt.helper('stylevalidate', files, function(error, result) {
			console.log(error, result);
		});
	});

	grunt.registerHelper('stylevalidate', function(dirs, style, done) {
		var result = [];
		//for(var i = 0; i < files.length; i++) {
		async.forEach(dirs, function(dir, callback) {
			console.log('Validating directory', dir);
			console.log('Running code painter');
			runCodePainter(dir, style, function(filename, sourceData, outputData) {
				console.log('Got code painter');
				var patch = diff.createPatch(filename, sourceData, outputData, "Old Header", "New Header");
				var diffed = diff.diffLines(sourceData, outputData, "Old Header", "New Header");

				if(diffed.length > 0) {
					console.log('\nStyle validation failed\n');
					result.push({
						file: filename,
						result: 'error',
						diff: patch
					});
				}
				result.push({
					file: filename,
					result: 'success'
				});
				callback();
			}, function(err) {
				result.push({
					file: filename,
					result: 'error',
					message: err
				});
				callback();
			});
		}, function(err) {
			console.log('Done with code painter');
			done(null, result);
		});

	});
};

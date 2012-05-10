/*
 * grunt-html
 * https://github.com/jzaefferer/grunnt-html
 *
 * Copyright (c) 2012 Jörn Zaefferer
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {

	// Please see the grunt documentation for more information regarding task and
	// helper creation: https://github.com/cowboy/grunt/blob/master/docs/toc.md

	// ==========================================================================
	// TASKS
	// ==========================================================================

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
			console.log(error, result);
		});
	});

	grunt.registerHelper('styleformat', function(files, done) {
		grunt.utils.spawn({
			cmd: 'krasota',
			args: ['-i', files[0], '-b', 'krasota/lib/beautifiers/join-vars', '-b', 'krasota/lib/beautifiers/always-semicolons']
			}, function(error, output) {
				console.log('\n', output.toString());
		});
	});
};

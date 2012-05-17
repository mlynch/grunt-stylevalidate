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
var path = require('path');
var codepainter = require('codepainter');

module.exports = function (grunt) {

  /**
   * Offers functionality similar to mkdir -p
   *
   * Asynchronous operation. No arguments other than a possible exception
   * are given to the completion callback.
   */
  function mkdir_p(path, mode, callback, position) {
      mode = mode || 777;
      position = position || 0;
      var parts = require('path').normalize(path).split('/');

      if (position >= parts.length) {
          if (callback) {
              return callback();
          } else {
              return true;
          }
      }

      var directory = parts.slice(0, position + 1).join('/');
      fs.stat(directory, function(err) {
          if (err === null) {
              mkdir_p(path, mode, callback, position + 1);
          } else {
              fs.mkdir(directory, mode, function (err) {
                  if (err) {
                      if (callback) {
                          return callback(err);
                      } else {
                          throw err;
                      }
                  } else {
                      mkdir_p(path, mode, callback, position + 1);
                  }
              });
          }
      });
  }
    

	// Please see the grunt documentation for more information regarding task and
	// helper creation: https://github.com/cowboy/grunt/blob/master/docs/toc.md

	// ==========================================================================
	// TASKS
	// ==========================================================================

	function runCodePainter(directory, style, callback) {
		file.walk(directory, function (unused, dirPath, dirs, files) {
			var i = 0, 
				file, input;

			for (i = 0; i < files.length; i++) {
				file = files[i];

				input = fs.createReadStream(file);
				input.pause();

				grunt.utils.spawn({
					cmd: '/Users/max/Projects/codepainter/bin/codepaint',
					args: ['--style', style, '-i', file]
				}, function (error, output) {
					fs.readFile(file, 'utf-8', function (err, data) {
						if (err) {
							console.error('Unable to open source file: %s', err);
							process.exit(1);
						}

						callback(file, data, output.toString());
					});
				});
			}
		});
	}

	grunt.registerMultiTask('styleformat', 'Validate Javascript style against a style definition', function () {
		var done = this.async(), 
			dirs = grunt.file.expand(this.file.src);
		grunt.helper('styleformat', dirs, JSON.stringify( this.data.style ), this.data.outputDir, function (error, result) {
      if( !error ) {
        grunt.log.writeln('Successfully formatted'.green);
      }
			//console.log(error, result);
		});
	});
	
	grunt.registerHelper('styleformat', function (dirs, style, outputDir, done) {
		var result = [];

    // Make the output directory
    mkdir_p(outputDir, 755, function(err) {
      if(err) {
        console.log(err);
      }

      // For each file in this directory, make any necessary output directories
      // and write the formatted file
      async.forEach(dirs, function (dir, callback) {
        var newDir = path.join(outputDir, dir);

        mkdir_p( newDir, 755, function(err) {
          if( err ) {
            console.log(err);
            return;
          }
          runCodePainter(dir, style, function (filename, sourceData, outputData) {
            var newFile = path.join(outputDir, filename);
            fs.writeFile( newFile, outputData );
            callback();
          }, function (err) {
            callback();
          });
        });
      }, function (err) {
        done(null, result);
      });
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
	
	grunt.registerMultiTask('stylevalidate', 'Format Javascript code into a desired style', function () {
		var done = this.async(), 
			files = grunt.file.expand(this.file.src);

		grunt.helper('stylevalidate', files, JSON.stringify( this.data.style ), function (error, result) {
			//console.log(error, result);
			for(var i = 0; i < result.length; i++) {
				var entry = result[i];

				if(entry.result === "success") {
					grunt.log.writeln(entry.file + ": valid");
				} else {
					grunt.log.writeln(entry.file + ": invalid");
					//grunt.log.writeln(entry.diff);
				}
			}
		});
	});


	grunt.registerHelper('stylevalidate', function (dirs, style, done) {
		var result = [];

    function printDiffLine(line) {
      var value = line.value;
      if (line.added) {
        //value = value.replace(/\n/g, '\n\\n');
        console.log(value.green);
      } else if(line.removed) {
        //value = value.replace(/\n/g, '\n\\n');
        console.log(value.red);
      } else {
        console.log(value);
      }
    }
    
		async.forEach(dirs, function (dir, callback) {
			runCodePainter(dir, style, function (filename, sourceData, outputData) {
				var patch = diff.createPatch(filename, sourceData, outputData, "Old Header", "New Header");
				var diffed = diff.diffLines(sourceData, outputData, "Old Header", "New Header");

        for(var i = 0; i < diffed.length; i++) {
          var line = diffed[i];
          printDiffLine( line );
        }

				if(diffed.length > 0) {
					result.push({
						file: filename,
						result: 'error',
						diff: patch
					});
				} else {
          result.push({
            file: filename,
            result: 'success'
          });
        }
				callback();
			}, function (err) {
				result.push({
					file: filename,
					result: 'error',
					message: err
				});
				callback();
			});
		}, function (err) {
			done(null, result);
		});

	});
};

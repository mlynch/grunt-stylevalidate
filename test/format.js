var grunt = require('grunt');

exports['styleformat'] = {
	setUp: function(done) {
		// setup here
		done();
	},
	'helper': function(test) {
		test.expect(1);
		// tests here
		grunt.helper('styleformat', ['test/badformat.js'], function(error, result) {
			grunt.log.write('HELLO', result);
			if (error) {
				console.log(error);
				throw error;
			}
			test.deepEqual(result, [
				''
			], 'three errors from test/badformat.js');
			test.done();
		});
	}
};

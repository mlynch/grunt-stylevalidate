var grunt = require('grunt');

exports['stylevalidate'] = {
	setUp: function(done) {
		// setup here
		done();
	},
	'helper': function(test) {
		test.expect(1);
		// tests here
		grunt.helper('stylevalidate', ['test/examples'], '{"QuoteType":"double","SpaceAfterControlStatements":"present"}', function(error, result) {
			if (error) {
				console.log('ERROR', error, result);
				throw error;
			}

			test.ok(result, 'Errors detected in style validation');
			/*
			test.deepEqual(result, [
			], 'three errors from test/badformat.js');
			*/
			test.done();
		});
	}
};

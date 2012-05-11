var grunt = require('grunt');

exports['styleformatpainter'] = {
	setUp: function(done) {
		// setup here
		done();
	},
	'helper': function(test) {
		//test.expect(1);
		// tests here
		grunt.helper('styleformatpainter', ['test/examples'], '{"QuoteType":"double","SpaceAfterControlStatements":"present"}', function(error, result) {
			grunt.log.write('HELLO', result);
			if (error) {
				console.log(error);
				throw error;
			}
			/*
			test.deepEqual(result, [
				''
			], 'three errors from test/badformat.js');
			*/
			test.done();
		});
	}
};

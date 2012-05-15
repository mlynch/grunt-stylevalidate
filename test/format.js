var grunt = require('grunt');

exports['styleformat'] = {
	setUp: function(done) {
		// setup here
		done();
	},
	'helper': function(test) {
		test.expect(2);
		// tests here
		grunt.helper('styleformat', ['test/examples'], '{"QuoteType":"double","SpaceAfterControlStatements":"present"}', function(error, result) {
			if (error) {
				console.log(error);
				throw error;
			}

			test.equals( result.length, 1 );
			test.equals( result[0].result, "success", "Successfully formatted file");
			test.done();
		});
	}
};

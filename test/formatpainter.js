var grunt = require('grunt');

exports['styleformatpainter'] = {
	setUp: function(done) {
		// setup here
		done();
	},
	'helper': function(test) {
		test.expect(1);
		// tests here
		grunt.helper('styleformatpainter', ['test/examples'], '{"QuoteType":"double","SpaceAfterControlStatements":"present"}', function(error, result) {
			console.log(error);
			test.deepEqual(result, [{
				result: 'success'
			}], 'Successfull validated file');
			test.done();
		});
	}
};

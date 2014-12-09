module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json')
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.registerTask('default', function() {

		grunt.initConfig({
			uglify: {
				default: {
					files: {
						'./src/deferred.min.js': './src/deferred.js'
					}
				}
			}
		});

		grunt.task.run(['uglify']);
	});
};
'use strict';

module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		project: {
			app: ['app'],
			assets: ['<%= project.app %>/assets'],
			css: ['<%= project.assets %>/sass/style.scss']
		},

		sass: {
			dev: {
				options: {
					style: 'expanded',
					compass: false
				},
				files: {
					'<%= project.assets %>/css/style.css' : '<%= project.css %>',
				}
			}
		},

		watch: {
			sass: {
				files: '<%= project.assets %>/sass/{,*/}*.{scss,sass}',
				tasks: ['sass:dev']
			},
			all: {
				files: 'index.html',
				options: {
					livereload: true
				}
			}
		},

		express: {
			all: {
				options: {
					port: 9000,
					hostname: "0.0.0.0",
					bases: ['app/'],
					livereload: true
				}
			}
		},

		open: {
			all: {
				path: 'http://localhost:<%= express.all.options.port%>',
			}
		},

		'gh-pages': {
			options: {
				base: 'app'
			},
			src: ['**']
		}

	});

	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-express');
	grunt.loadNpmTasks('grunt-open');
	grunt.loadNpmTasks('grunt-gh-pages');

	grunt.registerTask('default', [
		'watch'
	]);

	grunt.registerTask('serve', [
		'express',
		'watch'
	]);
};
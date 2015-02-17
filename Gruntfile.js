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
					bases: ['app'],
					livereload: true
				}
			}
		},

		open: {
			all: {
				path: 'http://localhost:<%= express.all.options.port%>/assets/',
			}
		},

		'gh-pages': {
			options: {
				base: 'app'
			},
			src: ['bower_components/**', 'build/**']
		},

		copy: {
			build: {
				cwd: 'app/assets',
				src: [ '**', '!**/sass', '!**/*.scss' ],
				dest: 'app/build',
				expand: true
			},
	    },

	    clean: {
	    	build: {
	    		src: ['app/build']
	    	},
			cssmin: {
			    src: [ 'app/build/**/*.css', '!app/build/css/style.css' ]
			},
			uglify: {
			    src: [ 'app/build/**/*.js', '!app/build/js/app.js' ]
			},
	    },

	    cssmin: {
		  build: {
		    files: {
		      'app/build/css/style.css': [ 'app/build/**/*.css' ]
		    }
		  }
		},

		uglify: {
		  build: {
		    options: {
		      mangle: false
		    },
		    files: {
		      'app/build/js/app.js': [ 'app/build/**/*.js' ]
		    }
		  }
		},

	});

	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-express');
	grunt.loadNpmTasks('grunt-open');
	grunt.loadNpmTasks('grunt-gh-pages');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');


	grunt.registerTask('default', [
		'watch'
	]);

	grunt.registerTask('serve', [
		'express',
		'watch'
	]);

	grunt.registerTask('build', 
	  'Compiles all of the assets and copies the files to the build directory.', 
	  [ 'clean:build', 'copy', 'cssmin', 'clean:cssmin', 'uglify', 'clean:uglify', 'gh-pages' ]
	);
};
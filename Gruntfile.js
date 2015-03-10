/*jshint node:true */
module.exports = function (grunt) {
    'use strict';
    var karma = {
        files: [
            {pattern: 'src/js/lib.js', watch: false},
            {pattern: 'test/debug.js', watch: false},
            {pattern: 'src/js/**/*', watch: false, included: false}
        ],
        preprocessors: {
            'test/**/*.html': ['html2js'],
            'test/**/*.json': ['html2js']
        },
        exclude: ['src/js/lib/*.js']
    };
    grunt.initConfig({
        jshint: {
            options: {
                jshintrc: true
            },
            all: {
                files: {
                    src: ['src/js/tui/**/*.js', 'src/js/page/**/*.js', 'src/js/module/**/*.js']
                }
            },
            cover: {
                files: {
                    src: ['src/js/page/albumcover/**/*.js']
                }
            }
        },
        karma: {
            options: {
                configFile: 'karma.conf.js',
                autoWatch: true,
                singleRun: false,
                preprocessors: karma.preprocessors,
                exclude: karma.exclude
            },
            //示例
            util: {
                options: {
                    files: karma.files.concat([
                        'test/tui/util/fixtures/*',
                        'test/tui/util/*Spec.js'
                    ]),
                    reporters: ['progress'],
                    browsers: ['Chrome']
                }
            },
            danmu: {
                options: {
                    files: karma.files.concat([
                        'test/module/danmu/fixtures/*',
                        'test/module/danmu/TESTSpec.js'
                    ]),
                    reporters: ['progress'],
                    browsers: ['Chrome']
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-jshint');
};
var gulp = require('gulp');
var Fs = require('fs');

var Util = require('tpm/util');
var ytpmBuild = require('tpm/tasks/build');

var config = require(__dirname + '/tpm-config.js');
var ChildProcess = require('child_process');

console.log('[__dirname]', __dirname);

// 监控src/mobile目录下播放页的js、less更新并打包
gulp.task('mobilePlayer', function(){
	gulp.watch(['src/js/page/mobile/**/*.js','src/js/page/mobile/**/*.tpl'], function(file){
		var path = __dirname + '/src/js/page/mobile/play/main.js';
		try{
		ytpmBuild.run([path], config);
		}catch(e){
			console.error(e);
		}
	});
	gulp.watch('src/css/mobile/**/*.less', function(file){
		var path = __dirname + '/src/css/mobile/play/main2.less';
		ytpmBuild.run([path], config);
	});
});


gulp.task('mobileWatch', function(){
	gulp.watch(['src/js/page/mobile/**/*.js','src/js/page/mobile/**/*.tpl'], function(file){
		var path = __dirname + '/src/js/page/mobile/ch2/favorite.js';
		try{
		ytpmBuild.run([path], config);
		}catch(e){
			console.error(e);
		}
	});
	gulp.watch('src/css/mobile/**/*.less', function(file){
		var path = __dirname + '/src/css/mobile/ch2/favorite.less';
		ytpmBuild.run([path], config);
	});
});

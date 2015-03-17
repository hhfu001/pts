var Fs = require('fs');

exports.root = __dirname;

exports.jira_host = '';

exports.deploy_mail = '';

exports.useClientMail = false; // 是否使用系统自带email发邮件

exports.autoSvnAdd = true; // build、dist目录中新增文件时是否自动执行svn add

exports.main = {
	"js" : [
		"main.js",
		"index.js",
		"admin.js",
		"extend.js"
	],
	"css" : [
		"index.less",
		"main.less",
		"admin.less"
	]
};

exports.libjs = {
	"lib.js" : ["lib/jquery.js", "lib/fix.js", "lib/oz.js", "lib/config.js"],
};

exports.globaljs = [
	"g.js"
];



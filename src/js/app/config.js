define([
], function(){
	return function(){

		var localhost = location.hostname;
		var boot_server;
		if (localhost.indexOf("www.cnfashion.net") >=0) {
			boot_server = "http://"+location.hostname;
		} else {
			boot_server = "http://"+location.hostname+"/yushi";
		}

		window.bootServer = boot_server;
		window.bootDomain = boot_server+'/pc/reg/';
		
	}
});
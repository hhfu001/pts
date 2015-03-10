/*
 * RC4对称加密算法
 * var ctext = rc4("我是明文","我是密钥");
 * var text = rc4(ctext, "我是密钥");
 */
define('tui/encrypt/rc4', function(){

	function rc4(str, key) {
		var s = [], j = 0, x, res = '';
		for (var i = 0; i < 256; i++) {
			s[i] = i;
		}
		for (i = 0; i < 256; i++) {
			j = (j + s[i] + key.charCodeAt(i % key.length)) % 256;
			x = s[i];
			s[i] = s[j];
			s[j] = x;
		}
		i = 0;
		j = 0;
		for (var y = 0; y < str.length; y++) {
			i = (i + 1) % 256;
			j = (j + s[i]) % 256;
			x = s[i];
			s[i] = s[j];
			s[j] = x;
			res += String.fromCharCode(str.charCodeAt(y) ^ s[(s[i] + s[j]) % 256]);
		}
		return res;
	}

	return rc4;

});

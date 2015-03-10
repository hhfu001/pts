
define('tui/velocity', ['tui/velocity/index', 'tui/velocity/parse'], function(Compile, Parser) {
	var cache = {};
	function Velocity(str, context) {
		var obj;
		if (!/[\t\r\n#$ ]/.test(str)) {
			obj = cache[str];
			if (!obj) {
				var tplbox = document.getElementById(str);
				if (tplbox) {
					obj = cache[str] = Velocity(tplbox.innerHTML);
				}
			}
		} else {
			var asts = Parser.parse(str);
			obj = new Compile(asts);
		}
		return !obj ? '' : (context ? obj.render(context) : obj);
	}

	return Velocity;
});

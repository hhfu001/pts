/**
 *The fastest + concise javascript template engine for nodejs and browsers. Partials, custom delimiters and more.
 *
 */
define('tui/dot', [], function(require, exports){
	var encodeHTMLRules = {
			"&": "&#38;",
			"<": "&#60;",
			">": "&#62;",
			'"': '&#34;',
			"'": '&#39;',
			"/": '&#47;'
		},
		matchHTML = /&(?!#?\w+;)|<|>|"|'|\//g;
	exports.encodeHTML = function(str) {
		return str ? (str+'').replace(matchHTML, function(m) {
			return encodeHTMLRules[m] || m;
		}) : str;
	}


	var regex_evaluate = /\{\{([\s\S]+?\}?)\}\}/g,
		regex_interpolate = /\{\{=([\s\S]+?)\}\}/g,
		regex_encode = /\{\{!([\s\S]+?)\}\}/g, // HTML转义
		regex_use = /\{\{#([\s\S]+?)\}\}/g, // 使用子模板
		regex_useParams = /(^|[^\w$])def(?:\.|\[[\'\"])([\w$\.]+)(?:[\'\"]\])?\s*\:\s*([\w$\.]+|\"[^\"]+\"|\'[^\']+\'|\{[^\}]+\})/g,
		regex_define = /\{\{##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\}\}/g, // 定义子模板
		regex_defineParams = /^\s*([\w$]+):([\s\S]+)/,
		regex_conditional = /\{\{\?(\?)?\s*([\s\S]*?)\s*\}\}/g, // if判断
		regex_iterate = /\{\{~\s*(?:\}\}|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\}\})/g, // Array迭代
		cse_start = "'+(",
		cse_end = ")+'",
		cse_endencode = "'+def.encodeHTML(";

	function resolveDefs(block, def) {
		return ((typeof block === 'string') ? block : ''+block)
		.replace(regex_define, function(m, code, assign, value) {
			if (code.indexOf('def.') === 0) {
				code = code.substring(4);
			}
			if (!(code in def)) {
				if (assign === ':') {
					if (regex_defineParams) value.replace(regex_defineParams, function(m, param, v) {
						def[code] = {arg: param, text: v};
					});
					if (!(code in def)) def[code]= value;
				} else {
					new Function("def", "def['"+code+"']=" + value)(def);
				}
			}
			return '';
		})
		.replace(regex_use, function(m, code) {
			if (regex_useParams) code = code.replace(regex_useParams, function(m, s, d, param) {
				if (def[d] && def[d].arg && param) {
					var rw = (d+":"+param).replace(/'|\\/g, '_');
					def.__exp = def.__exp || {};
					def.__exp[rw] = def[d].text.replace(new RegExp("(^|[^\\w$])" + def[d].arg + "([^\\w$])", "g"), "$1" + param + "$2");
					return s + "def.__exp['"+rw+"']";
				}
			});
			var v = new Function("def", "return " + code)(def);
			return "function" == typeof v && "string" == typeof v._tpl ? v._tpl : v ? resolveDefs(v, def) : v;
		});
	}

	function unescape(code) {
		return code.replace(/\\('|\\)/g, "$1").replace(/[\r\t\n]/g, ' ');
	}

	exports.template = function(tmpl, def) {
		def = def || {};
		def.encodeHTML = exports.encodeHTML;
		var sid = 0, indv, comp, compileStr,
			str = (regex_use || regex_define) ? resolveDefs(tmpl, def) : tmpl;

		compileStr = ("var out='" + str
			.replace(/(^|\r|\n)\t* +| +\t*(\r|\n|$)/g,' ')
			.replace(/\r|\n|\t/g,'')
			.replace(/'|\\/g, '\\$&')
			.replace(regex_interpolate, function(m, code) {
				return cse_start + unescape(code) + cse_end;
			})
			.replace(regex_encode, function(m, code) {
				return cse_endencode + unescape(code) + cse_end;
			})
			.replace(regex_conditional, function(m, elsecase, code) {
				return elsecase ?
					(code ? "';}else if(" + unescape(code) + "){out+='" : "';}else{out+='") :
					(code ? "';if(" + unescape(code) + "){out+='" : "';}out+='");
			})
			.replace(regex_iterate, function(m, iterate, vname, iname) {
				if (!iterate) return "';} } out+='";
				sid+=1; indv=iname || "i"+sid; iterate=unescape(iterate);
				return "';if("+iterate+"){var arr"+sid+"="+iterate+","+vname+","+indv+"=0,l"+sid+"=arr"+sid+".length;while("+indv+"<l"+sid+"){"
					+vname+"=arr"+sid+"["+indv+"++];out+='";
			})
			.replace(regex_evaluate, function(m, code) {
				return "';" + unescape(code) + "out+='";
			})
			+ "';return out;")
			.replace(/\n/g, '\\n').replace(/\t/g, '\\t').replace(/\r/g, '\\r')
			.replace(/(\s|;|\}|^|\{)out\+='';/g, '$1').replace(/\+''/g, '')
			.replace(/(\s|;|\}|^|\{)out\+=''\+/g,'$1out+=');

		try {
			comp = new Function('it', compileStr);
			comp._tpl = str;
			return comp;
		} catch (e) {
			if (typeof console !== 'undefined') console.log("Could not create a template function: \n" + compileStr);
			throw e;
		}
	}

});

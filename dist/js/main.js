/**
 * @modified $Author$
 * @version $Rev$
 */
!function($){require.config({enable_ozma:true});define("tui/class",[],function(){function e(){return function(){if(this.initialize)this.initialize.apply(this,arguments)}}function t(t,n){var i=this;var r=e();$.extend(r,i,n);var a=Object.create(i.prototype);a.constructor=r;r.prototype=a;$.extend(r.prototype,t);r.superClass=i.prototype;return r}var n=function(n){var i=e();$.extend(i.prototype,n);i.extend=t;return i};n.extend=t;return n});define("tui/event",["tui/class"],function(e){var t=e({initialize:function(){this.__event=window.Zepto?new window.Zepto.Events:$({})}});var n=t.prototype;["bind","one"].forEach(function(e){n[e]=function(t,n,i){if($.isPlainObject(t))for(var r in t)this[e](r,t[r]);else{var a=this.__event;var o=function(){return n.apply(i||a,arguments.length>0?window.Zepto?arguments:Array.prototype.slice.call(arguments,1):[])};a[e].call(a,t,o);n.guid=o.guid}return this}});["unbind","trigger","triggerHandler"].forEach(function(e){n[e]=function(){var t=this.__event;if(require.debug)console.log("[event] "+this.constructor.__mid+" : "+arguments[0],arguments[1]);var n=t[e].apply(t,arguments);if(require.debug&&n!=t&&void 0!=n)console.log(n);return n}});n.fire=n.trigger;n.firing=n.triggerHandler;t.mix=function(e){return $.extend(e,new t)};return t});define("tui/scrollLoader",[],function(){var e=$(window),t=e.height(),n=[],i={node:function(e,t){e=$(e);return this.y(e.offset()?e.offset().top:0,t?e.outerHeight(true):void 0)},y:function(e,t){this._y=e;this._s=t||0;return this},threshold:function(e){this._th=e;return this},size:function(e){this._s=e;return this},delay:function(e){this._d=e;return this},time:function(e){var t=this;t._t=e;setTimeout(function(){t.start()},e);return t},load:function(){this._cb=this._cb.concat(Array.prototype.slice.call(arguments,0));this._no&&n.push(this);this._no=false;this._f&&this.fire();this._f=false;return this},start:function(){this._enable&&this._cb.forEach(function(e){e()});return this.cancel()},cancel:function(){this.disable();for(var e=0,t=n.length;e<t;e++)if(n[e]==this){n.splice(e,1);break}},enable:function(){this._enable=true;return this},disable:function(){this._enable=false;return this},fire:function(n,i){n=n||e.scrollTop();i=i||t;var r=this;if(r._s){clearTimeout(r._timeout);r._timeout=setTimeout(function(){if(r._enable&&r._y<=n+i+r._th&&r._y+r._s>=n-r._th)a()},r._d)}else if(this._enable&&this._y<=n+i+this._th)a();function a(){r._cb.forEach(function(e){e()});r.cancel()}return this}},r=function(){this._y=0;this._th=0;this._d=0;this._s=0;this._cb=[];this._no=true;this._enable=true;this._timeout=null;this._f=true},a={};r.prototype=i;function o(){var i=e.scrollTop();n.concat().forEach(function(e){e.fire(i,t)})}e.bind("resize",function(){t=e.height();o()});e.bind("scroll",o);for(var s in i)!function(e){a[e]=function(){var t=new r;return t[e].apply(t,Array.prototype.slice.call(arguments,0))}}(s);return a});define("tui/lazyImageLoader",["tui/scrollLoader"],function(e){var t,n,i,r={};function a(r){r=r||{};n=r.size||300;i=r.attr||"alt";t=r.imgs||$("img.lazyImg");var a=[];t.each(function(){var e=$(this),t=e.offset(),n=t.top>0?t.top:e.parents(":visible")&&e.parents(":visible").offset()?e.parents(":visible").offset().top:0;o(n,this,a)});for(var s in a)if(a.hasOwnProperty(s)){var l=$(a[s]);l.each(function(){var t=this;e.y(s).threshold(n).load(function(){var e=$(t);e.attr("src",e.attr(i));e.removeAttr(i);if(e[0].className.indexOf("lazyImg")!==-1)e.removeClass("lazyImg")})})}}function o(e,t,i){e-=e%n;i[e]=i[e]||[];i[e].push(t)}return a});define("module/switchtab",["tui/lazyImageLoader","tui/event"],function(e,t){jQuery.easing["jswing"]=jQuery.easing["swing"];jQuery.extend(jQuery.easing,{easeInOutQuad:function(e,t,n,i,r){if((t/=r/2)<1)return i/2*t*t*t+n;return i/2*((t-=2)*t*t+2)+n}});function n(e){if(e&&e.tagName){var t="a"==e.tagName.toLowerCase()?$(e):$(e).find("a");t=t.length?t:$(e);return(t.attr("rel")||t.attr("href").replace(/.*#(\d+)$/,"$1")||1)-1}else return 0}function i(e){var t=arguments;for(var n=0,i=t.length;n<i;n++){var e=t[n];if(e)clearTimeout(e)}return null}var r=t.extend({initialize:function(t){var a=this;r.superClass.initialize.apply(a,arguments);a.op=t||{};a.op.slide=t.slide||false;a.op.linktab=t.linktab||false;a.op.clicktab=t.clicktab||false;a.op.lazyContent=t.lazyContent||window.gLazyContent||false;var o=a.box=$(t.box);var s=a.tab=$(t.tab||".tab li",o);var l=a.panel=$(t.panel||".c",o);a.size=s.length||l.length;a.loop=t.loop||0;a.current=n(s.filter(".current")[0]);if(a.op.slide){a.scroll=l.parent().parent();a.scroll.scrollLeft(0);e({imgs:l.eq(a.current).find(".lazyImg")});l.parent().append(l.eq(0).clone());a.panel=$(t.panel||".c",o);a.width=l.width();a.delay=t.delay||700;a.loop=(a.loop||5e3)+a.delay;a.anilock=false}if(a.size<2)return;if(a.op.clicktab)s.click(function(e){e.preventDefault();a.go(n(this))});else{if(!a.op.linktab)s.click(function(e){e.preventDefault()});s.mouseenter(function(){i(a.timer,a.looptimer);var e=this;a.timer=setTimeout(function(){a.go(n(e))},30)}).mouseleave(function(){i(a.timer,a.looptimer);a.start()})}if(a.loop){a.check(a.op.clicktab?s:null);a.start()}s.parent().on("click","a",function(e){var t=$(this).attr("href");if(!t||"#"==t||t.length<5)e.preventDefault()})},on:function(e,t){this.box.eventProxy(e,t);return this},go:function(e,t){var n=this;e=t?e:Math.min(Math.max(e,0),n.size-1);n.trigger("before",[n.current,e,n]);if(n.op.slide){if(n.anilock){n.nextstep=function(){n.animate(e,t)};return}n.animate(e,t)}else{var i=n.current;n.current=e%n.size;n.trigger("change",[n.current,n]);n.tab.removeClass("current").eq(n.current).addClass("current");var r=n.op.fade;var a=n.panel;r?a.eq(i).stop().fadeOut(100):a.hide();a.eq(n.current)[r?"fadeIn":"show"](n.op.duration?n.op.duration:"");n.trigger("after",[n.current,n])}},prev:function(e){this.go(this.current-1,e)},next:function(e){this.go(this.current+1,e)},start:function(e){var t=this;if(t.loop){i(t.looptimer);if(e)t.start();t.looptimer=setTimeout(function(){t.start();t.next(true)},t.loop)}},stop:function(){i(this.looptimer)},check:function(e){var t=this;(e||t.panel).mouseenter(function(){i(t.looptimer)}).mouseleave(function(){i(t.looptimer);t.start()})},animate:function(t,n){var r=this;var a=r.current;if(r.anilock||a==t)return;i(r.looptimer);var o=r.size,s=r.width,l=r.panel,u=r.scroll;var c=a>t?0:s;var f=a>t?s:0;t%=n?o+1:o;e({imgs:l.eq(t).show().find(".lazyImg")});u.scrollLeft(f);r.tab.removeClass("current").eq(t%o).addClass("current");u.animate({scrollLeft:c},r.delay,"easeInOutQuad",function(){l.eq(a).hide();if(n&&t==o){t%=o;e({imgs:l.eq(0).show().find(".lazyImg")});l.eq(o).hide()}u.scrollLeft(0);r.current=t;r.anilock=false;r.trigger("after",[r.current,r]);if(r.nextstep){r.nextstep();r.nextstep=null}if(n)r.start()});r.anilock=true}});return r});define("tui/placeholder",["tui/event"],function(e){var t="placeholder"in document.createElement("input"),n=[],i=e.extend({initialize:function(e,n){var r=this;i.superClass.initialize.apply(r,arguments);e=$(e);r.item=e;var a=r.ph=e.attr("placeholder");if(""==a)return;if(n)r.state2=n;else if(a==e.val()||""==e.val())r.state2=true;else r.state2=false;if(!t&&r.state2){e.val(a);r.trigger("placeholder",[e,r.state2])}r.focus=function(){if(r.state2){!t&&e.val("");r.state2=false;r.trigger("placeholder",[e,r.state2])}};r.blur=function(){var n=e.val();if(""==n)!t&&e.val(a);r.state2=""==n;if(r.state2)r.trigger("placeholder",[e,r.state2])};e.focus(r.focus).bind("blur",r.blur)},state:function(e){var t=this;if(void 0!==e){t.state2=e;if(e)t.restore()}return t.state2},restore:function(){var e=this;if(!e.state2&&!t){e.state2=true;e.item.val(e.ph);e.trigger("placeholder",[e.item,e.state2])}},cancel:function(){var e=this;e.item.unbind("focus",e.focus).unbind("blur",e.blur);var t=n.indexOf(e.item[0]);if(t>-1)n.splice(t,1);return e}});i.NATIVE=t;return i});define("tui/limitTextarea",["tui/event"],function(e){var t=$.browser.msie&&"9.0"==$.browser.version;function n(e){var t=parseInt(e.attr("maxlength")),n=e.val();if(!isNaN(t)&&n.length>t){var i,r,a=document.selection.createRange(),o=document.body.createTextRange();o.moveToElementText(e[0]);r=a.getBookmark();for(i=0;o.compareEndPoints("StartToStart",a)<0&&0!==a.moveStart("character",-1);i++)if("\n"==n.charAt(i))i++;e.val(n.substr(0,Math.min(t,i-1))+n.substr(i,Math.min(t,n.length)));if(n.length!=i){var s=e[0].createTextRange();s.collapse(true);s.moveEnd("character",i-1);s.moveStart("character",i-1);s.select()}}}function i(e,t){var n=t.val();e.trigger("input",[n.length,parseInt(t.attr("maxlength"))])}var r=e.extend({initialize:function(e){var a=this;r.superClass.initialize.apply(a,arguments);if("string"==$.type(e))e=$(e);if(window.addEventListener){e.bind("input",function(){if(t)n(e);i(a,e)});if(t)e.bind("keydown cut paste",function(t){switch(t.type){case"keydown":if(46!=t.keyCode&&8!=t.keyCode)return;default:setTimeout(function(){n(e);i(a,e)},0)}})}else e.bind("propertychange",function(){n(e);i(a,e)})}});return r});define("tui/html5formcore",["tui/event","tui/limitTextarea","tui/placeholder"],function(e,t,n){var i=$.browser.msie&&"9.0"==$.browser.version,r={url:/^\s*[a-zA-z]+:\/\/.*$/,email:/^\s*\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*\s*$/,number:/^\s*-?\.*\d+\s*$/,date:/^\s*\d{2,4}-\d{1,2}-\d{1,2}\s*$/,time:/^\s*\d{1,2}:\d{1,2}(:\d{1,2}(\.\d{1,3})?)?\s*$/,color:/^\s*#?[a-z\d]{3,6}\s*$/},a=document.createElement("input"),o="autofocus"in a,s="form"in a,l=":input:not(:button, :submit, :radio, :checkbox, :reset)",u=e.extend({initialize:function(e,r,a){var s=this;u.superClass.initialize.apply(s,arguments);if("string"==$.type(e))e=$(e);s.form2=e;s.type2=a=a||u.VALID_BLUR;s.list2=[];s.ph2=[];if("function"!=$.type(r)){a=r;r=void 0}if(!e[0]||"FORM"!=e[0].nodeName)return;if(!o)e.find(":input").each(function(){if(null!=this.getAttribute("autofocus")){var e=$(this);e.focus()}});if(!n.NATIVE)e.find("input[placeholder]").each(function(){var e=$(this),t=new n(e);s.list2.push(this);s.ph2.push(t);t.bind("placeholder",function(e,t){s.trigger("placeholder",[e,t])})});s.focusout2=function(){e.attr("novalidate")||s.valid($(this))};if(a==u.VALID_BLUR)e.delegate(l,"focusout",s.focusout2);var c=[];s.focusin2=function(){var e=$(this);if("TEXTAREA"==this.nodeName&&c.indexOf(this)==-1){new t(e);c.push(this)}s.trigger("focus",[e])};e.delegate(l,"focusin",s.focusin2);s.input2=function(){s.trigger("input",[$(this)])};s.keydown_cut_paste2=function(e){var t=$(this);switch(e.type){case"keydown":if(46!=e.keyCode&&8!=e.keyCode)return;default:setTimeout(function(){s.trigger("input",[t])},0)}};if(window.addEventListener){e.delegate(l,"input",s.input2);if(i)e.delegate("textarea","keydown cut paste",s.keydown_cut_paste2)}else e.delegate(l,"keydown contextmenu",s.input2);e.delegate("input:text[name]","keypress",function(t){if(13==t.keyCode){t.preventDefault();e.submit()}});s.click2=function(t){t.preventDefault();e.submit()};e.delegate("input:submit","click",s.click2);s.submit2=function(t){var n=e.attr("novalidate")||s.validAll();if(n){if(r)return r.call(this,t)}else t.preventDefault()};e.bind("submit",s.submit2)},valid:function(e){var t=this.form2,n=e.val(),i=(e[0].getAttribute("type")||"text").toLowerCase(),a=e.attr("pattern"),o=null!=e[0].getAttribute("required"),s=this.list2.indexOf(e[0]);if(o&&(""==n||s!=-1&&this.ph2[s].state())&&!this.ignore(e)){this.trigger("required",[e]);return false}if(n&&n.length&&"INPUT"==e[0].nodeName&&!this.ignore(e)&&r[i]&&!r[i].test(n)){this.trigger(i,[e]);return false}if(n&&n.length&&"number"==i&&!this.ignore(e)){var l=parseFloat(e.attr("max")),u=parseFloat(e.attr("min")),c=parseFloat(n);if(!isNaN(l)&&c>l){this.trigger("max",[e,l]);return false}if(!isNaN(u)&&c<u){this.trigger("min",[e,u]);return false}}if(a&&a.length&&"text"==i&&n&&!this.ignore(e)){if(s!=-1&&this.ph2[s].state())return true;a=new RegExp(a);if(!a.test(n)){this.trigger("pattern",[e]);return false}}return true},validAll:function(){var e=this,t=true,n=e.form2.find(l);n.each(function(i){t=t&&e.valid(n.eq(i))});return t},ignore:function(e){if("string"==$.type(e))e=$(e);return e.prop("disabled")||null!=e[0].getAttribute("novalidate")},type:function(){return this.type2},placeholder:function(e,t){e=$(e);var n=this.list2.indexOf(e[0]);if(n!=-1)return this.ph2[n];console.error("placeholder not found: "+e[0])},cancel:function(){this.form2.undelegate(l,"focusout",this.focusout2);this.form2.undelegate(l,"focusin",this.focusin2);this.form2.undelegate(l,"input",this.input2);if(i)this.form2.undelegate("textarea","keydown cut paste",this.keydown_cut_paste2);this.form2.undelegate(l,"keydown contextmenu",this.input2);this.form2.undelegate("input:submit","click",this.click2);this.form2.unbind("submit",this.submit2);this.ph2.forEach(function(e){e.cancel()})}});u.VALID_BLUR=1;u.VALID_SUBMIT=2;u.SELECTOR=l;return u});define("tui/template",[],function(e,t){t.ns=function(e,t,n){var i,r=n||window,a=e.split(".").reverse();while((i=a.pop())&&a.length>0){if("undefined"===typeof r[i])r[i]={};else if("object"!==typeof r[i])return false;r=r[i]}if("undefined"!==typeof t)r[i]=t;return r[i]};t.format=function(e,t){return e.replace(/<%\=(\w+)%>/g,function(e,n){return null!=t[n]?t[n]:""})};t.escapeHTML=function(e){e=e||"";var t={"<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;","{":"&#123;","}":"&#125;","@":"&#64;"};return e.replace(/[<>'"\{\}@]/g,function(e){return t[e]})};t.substr=function(e,t,n){if(!e||"string"!==typeof e)return"";var i=e.substr(0,t).replace(/([^\x00-\xff])/g,"$1 ").substr(0,t).replace(/([^\x00-\xff])\s/g,"$1");return n?n.call(i,i):e.length>i.length?i+"...":i};t.strsize=function(e){return e.replace(/([^\x00-\xff]|[A-Z])/g,"$1 ").length};var n=this.document;t.tplSettings={_cache:{},evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g};t.tplHelpers={mix:$.extend,escapeHTML:t.escapeHTML,substr:t.substr,include:i,_has:function(e){return function(n){return t.ns(n,void 0,e)}}};function i(e,r,a){var o,s=t.tplSettings,l=a?"#"+a:"";if(!/[\t\r\n% ]/.test(e)){o=s._cache[e+l];if(!o){var u=n.getElementById(e);if(u)o=s._cache[e+l]=i(u.innerHTML,false,a)}}else{var c="var __p=[];"+(a?"":"with(obj){")+"var mix=api.mix,escapeHTML=api.escapeHTML,substr=api.substr,include=api.include,has=api._has("+(a||"obj")+");"+"__p.push('"+e.replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(s.interpolate,function(e,t){return"',"+t.replace(/\\'/g,"'")+",'"}).replace(s.evaluate||null,function(e,t){return"');"+t.replace(/\\'/g,"'").replace(/[\r\n\t]/g," ")+"__p.push('"}).replace(/\r/g,"\\r").replace(/\n/g,"\\n").replace(/\t/g,"\\t")+"');"+(a?"":"}")+"return __p.join('');";try{o=new Function(a||"obj","api",c)}catch(f){console.log("Could not create a template function: \n"+c)}}return!o?"":r?o(r,t.tplHelpers):o}t.convertTpl=i;t.reloadTpl=function(e){delete t.tplSettings._cache[e]}});define("tui/html5form",["tui/template","tui/html5formcore","tui/placeholder"],function(e,t,n){var i='<div class="g_tip"><h3><%=msg%></h3><% if(info && info.length) { %><p><%=info%></p><% } %><span class="arrow"></span></div>',r={url:"url格式不合法",email:"email格式不合法",number:"请输入一个数字",max:"值必须小于或等于",min:"值必须大于或等于",date:"日期格式不合法",time:"时间格式不合法",color:"颜色格式不合法",required:"请填写此项",pattern:"不符合要求格式"},a=$("body"),o=$(window),s=t.extend({initialize:function(){var e=this;s.superClass.initialize.apply(e,arguments);e.phs3=[],e.msg3=[],e.list3=[],e.action3=[];e.bind("required",function(t){e.tip(t,r["required"])});e.bind("url",function(t){e.tip(t,r["url"])});e.bind("email",function(t){e.tip(t,r["email"])});e.bind("number",function(t){e.tip(t,r["number"])});e.bind("max",function(t,n){e.tip(t,r["max"]+n)});e.bind("min",function(t,n){e.tip(t,r["min"]+n)});e.bind("date",function(t){e.tip(t,r["date"])});e.bind("time",function(t){e.tip(t,r["time"])});e.bind("color",function(t){e.tip(t,r["color"])});e.bind("required",function(t){e.tip(t,r["required"])});e.bind("pattern",function(t){e.tip(t,r["pattern"])});e.bind("placeholder",function(e,t){e=$(e);if(t)e.addClass("g_placeholder");else e.removeClass("g_placeholder")});e.bind("input",function(t){e.clear(t)});if(!n.NATIVE){var t=e.form2.find("input[placeholder]");t.each(function(t,n){var i=e.placeholder(n),r=i.state();if(r)$(n).addClass("g_placeholder")})}},tip:function(t,n){console&&console.warn&&console.warn(t);var r=this;r.clearAll();r.list3.push(t);r.phs3.push(t[0]);t.addClass("g_valid");var s=$(e.convertTpl(i,{msg:n,info:t.attr("title")||""}));s.css({left:t.offset().left+200,top:t.offset().top+7});s.click(function(){t.focus()});r.msg3.push(s);a.append(s);var l=s.offset().top+s.outerHeight()-o.scrollTop()-o.height();if(l>0)o.scrollTop(o.scrollTop()+l);var u=4,c;r.action3.push(c=setInterval(function(){s.css("left",s.offset().left+u);if(u<0)++u;if(0==u){clearInterval(c);return}u*=-1},50));if(o.scrollTop()>t.offset().top)o.scrollTop(t.offset().top);else if(o.scrollTop()+o.height()<t.offset().top+t.height())o.scrollTop(t.offset().top+t.height()-o.height());if(r.ct)clearTimeout(r.ct);r.ct=setTimeout(function(){r.clearAll()},5e3);return this},clear:function(e){if("string"==$.type(e))e=$(e);var t=this.phs3.indexOf(e[0]);if(t!=-1){this.phs3.splice(t,1);this.list3.splice(t,1);this.msg3[t].remove();this.msg3.splice(t,1);clearInterval(this.action3[t]);this.action3.splice(t,1);e.removeClass("g_valid")}return this},clearAll:function(){this.phs3=[];while(this.msg3.length)this.msg3.pop().remove();while(this.list3.length)this.list3.pop().removeClass("g_valid");while(this.action3.length){var e=this.action3.pop();clearInterval(e)}return this}});return s});define("app/form",["tui/html5form"],function(e){return function(t){var n=$(t).find("form");var i=new e(n);var r=n.find("[name=name]");var a=n.find("[name=pwd]");var o=n.find("[name=tpwd]");var s=n.find("[name=company]");var l=n.find("[name=linker]");var u=n.find("[name=phone]");var c=n.find("[name=email]");var f=n.find(".code");var p=n.find("[name=code]");var d=false;var h=false;var v=false;n.on("click",".btn-reg",function(e){e.preventDefault();if(!v){i.tip(r,"用户名无效");return}var t=a.val();if(t.length<6||!/[^\u4e00-\u9fa5]+/.test(t)){i.tip(a,"至少输入六位数密码");return}if(t!==o.val()){i.tip(a,"输入的两次密码不一致");return}if(s.length){if(s.val().trim().length<2){i.tip(s,"请填写正确的名称");return}if(!/^1[^2]\d{9}$/.test(u.val().trim())){i.tip(u,"手机格式不符合");return}if(l.val().trim().length<2){i.tip(l,"请填写正确的联系人");return}}if(!/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(c.val().trim())||!h){i.tip(c,"邮箱无效或已注册!");return}if(!d){i.tip(p,"验证码无效");return}n.submit()}).on("click",".code",function(e){e.preventDefault();var t=$(this);var i=n.find(".idcode");var r=t.attr("codeId");t.attr("src","get_code.php?load=yes&id="+r+"&"+Math.random())});a.on("blur",function(){var e=$(this);var t=e.val();if(!/[^\u4e00-\u9fa5]+/.test(t)||t.length<6)i.tip(e,"输入至少6位的除汉字外的字符")});o.on("blur",function(){var e=$(this);if(e.val().trim()!==a.val())i.tip(e,"两次输入的密码不一致")});r.on("blur",function(){var e=$(this);var t=e.val();if(t.length<1){i.tip(e,"请填写账号名称");return}$.post("check.php",{act:"name",v:t},function(t){v=1==t;if(!v)i.tip(e,"账号已存在！")},"json")});c.on("blur",function(){var e=$(this);var t=e.val();if(!/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(t)){i.tip(e,"请填写邮箱");return}$.post("check.php",{act:"email",v:t},function(t){h=1==t;if(!h)i.tip(e,"该邮箱已注册！")},"json")});p.on("input",function(){var e=$(this);var t=e.val();if(5==t.length)$.post("check.php",{act:"code",v:t,id:f.attr("codeId")},function(t){d=1==t;if(!d){i.tip(e,"验证码无效");f.attr("src","get_code.php?load=yes&id="+f.attr("codeId")+"&"+Math.random())}},"json")})}});define("app/share",[],function(){return function(){window._bd_share_config={common:{bdSnsKey:{},bdText:"",bdMini:"2",bdPic:"",bdStyle:"0",bdSize:"16"},share:{},image:false,selectShare:false};with(document)0[(getElementsByTagName("head")[0]||body).appendChild(createElement("script")).src="http://bdimg.share.baidu.com/static/api/js/share.js?v=89860593.js?cdnversion="+~(-new Date/36e5)]}});define("tui/art",[],function(){var e=window;var t=function(e,n){return t["string"===typeof n?"compile":"render"].apply(t,arguments)};t.version="2.0.2";t.openTag="<%";t.closeTag="%>";t.isEscape=true;t.isCompress=false;t.parser=null;t.render=function(e,n){var i=t.get(e)||r({id:e,name:"Render Error",message:"No Template"});return i(n)};t.compile=function(e,i){var o=arguments;var s=o[2];var l="anonymous";if("string"!==typeof i){s=o[1];i=o[0];e=l}try{var u=a(e,i,s)}catch(c){c.id=e||i;c.name="Syntax Error";return r(c)}function f(n){try{return new u(n,e)+""}catch(a){if(!s)return t.compile(e,i,true)(n);return r(a)()}}f.prototype=u.prototype;f.toString=function(){return u.toString()};if(e!==l)n[e]=f;return f};var n=t.cache={};var i=t.helpers=function(){var e=function(t,n){if("string"!==typeof t){n=typeof t;if("number"===n)t+="";else if("function"===n)t=e(t.call(t));else t=""}return t};var n={"<":"&#60;",">":"&#62;",'"':"&#34;","'":"&#39;","&":"&#38;"};var i=function(t){return e(t).replace(/&(?![\w#]+;|#\d+)|[<>"']/g,function(e){return n[e]})};var r=Array.isArray||function(e){return"[object Array]"==={}.toString.call(e)};var a=function(e,t){if(r(e))for(var n=0,i=e.length;n<i;n++)t.call(e,e[n],n,e);else for(n in e)t.call(e,e[n],n)};return{$include:t.render,$string:e,$escape:i,$each:a}}();t.helper=function(e,t){i[e]=t};t.onerror=function(t){var n="Template Error\n\n";for(var i in t)n+="<"+i+">\n"+t[i]+"\n\n";if(e.console)console.error(n)};t.get=function(i){var r;if(n.hasOwnProperty(i))r=n[i];else if("document"in e){var a=document.getElementById(i);if(a){var o=a.value||a.innerHTML;r=t.compile(i,o.replace(/^\s*|\s*$/g,""))}}return r};var r=function(e){t.onerror(e);return function(){return"{Template Error}"}};var a=function(){var e=i.$each;var n="break,case,catch,continue,debugger,default,delete,do,else,false"+",finally,for,function,if,in,instanceof,new,null,return,switch,this"+",throw,true,try,typeof,var,void,while,with"+",abstract,boolean,byte,char,class,const,double,enum,export,extends"+",final,float,goto,implements,import,int,interface,long,native"+",package,private,protected,public,short,static,super,synchronized"+",throws,transient,volatile"+",arguments,let,yield"+",undefined";var r=/\/\*[\w\W]*?\*\/|\/\/[^\n]*\n|\/\/[^\n]*$|"(?:[^"\\]|\\[\w\W])*"|'(?:[^'\\]|\\[\w\W])*'|[\s\t\n]*\.[\s\t\n]*[$\w\.]+/g;var a=/[^\w$]+/g;var o=new RegExp(["\\b"+n.replace(/,/g,"\\b|\\b")+"\\b"].join("|"),"g");var s=/^\d[^,]*|,\d[^,]*/g;var l=/^,+|,+$/g;var u=function(e){return e.replace(r,"").replace(a,",").replace(o,"").replace(s,"").replace(l,"").split(/^$|,+/)};return function(n,r,a){var o=t.openTag;var s=t.closeTag;var l=t.parser;var c=r;var f="";var p=1;var d={$data:1,$id:1,$helpers:1,$out:1,$line:1};var h={};var v="var $helpers=this,"+(a?"$line=0,":"");var g="".trim;var m=g?["$out='';","$out+=",";","$out"]:["$out=[];","$out.push(",");","$out.join('')"];var b=g?"if(content!==undefined){$out+=content;return content;}":"$out.push(content);";var $="function(content){"+b+"}";var w="function(id,data){"+"data=data||$data;"+"var content=$helpers.$include(id,data,$id);"+b+"}";e(c.split(o),function(e,t){e=e.split(s);var n=e[0];var i=e[1];if(1===e.length)f+=_(n);else{f+=k(n);if(i)f+=_(i)}});c=f;if(a)c="try{"+c+"}catch(e){"+"throw {"+"id:$id,"+"name:'Render Error',"+"message:e.message,"+"line:$line,"+"source:"+C(r)+".split(/\\n/)[$line-1].replace(/^[\\s\\t]+/,'')"+"};"+"}";c=v+m[0]+c+"return new String("+m[3]+");";try{var y=new Function("$data","$id",c);y.prototype=h;return y}catch(x){x.temp="function anonymous($data,$id) {"+c+"}";throw x}function _(e){p+=e.split(/\n/).length-1;if(t.isCompress)e=e.replace(/[\n\r\t\s]+/g," ").replace(/<!--.*?-->/g,"");if(e)e=m[1]+C(e)+m[2]+"\n";return e}function k(e){var n=p;if(l)e=l(e);else if(a)e=e.replace(/\n/g,function(){p++;return"$line="+p+";"});if(0===e.indexOf("=")){var r=0!==e.indexOf("==");e=e.replace(/^=*|[\s;]*$/g,"");if(r&&t.isEscape){var o=e.replace(/\s*\([^\)]+\)/,"");if(!i.hasOwnProperty(o)&&!/^(include|print)$/.test(o))e="$escape("+e+")"}else e="$string("+e+")";e=m[1]+e+m[2]}if(a)e="$line="+n+";"+e;T(e);return e+"\n"}function T(t){t=u(t);e(t,function(e){if(!d.hasOwnProperty(e)){z(e);d[e]=true}})}function z(e){var t;if("print"===e)t=$;else if("include"===e){h["$include"]=i["$include"];t=w}else{t="$data."+e;if(i.hasOwnProperty(e)){h[e]=i[e];if(0===e.indexOf("$"))t="$helpers."+e;else t=t+"===undefined?$helpers."+e+":"+t}}v+=e+"="+t+","}function C(e){return"'"+e.replace(/('|\\)/g,"\\$1").replace(/\r/g,"\\r").replace(/\n/g,"\\n")+"'"}}}();return t});define("app/nav",["tui/art"],function(e,t,n){function i(){$("#header").on("mouseenter",".icon-weixin",function(){$(this).find(".qrcode").css({display:"inline-block"})}).on("mouseleave",".share",function(){$(this).find(".qrcode").css({display:"none"})})}function r(e){e=$.extend({top:165,disabled:true},e);var t=$(window);var n=t.height();var i=$("#header .m-nav");var r=0;var a=e.top;if(e.disabled)return;var o=t.scrollTop()<=a;if(!o){i.addClass("fixed");r=1}t.bind("scroll",function(){o=t.scrollTop()<=a;if(!o&&0===r){i.addClass("fixed");r=1}if(o&&1===r){i.removeClass("fixed");r=0}})}n.init=function(e){r(e);i()}});require(["app/nav","app/share","app/form","module/switchtab"],function(e,t,n,i){e.init({disabled:false});t();var r=$("#albumShow");var a=new i({box:r,panel:"li",slide:true,loop:6e5});o(0);o(1);a.bind("before",function(e,t){o(t);o(t+1)});r.bind("mouseenter",function(){a.stop()}).bind("mouseleave",function(){a.start()});r.delegate(".next","click",function(e){e.preventDefault();var t=a.current;if(t>a.size)alert("这已经是第一页了！");else a.next(true)}).delegate(".prev","click",function(e){e.preventDefault();var t=a.current;if(t<1)alert("这已经是最后一页了！");else a.prev(true)});function o(e){var t=a.panel.eq(e).find("img");var n=t.attr("lazyImg");if(t.length&&n){t.attr("src",n);t.removeAttr("lazyImg")}}var s=[270,909,2365,3398];var l=$(window);$(".page-post").on("click",".go",function(e){var t=$(this);var n=s[t.attr("link")];if(!n)return;l.animate({scrollTop:n},500)});l.on("scroll",function(){var e=l.scrollTop();$(".gotop")[e>900?"show":"hide"]()});$("#pageReg").on("click",".btn",function(e){e.preventDefault();var t=$(this);if(t.hasClass("current"))return;t.addClass("current").siblings().removeClass("current");if(0==t.index()){$(".form-enter").hide();$(".form-personal").show()}else{$(".form-enter").show();$(".form-personal").hide()}});n(".form-personal");n(".form-enter")})}(window.jQuery);;
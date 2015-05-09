/**
 * @modified $Author$
 * @version $Rev$
 */
!function(e){require.config({enable_ozma:true});define("module/flexisel",[],function(){!function(e){e.fn.flexisel=function(t){var i=e.extend({visibleItems:4,animationSpeed:200,autoPlay:false,autoPlaySpeed:3e3,pauseOnHover:true,setMaxWidthAndHeight:false,enableResponsiveBreakpoints:false,responsiveBreakpoints:{portrait:{changePoint:480,visibleItems:1},landscape:{changePoint:640,visibleItems:2},tablet:{changePoint:768,visibleItems:3}}},t);var n=e(this);var r=e.extend(i,t);var a;var o=true;var s=r.visibleItems;var l={init:function(){return this.each(function(){l.appendHTML();l.setEventHandlers();l.initializeItems()})},initializeItems:function(){var t=n.parent();var i=t.height();var r=n.children();var o=t.width();a=o/s;r.width(a);r.last().insertBefore(r.first());r.last().insertBefore(r.first());n.css({left:-a});n.fadeIn();e(window).trigger("resize")},appendHTML:function(){n.addClass("nbs-flexisel-ul");n.wrap("<div class='nbs-flexisel-container'><div class='nbs-flexisel-inner'></div></div>");n.find("li").addClass("nbs-flexisel-item");if(r.setMaxWidthAndHeight){var t=e(".nbs-flexisel-item > img").width();var i=e(".nbs-flexisel-item > img").height();e(".nbs-flexisel-item > img").css("max-width",t);e(".nbs-flexisel-item > img").css("max-height",i)}e("<div class='nbs-flexisel-nav-left'></div><div class='nbs-flexisel-nav-right'></div>").insertAfter(n);var a=n.children().clone();n.append(a)},setEventHandlers:function(){var t=n.parent();var i=n.children();var c=t.find(e(".nbs-flexisel-nav-left"));var u=t.find(e(".nbs-flexisel-nav-right"));e(window).on("resize",function(r){l.setResponsiveEvents();var o=e(t).width();var c=e(t).height();a=o/s;i.width(a);n.css({left:-a})});e(c).on("click",function(e){l.scrollLeft()});e(u).on("click",function(e){l.scrollRight()});if(true==r.pauseOnHover)e(".nbs-flexisel-item").on({mouseenter:function(){o=false},mouseleave:function(){o=true}});if(true==r.autoPlay)setInterval(function(){if(true==o)l.scrollRight()},r.autoPlaySpeed)},setResponsiveEvents:function(){var t=e("html").width();if(true==r.enableResponsiveBreakpoints)if(t<r.responsiveBreakpoints.portrait.changePoint)s=r.responsiveBreakpoints.portrait.visibleItems;else if(t>r.responsiveBreakpoints.portrait.changePoint&&t<r.responsiveBreakpoints.landscape.changePoint)s=r.responsiveBreakpoints.landscape.visibleItems;else if(t>r.responsiveBreakpoints.landscape.changePoint&&t<r.responsiveBreakpoints.tablet.changePoint)s=r.responsiveBreakpoints.tablet.visibleItems;else s=r.visibleItems},scrollLeft:function(){if(true==o){o=false;var e=n.parent();var t=e.width();a=t/s;var i=n.children();n.animate({left:"+="+a},{queue:false,duration:r.animationSpeed,easing:"linear",complete:function(){i.last().insertBefore(i.first());l.adjustScroll();o=true}})}},scrollRight:function(){if(true==o){o=false;var e=n.parent();var t=e.width();a=t/s;var i=n.children();n.animate({left:"-="+a},{queue:false,duration:r.animationSpeed,easing:"linear",complete:function(){i.first().insertAfter(i.last());l.adjustScroll();o=true}})}},adjustScroll:function(){var e=n.parent();var t=n.children();var i=e.width();a=i/s;t.width(a);n.css({left:-a})}};if(l[t])return l[t].apply(this,Array.prototype.slice.call(arguments,1));else if("object"===typeof t||!t)return l.init.apply(this);else e.error('Method "'+method+'" does not exist in flexisel plugin!')}}(jQuery)});define("tui/class",[],function(){function t(){return function(){if(this.initialize)this.initialize.apply(this,arguments)}}function i(i,n){var r=this;var a=t();e.extend(a,r,n);var o=Object.create(r.prototype);o.constructor=a;a.prototype=o;e.extend(a.prototype,i);a.superClass=r.prototype;return a}var n=function(n){var r=t();e.extend(r.prototype,n);r.extend=i;return r};n.extend=i;return n});define("tui/event",["tui/class"],function(t){var i=t({initialize:function(){this.__event=window.Zepto?new window.Zepto.Events:e({})}});var n=i.prototype;["bind","one"].forEach(function(t){n[t]=function(i,n,r){if(e.isPlainObject(i))for(var a in i)this[t](a,i[a]);else{var o=this.__event;var s=function(){return n.apply(r||o,arguments.length>0?window.Zepto?arguments:Array.prototype.slice.call(arguments,1):[])};o[t].call(o,i,s);n.guid=s.guid}return this}});["unbind","trigger","triggerHandler"].forEach(function(e){n[e]=function(){var t=this.__event;if(require.debug)console.log("[event] "+this.constructor.__mid+" : "+arguments[0],arguments[1]);var i=t[e].apply(t,arguments);if(require.debug&&i!=t&&void 0!=i)console.log(i);return i}});n.fire=n.trigger;n.firing=n.triggerHandler;i.mix=function(t){return e.extend(t,new i)};return i});define("module/slider",["tui/event"],function(t){function i(t){if(t&&t.tagName){var i="a"==t.tagName.toLowerCase()?e(t):e(t).find("a");i=i.length?i:e(t);return(i.attr("rel")||i.attr("href").replace(/.*#(\d+)$/,"$1")||1)-1}else return 0}function n(e){var t=arguments;for(var i=0,n=t.length;i<n;i++){var e=t[i];if(e)clearTimeout(e)}return null}function r(){}var a=t.extend({initialize:function(t){var r=this;a.superClass.initialize.apply(r,arguments);r.op=t||{};r.op.slide=t.slide||false;r.op.linktab=t.linktab||false;r.op.clicktab=t.clicktab||false;var o=r.box=e(t.box);var s=r.tab=e(t.tab||".tab li",o);var l=r.panel=e(t.panel||".c",o);r.size=s.length||l.length;r.loop=t.loop||0;r.current=i(s.filter(".current")[0]);if(r.size<2)return;if(r.op.clicktab)s.click(function(e){e.preventDefault();r.go(i(this))});else{if(!r.op.linktab)s.click(function(e){e.preventDefault()});s.mouseenter(function(){n(r.timer,r.looptimer);var e=this;r.timer=setTimeout(function(){r.go(i(e))},30)}).mouseleave(function(){n(r.timer,r.looptimer);r.start()})}if(r.loop){r.check(r.op.clicktab?s:null);r.start()}s.parent().on("click","a",function(t){var i=e(this).attr("href");if(!i||"#"==i||i.length<5)t.preventDefault()})},go:function(e,t){var i=this;e=t?e:Math.min(Math.max(e,0),i.size-1);i.trigger("before",[i.current,e,i]);var n=i.current;i.current=e%i.size;i.tab.removeClass("current").eq(i.current).addClass("current");var r=i.op.fade;var a=i.panel;var o=i.op.duration?i.op.duration:"25";a.eq(n)[r?"fadeOut":"hide"](o);a.eq(i.current)[r?"fadeIn":"show"](o);i.trigger("after",[i.current,i])},prev:function(e){this.go(this.current-1,e)},next:function(e){this.go(this.current+1,e)},start:function(e){var t=this;if(t.loop){n(t.looptimer);if(e)t.start();t.looptimer=setTimeout(function(){t.start();t.next(true)},t.loop)}},stop:function(){n(this.looptimer)},check:function(e){var t=this;(e||t.panel).mouseenter(function(){n(t.looptimer)}).mouseleave(function(){n(t.looptimer);t.start()})}});return a});define("tui/placeholder",["tui/event"],function(t){var i="placeholder"in document.createElement("input"),n=[],r=t.extend({initialize:function(t,n){var a=this;r.superClass.initialize.apply(a,arguments);t=e(t);a.item=t;var o=a.ph=t.attr("placeholder");if(""==o)return;if(n)a.state2=n;else if(o==t.val()||""==t.val())a.state2=true;else a.state2=false;if(!i&&a.state2){t.val(o);a.trigger("placeholder",[t,a.state2])}a.focus=function(){if(a.state2){!i&&t.val("");a.state2=false;a.trigger("placeholder",[t,a.state2])}};a.blur=function(){var e=t.val();if(""==e)!i&&t.val(o);a.state2=""==e;if(a.state2)a.trigger("placeholder",[t,a.state2])};t.focus(a.focus).bind("blur",a.blur)},state:function(e){var t=this;if(void 0!==e){t.state2=e;if(e)t.restore()}return t.state2},restore:function(){var e=this;if(!e.state2&&!i){e.state2=true;e.item.val(e.ph);e.trigger("placeholder",[e.item,e.state2])}},cancel:function(){var e=this;e.item.unbind("focus",e.focus).unbind("blur",e.blur);var t=n.indexOf(e.item[0]);if(t>-1)n.splice(t,1);return e}});r.NATIVE=i;return r});define("tui/limitTextarea",["tui/event"],function(t){var i=e.browser.msie&&"9.0"==e.browser.version;function n(e){var t=parseInt(e.attr("maxlength")),i=e.val();if(!isNaN(t)&&i.length>t){var n,r,a=document.selection.createRange(),o=document.body.createTextRange();o.moveToElementText(e[0]);r=a.getBookmark();for(n=0;o.compareEndPoints("StartToStart",a)<0&&0!==a.moveStart("character",-1);n++)if("\n"==i.charAt(n))n++;e.val(i.substr(0,Math.min(t,n-1))+i.substr(n,Math.min(t,i.length)));if(i.length!=n){var s=e[0].createTextRange();s.collapse(true);s.moveEnd("character",n-1);s.moveStart("character",n-1);s.select()}}}function r(e,t){var i=t.val();e.trigger("input",[i.length,parseInt(t.attr("maxlength"))])}var a=t.extend({initialize:function(t){var o=this;a.superClass.initialize.apply(o,arguments);if("string"==e.type(t))t=e(t);if(window.addEventListener){t.bind("input",function(){if(i)n(t);r(o,t)});if(i)t.bind("keydown cut paste",function(e){switch(e.type){case"keydown":if(46!=e.keyCode&&8!=e.keyCode)return;default:setTimeout(function(){n(t);r(o,t)},0)}})}else t.bind("propertychange",function(){n(t);r(o,t)})}});return a});define("tui/html5formcore",["tui/event","tui/limitTextarea","tui/placeholder"],function(t,i,n){var r=e.browser.msie&&"9.0"==e.browser.version,a={url:/^\s*[a-zA-z]+:\/\/.*$/,email:/^\s*\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*\s*$/,number:/^\s*-?\.*\d+\s*$/,date:/^\s*\d{2,4}-\d{1,2}-\d{1,2}\s*$/,time:/^\s*\d{1,2}:\d{1,2}(:\d{1,2}(\.\d{1,3})?)?\s*$/,color:/^\s*#?[a-z\d]{3,6}\s*$/},o=document.createElement("input"),s="autofocus"in o,l="form"in o,c=":input:not(:button, :submit, :radio, :checkbox, :reset)",u=t.extend({initialize:function(t,a,o){var l=this;u.superClass.initialize.apply(l,arguments);if("string"==e.type(t))t=e(t);l.form2=t;l.type2=o=o||u.VALID_BLUR;l.list2=[];l.ph2=[];if("function"!=e.type(a)){o=a;a=void 0}if(!t[0]||"FORM"!=t[0].nodeName)return;if(!s)t.find(":input").each(function(){if(null!=this.getAttribute("autofocus")){var t=e(this);t.focus()}});if(!n.NATIVE)t.find("input[placeholder]").each(function(){var t=e(this),i=new n(t);l.list2.push(this);l.ph2.push(i);i.bind("placeholder",function(e,t){l.trigger("placeholder",[e,t])})});l.focusout2=function(){t.attr("novalidate")||l.valid(e(this))};if(o==u.VALID_BLUR)t.delegate(c,"focusout",l.focusout2);var f=[];l.focusin2=function(){var t=e(this);if("TEXTAREA"==this.nodeName&&f.indexOf(this)==-1){new i(t);f.push(this)}l.trigger("focus",[t])};t.delegate(c,"focusin",l.focusin2);l.input2=function(){l.trigger("input",[e(this)])};l.keydown_cut_paste2=function(t){var i=e(this);switch(t.type){case"keydown":if(46!=t.keyCode&&8!=t.keyCode)return;default:setTimeout(function(){l.trigger("input",[i])},0)}};if(window.addEventListener){t.delegate(c,"input",l.input2);if(r)t.delegate("textarea","keydown cut paste",l.keydown_cut_paste2)}else t.delegate(c,"keydown contextmenu",l.input2);t.delegate("input:text[name]","keypress",function(e){if(13==e.keyCode){e.preventDefault();t.submit()}});l.click2=function(e){e.preventDefault();t.submit()};t.delegate("input:submit","click",l.click2);l.submit2=function(e){var i=t.attr("novalidate")||l.validAll();if(i){if(a)return a.call(this,e)}else e.preventDefault()};t.bind("submit",l.submit2)},valid:function(e){var t=this.form2,i=e.val(),n=(e[0].getAttribute("type")||"text").toLowerCase(),r=e.attr("pattern"),o=null!=e[0].getAttribute("required"),s=this.list2.indexOf(e[0]);if(o&&(""==i||s!=-1&&this.ph2[s].state())&&!this.ignore(e)){this.trigger("required",[e]);return false}if(i&&i.length&&"INPUT"==e[0].nodeName&&!this.ignore(e)&&a[n]&&!a[n].test(i)){this.trigger(n,[e]);return false}if(i&&i.length&&"number"==n&&!this.ignore(e)){var l=parseFloat(e.attr("max")),c=parseFloat(e.attr("min")),u=parseFloat(i);if(!isNaN(l)&&u>l){this.trigger("max",[e,l]);return false}if(!isNaN(c)&&u<c){this.trigger("min",[e,c]);return false}}if(r&&r.length&&"text"==n&&i&&!this.ignore(e)){if(s!=-1&&this.ph2[s].state())return true;r=new RegExp(r);if(!r.test(i)){this.trigger("pattern",[e]);return false}}return true},validAll:function(){var e=this,t=true,i=e.form2.find(c);i.each(function(n){t=t&&e.valid(i.eq(n))});return t},ignore:function(t){if("string"==e.type(t))t=e(t);return t.prop("disabled")||null!=t[0].getAttribute("novalidate")},type:function(){return this.type2},placeholder:function(t,i){t=e(t);var n=this.list2.indexOf(t[0]);if(n!=-1)return this.ph2[n];console.error("placeholder not found: "+t[0])},cancel:function(){this.form2.undelegate(c,"focusout",this.focusout2);this.form2.undelegate(c,"focusin",this.focusin2);this.form2.undelegate(c,"input",this.input2);if(r)this.form2.undelegate("textarea","keydown cut paste",this.keydown_cut_paste2);this.form2.undelegate(c,"keydown contextmenu",this.input2);this.form2.undelegate("input:submit","click",this.click2);this.form2.unbind("submit",this.submit2);this.ph2.forEach(function(e){e.cancel()})}});u.VALID_BLUR=1;u.VALID_SUBMIT=2;u.SELECTOR=c;return u});define("tui/template",[],function(t,i){i.ns=function(e,t,i){var n,r=i||window,a=e.split(".").reverse();while((n=a.pop())&&a.length>0){if("undefined"===typeof r[n])r[n]={};else if("object"!==typeof r[n])return false;r=r[n]}if("undefined"!==typeof t)r[n]=t;return r[n]};i.format=function(e,t){return e.replace(/<%\=(\w+)%>/g,function(e,i){return null!=t[i]?t[i]:""})};i.escapeHTML=function(e){e=e||"";var t={"<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;","{":"&#123;","}":"&#125;","@":"&#64;"};return e.replace(/[<>'"\{\}@]/g,function(e){return t[e]})};i.substr=function(e,t,i){if(!e||"string"!==typeof e)return"";var n=e.substr(0,t).replace(/([^\x00-\xff])/g,"$1 ").substr(0,t).replace(/([^\x00-\xff])\s/g,"$1");return i?i.call(n,n):e.length>n.length?n+"...":n};i.strsize=function(e){return e.replace(/([^\x00-\xff]|[A-Z])/g,"$1 ").length};var n=this.document;i.tplSettings={_cache:{},evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g};i.tplHelpers={mix:e.extend,escapeHTML:i.escapeHTML,substr:i.substr,include:r,_has:function(e){return function(t){return i.ns(t,void 0,e)}}};function r(e,t,a){var o,s=i.tplSettings,l=a?"#"+a:"";if(!/[\t\r\n% ]/.test(e)){o=s._cache[e+l];if(!o){var c=n.getElementById(e);if(c)o=s._cache[e+l]=r(c.innerHTML,false,a)}}else{var u="var __p=[];"+(a?"":"with(obj){")+"var mix=api.mix,escapeHTML=api.escapeHTML,substr=api.substr,include=api.include,has=api._has("+(a||"obj")+");"+"__p.push('"+e.replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(s.interpolate,function(e,t){return"',"+t.replace(/\\'/g,"'")+",'"}).replace(s.evaluate||null,function(e,t){return"');"+t.replace(/\\'/g,"'").replace(/[\r\n\t]/g," ")+"__p.push('"}).replace(/\r/g,"\\r").replace(/\n/g,"\\n").replace(/\t/g,"\\t")+"');"+(a?"":"}")+"return __p.join('');";try{o=new Function(a||"obj","api",u)}catch(f){console.log("Could not create a template function: \n"+u)}}return!o?"":t?o(t,i.tplHelpers):o}i.convertTpl=r;i.reloadTpl=function(e){delete i.tplSettings._cache[e]}});define("tui/html5form",["tui/template","tui/html5formcore","tui/placeholder"],function(t,i,n){var r='<div class="g_tip"><h3><%=msg%></h3><% if(info && info.length) { %><p><%=info%></p><% } %><span class="arrow"></span></div>',a={url:"url格式不合法",email:"email格式不合法",number:"请输入一个数字",max:"值必须小于或等于",min:"值必须大于或等于",date:"日期格式不合法",time:"时间格式不合法",color:"颜色格式不合法",required:"请填写此项",pattern:"不符合要求格式"},o=e("body"),s=e(window),l=i.extend({initialize:function(){var t=this;l.superClass.initialize.apply(t,arguments);t.phs3=[],t.msg3=[],t.list3=[],t.action3=[];t.bind("required",function(e){t.tip(e,a["required"])});t.bind("url",function(e){t.tip(e,a["url"])});t.bind("email",function(e){t.tip(e,a["email"])});t.bind("number",function(e){t.tip(e,a["number"])});t.bind("max",function(e,i){t.tip(e,a["max"]+i)});t.bind("min",function(e,i){t.tip(e,a["min"]+i)});t.bind("date",function(e){t.tip(e,a["date"])});t.bind("time",function(e){t.tip(e,a["time"])});t.bind("color",function(e){t.tip(e,a["color"])});t.bind("required",function(e){t.tip(e,a["required"])});t.bind("pattern",function(e){t.tip(e,a["pattern"])});t.bind("placeholder",function(t,i){t=e(t);if(i)t.addClass("g_placeholder");else t.removeClass("g_placeholder")});t.bind("input",function(e){t.clear(e)});if(!n.NATIVE){var i=t.form2.find("input[placeholder]");i.each(function(i,n){var r=t.placeholder(n),a=r.state();if(a)e(n).addClass("g_placeholder")})}},tip:function(i,n){console&&console.warn&&console.warn(i);var a=this;a.clearAll();a.list3.push(i);a.phs3.push(i[0]);i.addClass("g_valid");var l=e(t.convertTpl(r,{msg:n,info:i.attr("title")||""}));l.css({left:i.offset().left,top:i.offset().top+i.outerHeight()+7});l.click(function(){i.focus()});a.msg3.push(l);o.append(l);var c=l.offset().top+l.outerHeight()-s.scrollTop()-s.height();if(c>0)s.scrollTop(s.scrollTop()+c);var u=4,f;a.action3.push(f=setInterval(function(){l.css("left",l.offset().left+u);if(u<0)++u;if(0==u){clearInterval(f);return}u*=-1},50));if(s.scrollTop()>i.offset().top)s.scrollTop(i.offset().top);else if(s.scrollTop()+s.height()<i.offset().top+i.height())s.scrollTop(i.offset().top+i.height()-s.height());if(a.ct)clearTimeout(a.ct);a.ct=setTimeout(function(){a.clearAll()},5e3);return this},clear:function(t){if("string"==e.type(t))t=e(t);var i=this.phs3.indexOf(t[0]);if(i!=-1){this.phs3.splice(i,1);this.list3.splice(i,1);this.msg3[i].remove();this.msg3.splice(i,1);clearInterval(this.action3[i]);this.action3.splice(i,1);t.removeClass("g_valid")}return this},clearAll:function(){this.phs3=[];while(this.msg3.length)this.msg3.pop().remove();while(this.list3.length)this.list3.pop().removeClass("g_valid");while(this.action3.length){var e=this.action3.pop();clearInterval(e)}return this}});return l});define("tui/drag",["tui/event"],function(t){var i=e(window);function n(){if(window.getSelection)window.getSelection().removeAllRanges();else if(document.selection)document.selection.empty();return this}function r(e){e.preventDefault()}var a=t.extend({initialize:function(t,o){var s=this;o=o||{};var l=o.handler||t;a.superClass.initialize.call(s);s.limit=o.limit;s.bubble=o.bubble;s.isCustom=o.isCustom;s.enable2=true;s.state2=false;s.hasMove2=false;s.fx=s.fy=-1;s.x2=s.y2=s.mx2=s.my2=s.px2=s.py2=s.cx2=s.cy2=0;s.node2="string"==e.type(t)?e(t):t;s.container2=o.container||s.node2.parent();s.fixed2="fixed"==s.node2.css("position").toLowerCase();s.handler2="string"==e.type(l)?e(l):l;var c=s.handler2||s.node2;function u(e){e.preventDefault();if(!s.bubble||e.target==c[0]){s.start(e);if(c[0].setCapture)c[0].setCapture()}}c.bind("mousedown",u);function f(t){if(s.state2){s.state2=false;var n=t.pageX-s.mx2+s.x2-s.px2,a=t.pageY-s.my2+s.y2-s.py2;if(s.fixed2){n-=i.scrollLeft();a-=i.scrollTop()}if(s.limit){n=Math.max(n,s.cx2-s.px2);a=Math.max(a,s.cy2-s.py2);n=Math.min(n,s.cWidth-(s.px2-s.cx2)-s.dWidth);a=Math.min(a,s.cHeight-(s.py2-s.cy2)-s.dHeight)}s.x2=s.node2.offset().left;s.y2=s.node2.offset().top;s.trigger("drag:end",[n,a,t.pageX,t.pageY,s.node2,s.container2])}e(document).unbind("selectstart",r);if(c[0].releaseCapture)c[0].releaseCapture()}e(document).bind("mouseup",f);function d(e){if(s.state2&&s.enable2){if(!s.hasMove()&&e.pageX==s.fx&&e.pageY==s.fy);else s.hasMove2=true;var t=e.pageX-s.mx2+s.x2-s.px2,r=e.pageY-s.my2+s.y2-s.py2;if(s.fixed2){t-=i.scrollLeft();r-=i.scrollTop()}if(s.limit){t=Math.max(t,s.cx2-s.px2);r=Math.max(r,s.cy2-s.py2);t=Math.min(t,s.cWidth-(s.px2-s.cx2)-s.dWidth);r=Math.min(r,s.cHeight-(s.py2-s.cy2)-s.dHeight)}if(!s.isCustom)s.node2.css({left:t,top:r});n();s.trigger("drag:move",[t,r,e.pageX,e.pageY,s.node2,s.container2])}}e(document).bind("mousemove",d);s.cancel=function(){c.unbind("mousedown",u);e(document).unbind("mouseup",f);e(document).unbind("mousemove",d)}},start:function(t){var i=this;e(document).bind("selectstart",r);i.offsetParent2=i.node2.offsetParent();if(i.limit){i.cWidth=i.container2.outerWidth();i.cHeight=i.container2.outerHeight();i.pWidth=i.offsetParent2.outerWidth();i.pHeight=i.offsetParent2.outerHeight();i.dWidth=i.node2.outerWidth();i.dHeight=i.node2.outerHeight()}i.fx=t.pageX;i.fy=t.pageY;i.cx2=i.container2.offset().left;i.cy2=i.container2.offset().top;i.px2=i.offsetParent2.offset().left;i.py2=i.offsetParent2.offset().top;i.x2=i.node2.offset().left;i.y2=i.node2.offset().top;i.mx2=t.pageX;i.my2=t.pageY;i.state2=true;i.trigger("drag:start",[i.x2,i.y2,t.pageX,t.pageY,i.node2,i.container2]);return this},enable:function(){this.enable2=true;return this},disable:function(){this.enable2=false;return this},state:function(){return this.state2},hasMove:function(){return this.hasMove2}});return a});define("tui/art",[],function(){var e=window;var t=function(e,i){return t["string"===typeof i?"compile":"render"].apply(t,arguments)};t.version="2.0.2";t.openTag="<%";t.closeTag="%>";t.isEscape=true;t.isCompress=false;t.parser=null;t.render=function(e,i){var n=t.get(e)||r({id:e,name:"Render Error",message:"No Template"});return n(i)};t.compile=function(e,n){var o=arguments;var s=o[2];var l="anonymous";if("string"!==typeof n){s=o[1];n=o[0];e=l}try{var c=a(e,n,s)}catch(u){u.id=e||n;u.name="Syntax Error";return r(u)}function f(i){try{return new c(i,e)+""}catch(a){if(!s)return t.compile(e,n,true)(i);return r(a)()}}f.prototype=c.prototype;f.toString=function(){return c.toString()};if(e!==l)i[e]=f;return f};var i=t.cache={};var n=t.helpers=function(){var e=function(t,i){if("string"!==typeof t){i=typeof t;if("number"===i)t+="";else if("function"===i)t=e(t.call(t));else t=""}return t};var i={"<":"&#60;",">":"&#62;",'"':"&#34;","'":"&#39;","&":"&#38;"};var n=function(t){return e(t).replace(/&(?![\w#]+;|#\d+)|[<>"']/g,function(e){return i[e]})};var r=Array.isArray||function(e){return"[object Array]"==={}.toString.call(e)};var a=function(e,t){if(r(e))for(var i=0,n=e.length;i<n;i++)t.call(e,e[i],i,e);else for(i in e)t.call(e,e[i],i)};return{$include:t.render,$string:e,$escape:n,$each:a}}();t.helper=function(e,t){n[e]=t};t.onerror=function(t){var i="Template Error\n\n";for(var n in t)i+="<"+n+">\n"+t[n]+"\n\n";if(e.console)console.error(i)};t.get=function(n){var r;if(i.hasOwnProperty(n))r=i[n];else if("document"in e){var a=document.getElementById(n);if(a){var o=a.value||a.innerHTML;r=t.compile(n,o.replace(/^\s*|\s*$/g,""))}}return r};var r=function(e){t.onerror(e);return function(){return"{Template Error}"}};var a=function(){var e=n.$each;var i="break,case,catch,continue,debugger,default,delete,do,else,false"+",finally,for,function,if,in,instanceof,new,null,return,switch,this"+",throw,true,try,typeof,var,void,while,with"+",abstract,boolean,byte,char,class,const,double,enum,export,extends"+",final,float,goto,implements,import,int,interface,long,native"+",package,private,protected,public,short,static,super,synchronized"+",throws,transient,volatile"+",arguments,let,yield"+",undefined";var r=/\/\*[\w\W]*?\*\/|\/\/[^\n]*\n|\/\/[^\n]*$|"(?:[^"\\]|\\[\w\W])*"|'(?:[^'\\]|\\[\w\W])*'|[\s\t\n]*\.[\s\t\n]*[$\w\.]+/g;var a=/[^\w$]+/g;var o=new RegExp(["\\b"+i.replace(/,/g,"\\b|\\b")+"\\b"].join("|"),"g");var s=/^\d[^,]*|,\d[^,]*/g;var l=/^,+|,+$/g;var c=function(e){return e.replace(r,"").replace(a,",").replace(o,"").replace(s,"").replace(l,"").split(/^$|,+/)};return function(i,r,a){var o=t.openTag;var s=t.closeTag;var l=t.parser;var u=r;var f="";var d=1;var p={$data:1,$id:1,$helpers:1,$out:1,$line:1};var h={};var v="var $helpers=this,"+(a?"$line=0,":"");var m="".trim;var g=m?["$out='';","$out+=",";","$out"]:["$out=[];","$out.push(",");","$out.join('')"];var b=m?"if(content!==undefined){$out+=content;return content;}":"$out.push(content);";var x="function(content){"+b+"}";var w="function(id,data){"+"data=data||$data;"+"var content=$helpers.$include(id,data,$id);"+b+"}";e(u.split(o),function(e,t){e=e.split(s);var i=e[0];var n=e[1];if(1===e.length)f+=k(i);else{f+=T(i);if(n)f+=k(n)}});u=f;if(a)u="try{"+u+"}catch(e){"+"throw {"+"id:$id,"+"name:'Render Error',"+"message:e.message,"+"line:$line,"+"source:"+M(r)+".split(/\\n/)[$line-1].replace(/^[\\s\\t]+/,'')"+"};"+"}";u=v+g[0]+u+"return new String("+g[3]+");";try{var y=new Function("$data","$id",u);y.prototype=h;return y}catch(_){_.temp="function anonymous($data,$id) {"+u+"}";throw _}function k(e){d+=e.split(/\n/).length-1;if(t.isCompress)e=e.replace(/[\n\r\t\s]+/g," ").replace(/<!--.*?-->/g,"");if(e)e=g[1]+M(e)+g[2]+"\n";return e}function T(e){var i=d;if(l)e=l(e);else if(a)e=e.replace(/\n/g,function(){d++;return"$line="+d+";"});if(0===e.indexOf("=")){var r=0!==e.indexOf("==");e=e.replace(/^=*|[\s;]*$/g,"");if(r&&t.isEscape){var o=e.replace(/\s*\([^\)]+\)/,"");if(!n.hasOwnProperty(o)&&!/^(include|print)$/.test(o))e="$escape("+e+")"}else e="$string("+e+")";e=g[1]+e+g[2]}if(a)e="$line="+i+";"+e;$(e);return e+"\n"}function $(t){t=c(t);e(t,function(e){if(!p.hasOwnProperty(e)){z(e);p[e]=true}})}function z(e){var t;if("print"===e)t=x;else if("include"===e){h["$include"]=n["$include"];t=w}else{t="$data."+e;if(n.hasOwnProperty(e)){h[e]=n[e];if(0===e.indexOf("$"))t="$helpers."+e;else t=t+"===undefined?$helpers."+e+":"+t}}v+=e+"="+t+","}function M(e){return"'"+e.replace(/('|\\)/g,"\\$1").replace(/\r/g,"\\r").replace(/\n/g,"\\n")+"'"}}}();return t});define("tui/widget",["tui/event","tui/art"],function(t,i){function n(e,t){var i;var n;var r=e.split(" ");if(1==r.length){i=t;n=e}else{i=r.shift();n=r.join(" ")}return[i,n]}var r=t.extend({element:null,template:"<div></div>",eventType:"click",model:{},events:{},targetNode:e(document.body),renderMethod:"append",initialize:function(t){var i=this;t=t||{};r.superClass.initialize.call(i);i.model=e.extend(true,{},i.model);i.events=e.extend(true,{},i.events);e.each(["element","targetNode"],function(){"undefined"!==typeof t[this]&&(i[this]=e(t[this]))});e.each(["template","eventType","renderMethod"],function(){"undefined"!==typeof t[this]&&(i[this]=t[this])});e.each(["model","events"],function(){"undefined"!==typeof t[this]&&e.extend(i[this],t[this])})},find:function(e){return this.element.find(e)},delegate:function(t,i){var r=this;if("string"==e.type(t)&&e.isFunction(i)){var a={};a[t]=i;t=a}e.each(t,function(t,i){var a=function(t){if(e.isFunction(i))return i.call(r,t);else return r[i](t)};var o=n(t,r.eventType);r.element.on(o[0],o[1],a)});return r},undelegate:function(e){var t=this;var i=n(e,t.eventType);t.element.off(i[0],i[1]);return t},render:function(t){var n=this;if(!n.element||!n.element[0])n.element=e(i.compile(n.template)(e.extend({getUrl:this.getUrl||a},t||n.model)));n.delegate(n.events);if(n.renderMethod)n.targetNode[n.renderMethod](n.element);n.trigger("render:success",[]);return n},update:function(t){if(this.renderMethod){this.targetNode[this.renderMethod](i.compile(this.template)(e.extend({getUrl:this.getUrl||a},t)));self.trigger("update:success",[])}}});function a(e){return e}return r});define("tui/mask",[],function(){var t=e('<div class="tui_mask">');var i;var n=e(window);var r=e(document);var a=e(document.body);var o=e.browser.msie&&e.browser.version<7;var s=4096;function l(){var i=Math.max(n.width(),r.width());var a=Math.max(n.height(),r.height());var l="absolute";var c=0;if(e.browser.msie&&a>s){if(!o)l="fixed";else{c=n.scrollTop();if(c+s>a)c=a-s}a=s}t.css({position:l,top:c,width:i,height:a})}return{node:function(){return t},resize:function(){l()},show:function(e){n.bind("resize",l);if(o)n.bind("scroll",l);t.css("z-index",e||9e4);this.resize();if(!i){a.append(t);i=true}else t.show();return this},hide:function(e){n.unbind("resize",l);if(o)n.unbind("scroll",l);if(e){t.remove();i=false}else t.hide();return this},update:function(){l()},state:function(){return t.is(":visible")}}});define("tui/browser",[],function(){var t=navigator.userAgent.toLowerCase();var i={ie6:e.browser.msie&&6==e.browser.version,html5:function(){var e=document.createElement("input");var t=document.createElement("video");return{h264:!!(t.canPlayType&&t.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"').replace(/no/,"")),history:!!(window.history&&window.history.pushState&&window.history.popState),placeholder:"placeholder"in e}},lang:(navigator.language||navigator.systemLanguage).toLowerCase(),iOS:(t.match(/(ipad|iphone|ipod)/)||[])[0],iOSVersion:(t.match(/os\s+([\d_]+)\s+like\s+mac\s+os/)||[0,"0_0_0"])[1].split("_"),wphone:parseFloat((t.match(/windows\sphone\s(?:os\s)?([\d.]+)/)||["","0"])[1]),android:parseFloat((t.match(/android[\s|\/]([\d.]+)/)||["","0"])[1])};i.isMobile=!!i.iOS||!!i.wphone||!!i.android||void 0!==window.orientation||false;i.isPad=i.isMobile&&("ipad"==i.iOS||t.indexOf("mobile")==-1||t.indexOf("windows nt")!=-1&&t.indexOf("touch")!=-1)||false;return i});define("tui/dialog",["tui/browser","tui/art","tui/mask","tui/widget","tui/drag"],function(t,i,n,r,a){var o=e(window);var s=e.browser.msie&&e.browser.version<=7||!e.support.boxModel;var l=10002;var c='<div class="tui_dialog_button"><% for (var i = 0; i < buttons.length; i++) { %>'+'<a data-role="button_<%=i%>" href="#" <%if(buttons[i].className){%>class="<%=buttons[i].className%>"<%}%>><%=buttons[i].name%></a>'+"<% } %></div>";var u='<div class="tui_dialog <%=className%>"><div<% if (hasWrap) { %> class="tui_dialog_wrap"<% } %>><div class="tui_dialog_holder" data-role="holder">'+'<div class="tui_dialog_resize"></div>'+'<div class="tui_dialog_w_tp"></div><div class="tui_dialog_w_bm"></div>'+'<div class="tui_dialog_w_lf"></div><div class="tui_dialog_w_rt"></div>'+'<div class="tui_dialog_w_tl"></div><div class="tui_dialog_w_tr"></div>'+'<div class="tui_dialog_w_bl"></div><div class="tui_dialog_w_br"></div>'+'<div class="tui_dialog_header" data-role="header"><span class="tui_dialog_close" data-role="close" title="关闭">X</span>'+'<div class="tui_dialog_title" data-role="title"><%=title%></div><div class="tui_dialog_bar"><%=bar%></div></div>'+'<div class="tui_dialog_content" data-role="content"></div>'+'<% if (buttons.length > 0) { %><div class="tui_dialog_footer" data-role="footer">'+c+"</div><% } %>"+'<% if (info) { %><div class="tui_dialog_info"><%=info%></div><% } %>'+"</div></div></div>";var f=r.extend({events:{"click [data-role=close]":function(e){e.preventDefault();this.close()}},initialize:function(t){var n=this;var r={template:u,buttons:[],zIndex:l,hasDrag:true,hasMask:true,isFixed:true};t=e.extend(r,t||{});l=t.zIndex;var a=e.browser.msie&&parseFloat(e.browser.version)<9;if("undefined"!=typeof t.hasWrap)a=t.hasWrap;var o={hasWrap:a,className:t.className||"tudou_dialog",title:t.title||"",bar:t.bar||"",info:t.info||"",buttons:t.buttons};t.element=e(i.compile(t.template)(o));f.superClass.initialize.call(this,t);n.dom={holder:n.element.find("[data-role=holder]"),header:n.element.find("[data-role=header]"),title:n.element.find("[data-role=title]"),content:n.element.find("[data-role=content]"),footer:n.element.find("[data-role=footer]"),close:n.element.find("[data-role=close]")};n.config=t;n.open();var s=function(t){if(27==t.keyCode){n.close();e(document).unbind("keydown",s)}};e(document).keydown(s)},title:function(e){this.dom.title.html(e);return this},content:function(e){this.dom.content.html(e);return this},open:function(){var t=this;var i=t.config;var r=t.element;var c=t.dom;r.css("z-index",l);l+=2;if(i.hasMask)n.show(r.css("z-index")-1);r.css("position",s||!i.isFixed?"absolute":"fixed");t.iframeMask=e("<iframe>",{src:"about:blank",frameborder:0,css:{border:"none","z-index":-1,position:"absolute",top:0,left:0,width:"100%",height:"100%"}}).prependTo(c.holder);t.content(i.content||"");e.each(i.buttons,function(e){t.events["[data-role=button_"+e+"]"]=this.callback});if(!t.element.parent()[0])t.render();t.element.show();t.locate();t.resizeLocate=function(e){t.locate()};o.bind("resize",t.resizeLocate);if(s&&i.isFixed){t.iefixScroll=function(e){t.locate()};o.bind("scroll",t.iefixScroll);t.iframeMask.css({height:c.holder.height()})}if(t.config.hasDrag)new a(r,{handler:c.header,limit:true});return t},close:function(e){var t=this;if(t.config.hasMask)n.hide(true);t.trigger("close",[t]);if(!e)t.element.find("iframe").remove();t.element[e?"hide":"remove"]();if(t.resizeLocate)o.unbind("resize",t.resizeLocate);if(t.iefixScroll){o.unbind("scroll",t.iefixScroll);t.iefixScroll=null}return t},locate:function(){var e=this;var t=Math.max(0,o.width()-e.element.width()>>1);if(!e.config.isFixed)var i=o.scrollTop()+(o.height()-e.element.height())/2;else var i=Math.max(0,o.height()-e.element.height()>>1)+(s?o.scrollTop():0);e.element.css({left:t,top:i});return e}});f.confirm=function(t,i){var n={};if(e.isPlainObject(t)){n=t;t=n.msg;i=n.callback}return new f(e.extend({className:"tudou_dialog alert",title:"提示",content:'<div class="tui_dialog_text">'+t+"</div>",hasMask:true,buttons:[{name:"确定",callback:function(e){e.preventDefault();
i&&i.call(this);this.close()}},{name:"取消",callback:function(e){e.preventDefault();this.close()}}]},n))};f.alert=function(t,i){var n={};if(e.isPlainObject(t)){n=t;t=n.msg;i=n.callback}return new f(e.extend({className:"tudou_dialog alert",title:"提示",content:'<div class="tui_dialog_text">'+t+"</div>",hasMask:true,buttons:[{name:"确定",callback:function(e){e.preventDefault();i&&i.call(this);this.close()}}]},n))};return f});define("app/login",["tui/event","tui/art","tui/dialog","tui/html5form"],function(t,i,n,r,a,o){var s=new t;var l;var c=i.compile('<h3>登录</h3>\n<a href="#" class="close" data-role="close">X</a>\n<form id="loginForm">\n<div class="l"><input class="tel" name="name" type="text" placeholder="用户名" /></div>\n<div class="l"><input class="pwd" name="pwd" type="password" placeholder="密码" /></div>\n<div class="l"><input class="codeipt" name="code" type="text" placeholder="验证码" /><img src="http://img3.imgtn.bdimg.com/it/u=2142985517,724352710&fm=21&gp=0.jpg" codeId="<%=code%>" class="code" /></div>\n<div class="btn">\n<a class="submit" href="#">登 录</a>\n</div>\n</form>');function u(){}s.needLogin=function(t,i){if("function"===typeof t){i=t;t=null}else t=t||null;if(t)var a=e(t);else{var o=new n({className:"login_dialog",content:c({code:123})});var a=o.dom.content}var s=a.find("form");var u=s.find("[name=name]");var f=s.find("[name=pwd]");var d=s.find("[name=code]");var p=new r(s,r.VALID_BLUR);var h={};a.on("click",".submit",function(t){t.preventDefault();var r=u.val().trim();if(!r.length){p.tip(u,"请填写正确的用户名");return}var a=f.val().trim();if(!a.length){p.tip(f,"请输入密码");return}if(!l){p.tip(d,"请输入正确的验证码");return}var o=s.serialize();o=+"&act=login";e.post("login.php",o,function(e){if(1==e)i&&i();else n.alert("用户名或者密码不正确")})}).on("click",".code",function(t){t.preventDefault();var i=e(this);var n=i.attr("codeId");i.attr("src","get_code.php?load=yes&id="+n+"&"+Math.random())});d.on("input",function(){var t=e(this);var i=t.val();var n=s.find(".code");if(5==i.length)e.post("check.php",{act:"code",v:i,id:n.attr("codeId")},function(e){l=1==e;if(!l){p.tip(t,"验证码无效");n.attr("src","get_code.php?load=yes&id="+n.attr("codeId")+"&"+Math.random())}},"json")})};return s});define("app/nav",["tui/art","app/login"],function(t,i,n,r){function a(){e("#header").on("mouseenter",".icon-weixin",function(){e(this).find(".qrcode").css({display:"inline-block"})}).on("mouseleave",".share",function(){e(this).find(".qrcode").css({display:"none"})})}function o(t){t=e.extend({top:165,disabled:true},t);var i=e(window);var n=i.height();var r=e("#header .m-nav");var a=0;var o=t.top;if(t.disabled)return;var s=i.scrollTop()<=o;if(!s){r.addClass("fixed");a=1}i.bind("scroll",function(){s=i.scrollTop()<=o;if(!s&&0===a){r.addClass("fixed");a=1}if(s&&1===a){r.removeClass("fixed");a=0}})}r.init=function(t){o(t);a();e("#gUser").on("click","[data-role=login]",function(e){e.preventDefault();i.needLogin(function(){location.reload()})})}});require(["app/nav","module/slider","module/flexisel"],function(t,i,n){t.init({disabled:false});var r=e("#jsFocus");var a=new i({box:r,tab:".btns a",panel:"li",fade:true,duration:500,loop:5e3});r.on("click",".prev",function(e){e.preventDefault();s()}).on("click",".next",function(e){e.preventDefault();o()}).on("mouseenter",function(){e(this).find(".prev").css({left:"20px"});e(this).find(".next").css({right:"20px"});a.stop()}).on("mouseleave",function(){e(this).find(".prev").css({left:"-999px"});e(this).find(".next").css({right:"-999px"});a.start()});function o(){var e=a.current;if(e>a.size)a.go(0);else a.next(true)}function s(){var e=a.current;if(e<1)a.go(a.size-1);else a.prev(true)}e("#memberSlide").flexisel({visibleItems:7,animationSpeed:1e3,autoPlay:true,pauseOnHover:true,enableResponsiveBreakpoints:false});var l=e("#indexAD .c");var c;e(window).on("scroll",function(){var t=e(window).scrollTop();if(t>500&&!c){l.addClass("ex");e("#indexAD .btn").removeClass("expend");c=true}});e("#indexAD").on("click",".btn",function(t){t.preventDefault();var i=e(this);if(i.hasClass("expend")){i.removeClass("expend");l.addClass("ex")}else{i.addClass("expend");l.removeClass("ex")}})})}(window.jQuery);;
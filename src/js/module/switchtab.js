/**
 * 全站Tab切换、滚动Banner
 */
define(['tui/lazyImageLoader','tui/event'], function(LazyImageLoader, Event) {
    /**
     * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
     * @note jQuery动画方法的缓冲效果
     */
    jQuery.easing['jswing'] = jQuery.easing['swing'];
    jQuery.extend( jQuery.easing,{
        // t: current time, b: begInnIng value, c: change In value, d: duration
        easeInOutQuad: function (x, t, b, c, d) { //===easeInOutCubic
            if ((t/=d/2) < 1) return c/2*t*t*t + b;
            return c/2*((t-=2)*t*t + 2) + b;
        }
    });

    function getTabIndex(obj){
        if (obj && obj.tagName) {
            var me = (obj.tagName.toLowerCase() == 'a') ? $(obj) : $(obj).find('a');
            me = me.length ? me : $(obj);
            return (me.attr('rel') || me.attr('href').replace(/.*#(\d+)$/, '$1') || 1) - 1;
        } else {
            return 0;
        }
    }

    function clearTimer(timer){
        var args = arguments;
        for (var i = 0, l = args.length; i < l; i++) {
            var timer = args[i];
            if (timer) clearTimeout(timer);
        }
        return null;
    }
    
    
    var Klass = Event.extend({
        initialize: function(op) {          
            var self = this;
            Klass.superClass.initialize.apply(self, arguments); 
                
            self.op = op || {};
            self.op.slide = op.slide || false;
            self.op.linktab = op.linktab || false;
            self.op.clicktab = op.clicktab || false;
            self.op.lazyContent = op.lazyContent || window.gLazyContent || false;           
            
            // 界面对象
            var box = self.box = $(op.box);
            var tab = self.tab = $(op.tab || '.tab li', box);
            var panel = self.panel = $(op.panel || '.c', box);
        
            self.size = tab.length || panel.length;
            self.loop = op.loop || 0;
            self.current = getTabIndex(tab.filter('.current')[0]);
    
            // 横向滚动面板
            if (self.op.slide) {
                self.scroll = panel.parent().parent();
                // 滚动位置归零
                self.scroll.scrollLeft(0);
                // 复制第一个拼接
                LazyImageLoader({imgs: panel.eq(self.current).find('.lazyImg')});
                panel.parent().append(panel.eq(0).clone());
                self.panel = $(op.panel || '.c', box);
                // 滚动参数设置
                self.width = panel.width();
                self.delay = op.delay || 700;
                self.loop = (self.loop || 5000) + self.delay;
                self.anilock = false;
            }
    
            if (self.size < 2) return;
    
            // 可点击Tab
            if (self.op.clicktab) {
                tab.click(function(event){
                    event.preventDefault();
                    self.go(getTabIndex(this));
                });
            } else {
                // 非带链接Tab
                if (!self.op.linktab) {
                    tab.click(function(event){ event.preventDefault() });
                }
                tab.mouseenter(function(){
                    clearTimer(self.timer, self.looptimer);
                    var me = this;
                    self.timer = setTimeout(function(){
                        self.go(getTabIndex(me));
                    }, 30);
                }).mouseleave(function(){
                    clearTimer(self.timer, self.looptimer);
                    self.start();
                });
            }
    
            // 循环切换
            if (self.loop) {
                self.check(self.op.clicktab ? tab : null);
                self.start();
            }


            tab.parent().on('click', 'a', function(event){
                var href = $(this).attr('href');

                if( !href || href == '#' || href.length < 5){
                    event.preventDefault();
                    //return false;
                }
            });                 
        },
        
        on: function(type, o){
            this.box.eventProxy(type, o);
            return this;
        },

        go: function(cur, auto){
            var self = this;
            cur = auto ? cur : Math.min(Math.max(cur, 0), self.size - 1);
            self.trigger('before', [self.current, cur, self]);
            if (self.op.slide) {
                if (self.anilock) {
                    self.nextstep = function(){ self.animate(cur, auto); };
                    return;
                }
                self.animate(cur, auto);
            } else {
                var prev = self.current;
                                
                self.current = cur % self.size;
                self.trigger('change', [self.current, self]);
                self.tab.removeClass('current').eq(self.current).addClass('current');

                var isFade = self.op.fade;
                var panels = self.panel;
                
                isFade ? panels.eq(prev).stop().fadeOut(100): panels.hide();
                
                panels.eq(self.current)[isFade ? 'fadeIn' : 'show'](self.op.duration ? self.op.duration : '');
                self.trigger('after', [self.current, self]);
            }
        },
        prev: function(auto){
            this.go(this.current - 1, auto);
        },
        next: function(auto){
            this.go(this.current + 1, auto);
        },
        start: function(start){
            var self = this;
            if (self.loop) {
                clearTimer(self.looptimer);
                if (start) self.start();
                self.looptimer = setTimeout(function(){
                    self.start();
                    self.next(true);
                }, self.loop);
            }
        },
        stop: function(){
            clearTimer(this.looptimer);
        },
        check: function(obj){
            var self = this;
            (obj || self.panel).mouseenter(function(){
                clearTimer(self.looptimer);
            }).mouseleave(function(){
                clearTimer(self.looptimer);
                self.start();
            });
        },
        animate: function(pos, auto){
            var self = this;
            var current = self.current;
            if (self.anilock || current == pos) return;
            clearTimer(self.looptimer);
            var size = self.size, width = self.width, panel = self.panel, scroll = self.scroll;
            var s = current > pos ? 0 : width;
            var c = current > pos ? width : 0;
            pos = pos % (auto ? size + 1 : size);
            LazyImageLoader({imgs: panel.eq(pos).show().find('.lazyImg')});
            
            scroll.scrollLeft(c);
            self.tab.removeClass('current').eq(pos % size).addClass('current');
            scroll.animate({ scrollLeft: s }, self.delay, 'easeInOutQuad', function(){
                panel.eq(current).hide();
                if (auto && pos == size) {
                    pos = pos % size;
                    LazyImageLoader({imgs: panel.eq(0).show().find('.lazyImg')});
                    panel.eq(size).hide();
                }
                scroll.scrollLeft(0);
                self.current = pos;
                self.anilock = false;
                self.trigger('after', [self.current, self]);
                if (self.nextstep) {
                    self.nextstep();
                    self.nextstep = null;
                }
                if (auto) {
                    self.start();
                }
            });
            self.anilock = true;
        }       
        });

    
    return Klass;
});

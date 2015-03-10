/**
 * 全站Tab切换、滚动Banner
 */
define('tui/switchTab', [
    'tui/event'
], function(Event) {

    var switchTab = function(op){
        this.op = op || {};
        this.op.slide = op.slide || false;
        this.op.linktab = op.linktab || false;
        this.op.clicktab = op.clicktab || false;

        if (!op.box) return;

        var self = this;

        // 界面对象
        var box = this.box = $(op.box);
        var tab = this.tab = $(op.tab || '.tab li', box);
        var panel = this.panel = $(op.panel || '.c', box);

        this.event = new Event();

        this.size = tab.length || panel.length;
        this.loop = op.loop || 0;
        this.current = getTabIndex(tab.filter('.current')[0]);

        // 横向滚动面板
        if (op.slide) {
            this.scroll = panel.parent().parent();
            // 滚动位置归零
            this.scroll.scrollLeft(0);
            // 复制第一个拼接
            panel.eq(this.current).find('.lazyImg').loadImgSrc();
            panel.parent().append(panel.eq(0).clone());
            this.panel = $(op.panel || '.c', box);
            // 滚动参数设置
            this.width = panel.width();
            this.delay = op.delay || 700;
            this.loop = (this.loop || 5000) + this.delay;
            this.anilock = false;
        }

        if (this.size < 2) return;

        // 可点击Tab
        if (op.clicktab) {
            tab.click(function(event){
                event.preventDefault();
                self.go(getTabIndex(this));
            });
        } else {
            // 非带链接Tab
            if (!op.linktab) {
                tab.click(function(event){ event.preventDefault() });
            }
            tab.mouseenter(function(){
                clearTimer(self.timer, self.looptimer);
                var me = this;
                self.timer = setTimeout(function(){
                    self.go(getTabIndex(me));
                }, 200);
            }).mouseleave(function(){
                clearTimer(self.timer, self.looptimer);
                self.start();
            });
        }

        // 循环切换
        if (self.loop) {
            self.check(op.clicktab ? tab : null);
            self.start();
        }
    };

    switchTab.prototype = {
        on: function(type, o){
            this.box.eventProxy(type, o);
            return this;
        },
        bind: function(e, fn){
            this.event.bind(e, fn);
            return this;
        },
        go: function(cur, auto){
            cur = auto ? cur : Math.min(Math.max(cur, 0), this.size - 1);
            this.event.fire('before', [this.current, cur, this]);
            if (this.op.slide) {
                if (this.anilock) {
                    this.nextstep = function(){ this.animate(cur, auto); };
                    return;
                }
                this.animate(cur, auto);
            } else {
                this.current = cur % this.size;
                this.event.fire('change', [this.current, this]);
                this.tab.removeClass('current').eq(this.current).addClass('current');
                this.panel.hide().eq(this.current)[this.op.fade ? 'fadeIn' : 'show'](this.op.duration ? this.op.duration : '');
                this.event.fire('after', [this.current, this]);
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
            panel.eq(pos).show().find('.lazyImg').loadImgSrc();
            scroll.scrollLeft(c);
            self.tab.removeClass('current').eq(pos % size).addClass('current');
            scroll.animate({ scrollLeft: s }, self.delay, 'easeInOutQuad', function(){
                panel.eq(current).hide();
                if (auto && pos == size) {
                    pos = pos % size;
                    panel.eq(0).show().find('.lazyImg').loadImgSrc();
                    panel.eq(size).hide();
                }
                scroll.scrollLeft(0);
                self.current = pos;
                self.anilock = false;
                self.event.fire('after', [self.current, self]);
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
    };

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

    return switchTab;

});


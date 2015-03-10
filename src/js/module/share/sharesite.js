define('module/share/sharesite', function(){
    return [{
        name: 'wb',
        label: '微博',
        url: function(url, title, pic, relatedUid){
            return 'http://v.t.sina.com.cn/share/share.php?' + $.param({
                c: 'spr_web_bd_tudou_weibo',
                url: url,
                title: title,
                source: '聚沙成塔',
                sourceUrl: 'http://www.tudou.com/',
                content: 'gb2312',
				searchPic: false,
                pic: pic,
                appkey: 0,
                ralateUid: relatedUid
            })
        },
        pid: '02',
        require: 'url,title,pic,relatedUid',
        w: 610,
        h: 540
    }, {
        name: 'qz',
        label: 'QQ空间',
        url: function(url, title){
			return 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?' +
			$.param({
				url: url,
				desc: title || ''
			})
        },
        pid: '01',
        require: 'url,title',
        w: 600,
        h: 500
    }, {
        name: 'sq',
        label: 'QQ分享',
        url: function(title, url, pic, swf, desc){
            return 'http://connect.qq.com/widget/shareqq/index.html?' + $.param({
                url: url,
                title: title,
                summary: desc,
                site: '聚沙成塔',
                pics: pic,
                flash: swf
            })
        },
        pid: '29',
        require: 'title,url,pic,swf,desc',
        w: 750,
        h: 580
    }, {
        name: 'xn',
        label: '聚沙成塔',
        url: function(url){
            return 'http://www.connect.renren.com/sharer.do?' + $.param({
                url: url
            })
        },
        pid: '03',
        require: 'url',
        w: 600,
        h: 400
    }, {
        name: 'qt',
        label: '腾讯微博',
        url: function(title, desc, url){
            return 'http://v.t.qq.com/share/share.php?' + $.param({
                c: 'share',
                a: 'index',
                site: '聚沙成塔',
                title: title,
                descon: desc,
                url: url,
                appkey: '3be7a91cc641445fb33e2b83557b75bc'
            })
        },
        pid: '07',
        require: 'title,desc,url',
        w: 700,
        h: 580
    }, {
        name: 'tb',
        label: '百度贴吧',
        url: function(url){
            return 'http://tieba.baidu.com/f/commit/share/openShareApi?' + $.param({
                url: url
            })
        },
        pid: '24',
        require: 'url',
        w: 700,
        h: 580
    }, {
        name: 'db',
        label: '豆瓣网',
        url: function(title, url){
            return 'http://www.douban.com/recommend/?' + $.param({
                title: title,
                url: url
            })
        },
        pid: '08',
        require: 'title,url',
        w: 450,
        h: 330
    }, {
        name: 'ft',
        label: '飞信',
        url: function(title, url){
            return 'http://space.fetion.com.cn/api/share?' + $.param({
                source: '聚沙成塔',
                title: title,
                url: url
            })
        },
        pid: '12',
        require: 'title,url',
        w: 1000,
        h: 600
    },{
            name: 'wx',
            label: '微信',
            url: function(icode, lcode, type, rsd){
                return 'http://login.tudou.com/xiaonei/connect/share.action?des=wx&' + $.param({
                    icode: icode,
                    lcode: lcode,
                    type: type,
                    rsd: rsd
                })
            },
            pid: '30',
            require: 'icode,lcode,type,rsd',
            w: 700,
            h: 580

    }, {
        name: 'sh',
        label: '搜狐微博',
        url: function(title, url,pic){
            return 'http://t.sohu.com/third/post.jsp?content=utf-8&' + $.param({
                source: '聚沙成塔',
                pic: pic,
                title: title,
                url: url
            })
        },
        pid: '9',
        require: 'title,url,pic',
        w: 600,
        h: 500
    }]
});

define('module/share/share', [
	'module/share/sharesite'
], function(sharesite) {
    var S = sharesite;
	
    var shareSiteMap = {};
    S.forEach(function(item) {
        item.count = 0;
        shareSiteMap[item.name] = item
    });
    
    var def = {
        url: location.href,
        title: document.title,
        desc: document.title
    };


    function getSiteShare(site, o) {
        var op = {};
        
        for (var i = 0, j = S.length; i < j; i++) {
            if (S[i].name == site) {
                site = S[i];
                break
            }
        }
        if (!site) return null;
        return {
            url: site.url.apply(null, op),
            meta: site
        }
    }
    function share2site(site, op) {
        site = getSiteShare(site, op);
        if (!site) return;
        openPopWin(site.url, site.meta.name, {
            'width': site.meta.w,
            'height': site.meta.h
        });

    }
   
    function openPopWin(url, wname, options) {
        options = options || {};
        if (options.width && !options.left) {
            options = $.extend(options, getCenterPosition(options.width, options.height))
        }
        var op = [];
        for (var p in options) {
            op.push(p + '=' + options[p])
        }
        var win = window.open(url, wname, op.join(','));
        if (!win) {
            location.href = url
        }
    }

    function getCenterPosition(w, h) {
        return {
            left: (screen.width - w) / 2,
            top: (screen.height - h) / 2
        }
    }

    return {
        share2site: share2site
    }
});
define('tui/util/css3', function () {
    'use strict';
    var elm = document.body || document.createElement('div');
    var domPrefixes = ['webkit', 'Moz', 'ms', 'O', ''];
    var prefix;
    var animateIndex = 0;
    var Opts = {
        duration: 1000,
        'function': 'linear',
        delay: 0,
        count: 1,
        direction: 'normal'
    };
    domPrefixes.forEach(function (_prefix) {
        if ('undefined' !== typeof elm.style[_prefix + 'Animation']) {
            prefix = _prefix ? '-' + _prefix.toLowerCase() + '-' : '';
        }
    });
    var animateNameCache = {};
    var functions = {
        'in': 'ease-in',
        'out': 'ease-out',
        'in-out': 'ease-in-out',
        'snap': 'cubic-bezier(0,1,.5,1)',
        'linear': 'cubic-bezier(0.250, 0.250, 0.750, 0.750)',
        'ease-in-quad': 'cubic-bezier(0.550, 0.085, 0.680, 0.530)',
        'ease-in-cubic': 'cubic-bezier(0.550, 0.055, 0.675, 0.190)',
        'ease-in-quart': 'cubic-bezier(0.895, 0.030, 0.685, 0.220)',
        'ease-in-quint': 'cubic-bezier(0.755, 0.050, 0.855, 0.060)',
        'ease-in-sine': 'cubic-bezier(0.470, 0.000, 0.745, 0.715)',
        'ease-in-expo': 'cubic-bezier(0.950, 0.050, 0.795, 0.035)',
        'ease-in-circ': 'cubic-bezier(0.600, 0.040, 0.980, 0.335)',
        'ease-in-back': 'cubic-bezier(0.600, -0.280, 0.735, 0.045)',
        'ease-out-quad': 'cubic-bezier(0.250, 0.460, 0.450, 0.940)',
        'ease-out-cubic': 'cubic-bezier(0.215, 0.610, 0.355, 1.000)',
        'ease-out-quart': 'cubic-bezier(0.165, 0.840, 0.440, 1.000)',
        'ease-out-quint': 'cubic-bezier(0.230, 1.000, 0.320, 1.000)',
        'ease-out-sine': 'cubic-bezier(0.390, 0.575, 0.565, 1.000)',
        'ease-out-expo': 'cubic-bezier(0.190, 1.000, 0.220, 1.000)',
        'ease-out-circ': 'cubic-bezier(0.075, 0.820, 0.165, 1.000)',
        'ease-out-back': 'cubic-bezier(0.175, 0.885, 0.320, 1.275)',
        'ease-in-out-quart': 'cubic-bezier(0.770, 0.000, 0.175, 1.000)',
        'ease-in-out-quint': 'cubic-bezier(0.860, 0.000, 0.070, 1.000)',
        'ease-in-out-sine': 'cubic-bezier(0.445, 0.050, 0.550, 0.950)',
        'ease-in-out-expo': 'cubic-bezier(1.000, 0.000, 0.000, 1.000)',
        'ease-in-out-circ': 'cubic-bezier(0.785, 0.135, 0.150, 0.860)',
        'ease-in-out-back': 'cubic-bezier(0.680, -0.550, 0.265, 1.550)',
        'easeInBack': 'cubic-bezier(0.600, -0.280, 0.735, 0.045)',
        'easeInOutQuad': 'cubic-bezier(0.770, 0.000, 0.175, 1.000)',
        'easeInQuad': 'cubic-bezier(0.550, 0.085, 0.680, 0.530)',
        'easeOutBack': 'cubic-bezier(0.175, 0.885, 0.320, 1.275)',
        'easeOutQuad': 'cubic-bezier(0.165, 0.840, 0.440, 1.000)'
    };

    /**
     *
     * @param {string} animationName 绑定的css名字
     * @param {object} opts
     * @param {object|string} opts.animation
     * @param {number} [opts.duration = 1000]
     * @param {string} [opts.function = linear]
     * @param {number} [opts.delay = 0]
     * @param {number} [opts.count = 1]
     * @param {string} [opts.direction = normal] [alternate normal]
     * @return {object}
     */

    function createAnimate(opts, animationName) {
        opts = $.extend({}, Opts, opts);
        if (!opts.animation && animationName) {
            opts.animation = animationName;
        }
        if ('string' === typeof opts.animation) {
            animationName = opts.animation;
        } else {
            animationName = createKeyFrames(opts.animation, animationName);
        }
        var rtn = {};
        rtn[prefix + 'animation'] =
            [animationName , opts.duration + 'ms', functions[opts['function']] || opts['function'], opts.delay + 'ms' , opts.count, opts.direction].join(' ');
        animateNameCache[animationName] = rtn;
        return rtn;
    }

    /**
     * @method createKeyFrames 创建css动画 把css 添加到头部的style标签中
     * @param animation
     * @param animationName 指定动画名称 不知道则返回animation- 开头的名字
     * @example {from:{width:'100px'},to:{width:200px}}
     * @example {'100%':{width: '200px'},}
     * @returns {string}
     */
    function createKeyFrames(animation, animationName) {
        var index = animateIndex++;
        var $styles = $('style');
        animationName = animationName || 'animation-' + index;
        var animateValue = '';
        for (var key in animation) {
            if (key !== 'name') {
                animateValue += key + '{';
                for (var property in animation[key]) {
                    if (animation[key].hasOwnProperty(property)) {
                        animateValue += property + ':' + animation[key][property] + ';';
                    }
                }
                animateValue += '}';
            }
        }
        var cssValue = ['@' + prefix + 'keyframes' , animationName , '{' + animateValue + '}'].join(' ');
        if ($styles.length !== 0) {
            $styles.filter(':last').append(cssValue);
        } else {
            $('head').append('<style>' + cssValue + '</style>');
        }
        return animationName;
    }

    return {
        createAnimate: createAnimate,
        createKeyFrames: createKeyFrames,
        prefix: prefix
    };
});
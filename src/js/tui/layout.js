define('tui/layout', [], function () {
    /**
     * @param {Object} opts
     * @param {Number} opts.width 宽(几个单位)
     * @param {Number} opts.height 高(几个单位)
     * @param {Number} opts.big; 大的个数
     * @param {Number} opts.normal; 中的个数
     * @constructor
     */
//var demo = new Layout({height: 4, width: 10, big: 4, normal: 4});
//demo.big.forEach(function (co) {
//    $('<div class="big"></div>').css({
//        left: (co[0]) * 100 + 'px',
//        top: (co[1]) * 100 + 'px'
//    }).appendTo('#demo');
//});
//demo.normal.forEach(function (co) {
//    $('<div class="normal"></div>').css({
//        left: (co[0]) * 100 + 'px',
//        top: (co[1]) * 100 + 'px'
//    }).appendTo('#demo');
//});
//demo.small.forEach(function (co) {
//    $('<div class="small"></div>').css({
//        left: (co[0]) * 100 + 'px',
//        top: (co[1]) * 100 + 'px'
//    }).appendTo('#demo');
//});
    function Layout(opts) {
        $.extend(this, opts);
        this.matrix = (function (l) {
            var matrix = [];
            for (var i = 0; i < l; i++) {
                matrix.push(0);
            }
            return matrix;
        }(this.height));
        this.result = {
            big: [],
            normal: [],
            small: []
        };
        for (var i = 0; i < this.big; i++) {
            this.result.big.push(this.giveMeABig());
        }
        for (var j = 0; j < this.normal; j++) {
            this.result.normal.push(this.giveMeANormal());
        }
        this.populateSmall();
        //console.log(this.matrix);
        return this.result;
    }

// 10 2   return [0-8];
// 4 2    return [0-2];
    Layout.prototype.randomPoint = function (a, b) {
        return Math.floor(Math.random() * (a - (b - 1)));
    };
    Layout.prototype.giveMeABig = function () {
        var rtn;
        var width = this.width;
        var height = this.height;
        var matrix = this.matrix;
        for (var i = 0; i < Infinity; i++) {
            var x = this.randomPoint(width, 2);
            var y = this.randomPoint(height, 2);
            var line = 3 << (width - x - 2);
            if ((line & matrix[y]) === 0 && (line & matrix[y + 1]) === 0) {
                matrix[y] += line;
                matrix[y + 1] += line;
                rtn = [x, y];
                break;
            }
        }
        return rtn;
    };
    Layout.prototype.giveMeANormal = function () {
        var rtn;
        var width = this.width;
        var height = this.height;
        var matrix = this.matrix;
        for (var i = 0; i < Infinity; i++) {
            var x = this.randomPoint(width, 2);
            var y = this.randomPoint(height, 1);
            var line = 3 << (width - x - 2);
            if ((line & matrix[y]) === 0) {
                matrix[y] += line;
                rtn = [x, y];
                break;
            }
        }
        return rtn;
    };

    Layout.prototype.populateSmall = function () {
        var width = this.width;
        var small = this.result.small;
        this.matrix.forEach(function (item, y) {
            var arr = item.toString(2).split('').reverse();
            for (var x = 0; x < width; x++) {
                if (!arr[x] || arr[x] === '0') {
                    small.push([width - x - 1, y]);
                }
            }
        });
    };
    return function (opts) {
        return new Layout(opts);
    }
});
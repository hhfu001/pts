define('tui/paging', ['tui/event', 'tui/art'], function (Event, Art) {
    var Paging;
    Paging = Event.extend(
        /** @lends Paging.prototype */
        {
            /**
             * @constructor Paging
             * @param {object} [opts]
             * @param {number} [number]
             */
            initialize: function (opts, number) {
                Paging.superClass.initialize.apply(this, arguments);
                opts = opts || {};
                this.setNumber(number)
                    .setOptions(opts);
            },
            render: function () {
                var self = this;
                if (!this.opts.el instanceof $) {
                    this.opts.el = $(this.opts.el);
                }
                $('a', this.opts.el.html(this.html)).click(function (e) {
                    e.preventDefault();
                    self.setPage($(this).data("page"));
                });
            },
            /**
             * 设置paging处理的数量
             * @param {number} number
             * @returns {Paging}
             */
            setNumber: function (number) {
                this.number = (undefined === number || number < 0) ? -1 : number;
                return this;
            },
            /**
             * 设置paging 配置
             * @param opts
             * @returns {Paging}
             */
            setOptions: function (opts) {
                this.opts = $.extend({}, this.opts || Paging.DEFAULT, opts);
                if ('function' != typeof this.opts.tpl) {
                    this.opts.tpl = Art.compile(this.opts.tpl);
                }
                this.opts.lapping |= 0;
                this.opts.perpage |= 0;
                if (this.opts.page !== null) this.opts.page |= 0;

                // If the number of elements per page is less then 1, set it to default
                if (this.opts.perpage < 1) {
                    this.opts.perpage = 10;
                }

                this.format = this._parseFormat(this.opts.format);

                return this;
            },
            /**
             * 设置当前页
             * @param {number} [page]
             * @returns {Paging}
             */
            setPage: function (page) {
                var _page = null;
                if (undefined === page) {
                    page = this.opts.page;
                    if (null === page) {
                        return this;
                    }
                } else if (this.opts.page == page) {
                    return this;
                } else if (this.opts.page !== page) {
                    _page = this.opts.page;
                }

                var tpl = this.opts.tpl;
                this.opts.page = page;

                var number = this.number;

                var opts = this.opts;

                var rStart, rStop;

                var pages, stack = [];

                var groups = 1, format = this.format;

                var data, tmp, node, lapping;

                var count = format.fstack.length, i = count;


                // If the lapping is greater than perpage, reduce it to perpage - 1 to avoid endless loops
                if (opts.perpage <= opts.lapping) {
                    opts.lapping = opts.perpage - 1;
                }

                lapping = number <= opts.lapping ? 0 : opts.lapping | 0;


                // If the number is negative, the value doesn"t matter, we loop endlessly with a constant width
                if (number < 0) {

                    number = -1;
                    pages = -1;

                    rStart = Math.max(1, page - format.current + 1 - lapping);
                    rStop = rStart + format.blockwide;

                } else {

                    // Calculate the number of pages
                    pages = 1 + Math.ceil((number - opts.perpage) / (opts.perpage - lapping));

                    // If current page is negative, start at the end and
                    // Set the current page into a valid range, includes 0, which is set to 1
                    page = Math.max(1, Math.min(page < 0 ? 1 + pages + page : page, pages));

                    // Do we need to print all numbers?
                    if (format.asterisk) {
                        rStart = 1;
                        rStop = 1 + pages;

                        // Disable :first and :last for asterisk mode as we see all buttons
                        format.current = page;
                        format.blockwide = pages;

                    } else {

                        // If no, start at the best position and stop at max width or at num of pages
                        rStart = Math.max(1, Math.min(page - format.current, pages - format.blockwide) + 1);
                        rStop = format.inactive ? rStart + format.blockwide : Math.min(rStart + format.blockwide, 1 + pages);
                    }
                }

                while (i--) {

                    tmp = 0; // default everything is visible
                    node = format.fstack[i];

                    switch (node.ftype) {

                        case "left":
                            tmp = (node.fpos < rStart);
                            break;
                        case "right":
                            tmp = (rStop <= pages - format.rights + node.fpos);
                            break;

                        case "first":
                            tmp = (format.current < page);
                            break;
                        case "last":
                            tmp = (format.blockwide < format.current + pages - page);
                            break;

                        case "prev":
                            tmp = (1 < page);
                            break;
                        case "next":
                            tmp = (page < pages);
                            break;
                    }
                    groups |= tmp << node.fgroup; // group visible?
                }

                data = {
                    "number": number,	// number of elements
                    "lapping": lapping,	// overlapping
                    "pages": pages,	// number of pages
                    "perpage": opts.perpage, // number of elements per page
                    "page": page,		// current page
                    "slice": [			// two element array with bounds of the current page selection
                            (tmp = page * (opts.perpage - lapping) + lapping) - opts.perpage, // Lower bound
                        Math.min(tmp, number) // Upper bound
                    ],
                    prev: _page,
                    current: format.current,
                    lefts: format.lefts,
                    rights: format.rights,
                    blockwide: format.blockwide
                };

                while (++i < count) {
                    node = format.fstack[i];
                    tmp = (groups >> node.fgroup & 1);
                    data.ftype = node.ftype;
                    switch (node.ftype) {
                        case "block":
                            for (; rStart < rStop; ++rStart) {
                                data.value = rStart;
                                data.pos = 1 + format.blockwide - rStop + rStart;
                                data.active = rStart <= pages || number < 0;     // true if infinity series and rStart <= pages
                                stack.push($.extend({}, data));
                            }
                            continue;

                        case "left":
                            data.value = node.fpos;
                            data.active = node.fpos < rStart; // Don't take group-visibility into account!
                            break;

                        case "right":
                            data.value = pages - format.rights + node.fpos;
                            data.active = rStop <= data.value; // Don't take group-visibility into account!
                            break;

                        case "first":
                            data.value = 1;
                            data.active = tmp && 1 < page;
                            break;

                        case "last":
                            if ((data.active = (number < 0))) {
                                data.value = 1 + page;
                            } else {
                                data.value = pages;
                                data.active = tmp && page < pages;
                            }
                            break;

                        case "prev":
                            data.value = Math.max(1, page - 1);
                            data.active = tmp && 1 < page;
                            break;

                        case "next":
                            if ((data.active = (number < 0))) {
                                data.value = 1 + page;
                            } else {
                                data.value = Math.min(1 + page, pages);
                                data.active = tmp && page < pages;
                            }
                            break;
                        case "leap":
                            data.active = tmp && ((page > data.lefts + data.current && node.fpos == 1) || (page < data.pages - data.rights - data.blockwide + data.current && node.fpos == 2)); // tmp is true by default and changes only for group behaviour
                            break;

                        case "fill":
                            data.active = tmp; // tmp is true by default and changes only for group behaviour
                            break;
                    }
                    data.pos = node.fpos;
                    stack.push($.extend({}, data));
                }
                this.html = tpl({stack: stack});
                this.render();
                this.trigger('PAGING:SELECT', [data, this]);
                return this;
            },
            _parseFormat: function (format) {
                var gndx = 0, group = 0, num = 1, res = {
                    fstack: [], // format stack
                    asterisk: 0, // asterisk?
                    inactive: 0, // fill empty pages with inactives up to w?
                    blockwide: 5, // width of number block
                    current: 3, // position of current element in number block
                    rights: 0, // num of rights
                    lefts: 0 // num of lefts
                }, tok, pattern = /[*<>pq\[\]().-]|[nc]+!?/g;

                var known = {
                    "[": "first",
                    "]": "last",
                    "<": "prev",
                    ">": "next",
                    "q": "left",
                    "p": "right",
                    "-": "fill",
                    ".": "leap"
                }, count = {};

                while ((tok = pattern.exec(format))) {

                    tok = String(tok);

                    if (undefined === known[tok]) {

                        if ("(" === tok) {
                            group = ++gndx;
                        } else if (")" === tok) {
                            group = 0;
                        } else if (num) {

                            if ("*" === tok) {
                                res.asterisk = 1;
                                res.inactive = 0;
                            } else {
                                // number block is the only thing left here
                                res.asterisk = 0;
                                res.inactive = "!" === tok.charAt(tok.length - 1);
                                res.blockwide = tok.length - res.inactive;
                                if (!(res.current = 1 + tok.indexOf("c"))) {
                                    res.current = Math.floor((1 + res.blockwide) / 2);
                                }
                            }

                            res.fstack[res.fstack.length] = ({
                                ftype: "block",	// type
                                fgroup: 0,		// group
                                fpos: 0		// pos
                            });
                            num = 0;
                        }

                    } else {

                        res.fstack[res.fstack.length] = ({
                            ftype: known[tok], // type
                            fgroup: group,      // group
                            fpos: undefined === count[tok] ? count[tok] = 1 : ++count[tok] // pos
                        });

                        if ("q" === tok)
                            ++res.lefts;
                        else if ("p" === tok)
                            ++res.rights;
                    }
                }
                return res;
            }
        });

    Paging.DEFAULT = {
        lapping: 0,	// number of elements overlap
        perpage: 10,	// number of elements per page
        page: 1,	// current page
        format: '',	// visual format string
        tpl: ''
    };
    return Paging;
});
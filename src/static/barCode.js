! function (t) {
    function e(r) {
        if (n[r]) return n[r].exports;
        var o = n[r] = {
            i: r,
            l: !1,
            exports: {}
        };
        return t[r].call(o.exports, o, o.exports, e), o.l = !0, o.exports
    }
    var n = {};
    return e.m = t, e.c = n, e.i = function (t) {
        return t
    }, e.d = function (t, e, n) {
        Object.defineProperty(t, e, {
            configurable: !1,
            enumerable: !0,
            get: n
        })
    }, e.n = function (t) {
        var n = t && t.__esModule ? function () {
            return t["default"]
        } : function () {
            return t
        };
        return e.d(n, "a", n), n
    }, e.o = function (t, e) {
        return Object.prototype.hasOwnProperty.call(t, e)
    }, e.p = "", e(e.s = 22)
}([function (t, e) {
    "use strict";

    function n(t, e) {
        var n, r = {};
        for (n in t) t.hasOwnProperty(n) && (r[n] = t[n]);
        for (n in e) e.hasOwnProperty(n) && "undefined" != typeof e[n] && (r[n] = e[n]);
        return r
    }
    Object.defineProperty(e, "__esModule", {
        value: !0
    }), e["default"] = n
}, function (t, e, n) {
    "use strict";

    function r(t) {
        return t && t.__esModule ? t : {
            "default": t
        }
    }
    function o(t, e) {
        if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function")
    }
    function i(t, e) {
        if (!t) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
    }
    function a(t, e) {
        if ("function" != typeof e && null !== e) throw new TypeError(
            "Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
            constructor: {
                value: t,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        }), e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
    }
    Object.defineProperty(e, "__esModule", {
        value: !0
    });
    var s = n(11),
        u = r(s),
        f = function (t) {
            function e(n, r) {
                o(this, e);
                var a = i(this, t.call(this, n.substring(1), r));
                a.bytes = [];
                for (var s = 0; s < n.length; ++s) a.bytes.push(n.charCodeAt(s));
                return a.encodings = [740, 644, 638, 176, 164, 100, 224, 220, 124, 608, 604, 572, 436, 244, 230,
                    484, 260, 254, 650, 628, 614, 764, 652, 902, 868, 836, 830, 892, 844, 842, 752, 734, 590,
                    304, 112, 94, 416, 128, 122, 672, 576, 570, 464, 422, 134, 496, 478, 142, 910, 678, 582,
                    768, 762, 774, 880, 862, 814, 896, 890, 818, 914, 602, 930, 328, 292, 200, 158, 68, 62, 424,
                    412, 232, 218, 76, 74, 554, 616, 978, 556, 146, 340, 212, 182, 508, 268, 266, 956, 940, 938,
                    758, 782, 974, 400, 310, 118, 512, 506, 960, 954, 502, 518, 886, 966, 668, 680, 692, 5379],
                    a
            }
            return a(e, t), e.prototype.encode = function () {
                var t, e = this.bytes,
                    n = e.shift() - 105;
                if (103 === n) t = this.nextA(e, 1);
                else if (104 === n) t = this.nextB(e, 1);
                else {
                    if (105 !== n) throw new c;
                    t = this.nextC(e, 1)
                }
                return {
                    text: this.text == this.data ? this.text.replace(/[^\x20-\x7E]/g, "") : this.text,
                    data: this.getEncoding(n) + t.result + this.getEncoding((t.checksum + n) % 103) + this.getEncoding(
                        106)
                }
            }, e.prototype.getEncoding = function (t) {
                return this.encodings[t] ? (this.encodings[t] + 1e3).toString(2) : ""
            }, e.prototype.valid = function () {
                return this.data.search(/^[\x00-\x7F\xC8-\xD3]+$/) !== -1
            }, e.prototype.nextA = function (t, e) {
                if (t.length <= 0) return {
                    result: "",
                    checksum: 0
                };
                var n, r;
                if (t[0] >= 200) r = t[0] - 105, t.shift(), 99 === r ? n = this.nextC(t, e + 1) : 100 === r ? n =
                    this.nextB(t, e + 1) : 98 === r ? (t[0] = t[0] > 95 ? t[0] - 96 : t[0], n = this.nextA(t, e +
                    1)) : n = this.nextA(t, e + 1);
                else {
                    var o = t[0];
                    r = o < 32 ? o + 64 : o - 32, t.shift(), n = this.nextA(t, e + 1)
                }
                var i = this.getEncoding(r),
                    a = r * e;
                return {
                    result: i + n.result,
                    checksum: a + n.checksum
                }
            }, e.prototype.nextB = function (t, e) {
                if (t.length <= 0) return {
                    result: "",
                    checksum: 0
                };
                var n, r;
                t[0] >= 200 ? (r = t[0] - 105, t.shift(), 99 === r ? n = this.nextC(t, e + 1) : 101 === r ? n =
                    this.nextA(t, e + 1) : 98 === r ? (t[0] = t[0] < 32 ? t[0] + 96 : t[0], n = this.nextB(t, e + 1)) :
                    n = this.nextB(t, e + 1)) : (r = t[0] - 32, t.shift(), n = this.nextB(t, e + 1));
                var o = this.getEncoding(r),
                    i = r * e;
                return {
                    result: o + n.result,
                    checksum: i + n.checksum
                }
            }, e.prototype.nextC = function (t, e) {
                if (t.length <= 0) return {
                    result: "",
                    checksum: 0
                };
                var n, r;
                t[0] >= 200 ? (r = t[0] - 105, t.shift(), n = 100 === r ? this.nextB(t, e + 1) : 101 === r ? this.nextA(
                    t, e + 1) : this.nextC(t, e + 1)) : (r = 10 * (t[0] - 48) + t[1] - 48, t.shift(), t.shift(), n =
                    this.nextC(t, e + 1));
                var o = this.getEncoding(r),
                    i = r * e;
                return {
                    result: o + n.result,
                    checksum: i + n.checksum
                }
            }, e
        }(u["default"]),
        c = function (t) {
            function e() {
                o(this, e);
                var n = i(this, t.call(this));
                return n.name = "InvalidStartCharacterException", n.message =
                    "The encoding does not start with a start character.", n
            }
            return a(e, t), e
        }(Error);
    e["default"] = f
}, function (t, e) {
    "use strict";

    function n(t, e) {
        if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function")
    }
    function r(t, e) {
        if (!t) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
    }
    function o(t, e) {
        if ("function" != typeof e && null !== e) throw new TypeError(
            "Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
            constructor: {
                value: t,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        }), e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
    }
    Object.defineProperty(e, "__esModule", {
        value: !0
    });
    var i = function (t) {
            function e(o, i) {
                n(this, e);
                var a = r(this, t.call(this));
                return a.name = "InvalidInputException", a.symbology = o, a.input = i, a.message = '"' + a.input +
                    '" is not a valid input for ' + a.symbology, a
            }
            return o(e, t), e
        }(Error),
        a = function (t) {
            function e() {
                n(this, e);
                var o = r(this, t.call(this));
                return o.name = "InvalidElementException", o.message = "Not supported type to render on", o
            }
            return o(e, t), e
        }(Error),
        s = function (t) {
            function e() {
                n(this, e);
                var o = r(this, t.call(this));
                return o.name = "NoElementException", o.message = "No element to render on.", o
            }
            return o(e, t), e
        }(Error);
    e.InvalidInputException = i, e.InvalidElementException = a, e.NoElementException = s
}, function (t, e) {
    "use strict";

    function n(t) {
        var e = ["width", "height", "textMargin", "fontSize", "margin", "marginTop", "marginBottom", "marginLeft",
            "marginRight"];
        for (var n in e) e.hasOwnProperty(n) && (n = e[n], "string" == typeof t[n] && (t[n] = parseInt(t[n], 10)));
        return "string" == typeof t.displayValue && (t.displayValue = "false" != t.displayValue), t
    }
    Object.defineProperty(e, "__esModule", {
        value: !0
    }), e["default"] = n
}, function (t, e) {
    "use strict";
    Object.defineProperty(e, "__esModule", {
        value: !0
    });
    var n = {
        width: 2,
        height: 100,
        format: "auto",
        displayValue: !0,
        fontOptions: "",
        font: "monospace",
        text: void 0,
        textAlign: "center",
        textPosition: "bottom",
        textMargin: 2,
        fontSize: 20,
        background: "#ffffff",
        lineColor: "#000000",
        margin: 10,
        marginTop: void 0,
        marginBottom: void 0,
        marginLeft: void 0,
        marginRight: void 0,
        valid: function () {}
    };
    e["default"] = n
}, function (t, e, n) {
    "use strict";

    function r(t) {
        return t && t.__esModule ? t : {
            "default": t
        }
    }
    function o(t, e) {
        return e.height + (e.displayValue && t.text.length > 0 ? e.fontSize + e.textMargin : 0) + e.marginTop + e.marginBottom
    }
    function i(t, e, n) {
        if (n.displayValue && e < t) {
            if ("center" == n.textAlign) return Math.floor((t - e) / 2);
            if ("left" == n.textAlign) return 0;
            if ("right" == n.textAlign) return Math.floor(t - e)
        }
        return 0
    }
    function a(t, e, n) {
        for (var r = 0; r < t.length; r++) {
            var a, s = t[r],
                u = (0, l["default"])(e, s.options);
            a = u.displayValue ? f(s.text, u, n) : 0;
            var c = s.data.length * u.width;
            s.width = Math.ceil(Math.max(a, c)), s.height = o(s, u), s.barcodePadding = i(a, c, u)
        }
    }
    function s(t) {
        for (var e = 0, n = 0; n < t.length; n++) e += t[n].width;
        return e
    }
    function u(t) {
        for (var e = 0, n = 0; n < t.length; n++) t[n].height > e && (e = t[n].height);
        return e
    }
    function f(t, e, n) {
        var r;
        r = "undefined" == typeof n ? document.createElement("canvas").getContext("2d") : n, r.font = e.fontOptions +
            " " + e.fontSize + "px " + e.font;
        var o = r.measureText(t).width;
        return o
    }
    Object.defineProperty(e, "__esModule", {
        value: !0
    }), e.getTotalWidthOfEncodings = e.calculateEncodingAttributes = e.getBarcodePadding = e.getEncodingHeight = e.getMaximumHeightOfEncodings =
        void 0;
    var c = n(0),
        l = r(c);
    e.getMaximumHeightOfEncodings = u, e.getEncodingHeight = o, e.getBarcodePadding = i, e.calculateEncodingAttributes =
        a, e.getTotalWidthOfEncodings = s
}, function (t, e, n) {
    "use strict";
    Object.defineProperty(e, "__esModule", {
        value: !0
    });
    var r = n(16);
    e["default"] = {
        CODE128: r.CODE128,
        CODE128A: r.CODE128A,
        CODE128B: r.CODE128B,
        CODE128C: r.CODE128C
    }
}, function (t, e) {
    "use strict";

    function n(t, e) {
        if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function")
    }
    Object.defineProperty(e, "__esModule", {
        value: !0
    });
    var r = function () {
        function t(e) {
            n(this, t), this.api = e
        }
        return t.prototype.handleCatch = function (t) {
            if ("InvalidInputException" !== t.name) throw t;
            if (this.api._options.valid === this.api._defaults.valid) throw t.message;
            this.api._options.valid(!1), this.api.render = function () {}
        }, t.prototype.wrapBarcodeCall = function (t) {
            try {
                var e = t.apply(void 0, arguments);
                return this.api._options.valid(!0), e
            } catch (n) {
                return this.handleCatch(n), this.api
            }
        }, t
    }();
    e["default"] = r
}, function (t, e) {
    "use strict";

    function n(t) {
        return t.marginTop = t.marginTop || t.margin, t.marginBottom = t.marginBottom || t.margin, t.marginRight =
            t.marginRight || t.margin, t.marginLeft = t.marginLeft || t.margin, t
    }
    Object.defineProperty(e, "__esModule", {
        value: !0
    }), e["default"] = n
}, function (t, e, n) {
    "use strict";

    function r(t) {
        return t && t.__esModule ? t : {
            "default": t
        }
    }
    function o(t) {
        if ("string" == typeof t) return i(t);
        if (Array.isArray(t)) {
            for (var e = [], n = 0; n < t.length; n++) e.push(o(t[n]));
            return e
        }
        if ("undefined" != typeof HTMLCanvasElement && t instanceof HTMLImageElement) return a(t);
        if ("undefined" != typeof SVGElement && t instanceof SVGElement) return {
            element: t,
            options: (0, f["default"])(t),
            renderer: l["default"].SVGRenderer
        };
        if ("undefined" != typeof HTMLCanvasElement && t instanceof HTMLCanvasElement) return {
            element: t,
            options: (0, f["default"])(t),
            renderer: l["default"].CanvasRenderer
        };
        if (t && t.getContext) return {
            element: t,
            renderer: l["default"].CanvasRenderer
        };
        if (t && "object" === ("undefined" == typeof t ? "undefined" : s(t)) && !t.nodeName) return {
            element: t,
            renderer: l["default"].ObjectRenderer
        };
        throw new d.InvalidElementException
    }
    function i(t) {
        var e = document.querySelectorAll(t);
        if (0 !== e.length) {
            for (var n = [], r = 0; r < e.length; r++) n.push(o(e[r]));
            return n
        }
    }
    function a(t) {
        var e = document.createElement("canvas");
        return {
            element: e,
            options: (0, f["default"])(t),
            renderer: l["default"].CanvasRenderer,
            afterRender: function () {
                t.setAttribute("src", e.toDataURL())
            }
        }
    }
    Object.defineProperty(e, "__esModule", {
        value: !0
    });
    var s = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (t) {
            return typeof t
        } : function (t) {
            return t && "function" == typeof Symbol && t.constructor === Symbol ? "symbol" : typeof t
        }, u = n(17),
        f = r(u),
        c = n(19),
        l = r(c),
        d = n(2);
    e["default"] = o
}, function (t, e) {
    "use strict";

    function n(t) {
        function e(t) {
            if (Array.isArray(t)) for (var r = 0; r < t.length; r++) e(t[r]);
            else t.text = t.text || "", t.data = t.data || "", n.push(t)
        }
        var n = [];
        return e(t), n
    }
    Object.defineProperty(e, "__esModule", {
        value: !0
    }), e["default"] = n
}, function (t, e) {
    "use strict";

    function n(t, e) {
        if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function")
    }
    Object.defineProperty(e, "__esModule", {
        value: !0
    });
    var r = function o(t, e) {
        n(this, o), this.data = t, this.text = e.text || t, this.options = e
    };
    e["default"] = r
}, function (t, e, n) {
    "use strict";

    function r(t) {
        return t && t.__esModule ? t : {
            "default": t
        }
    }
    function o(t, e) {
        if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function")
    }
    function i(t, e) {
        if (!t) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
    }
    function a(t, e) {
        if ("function" != typeof e && null !== e) throw new TypeError(
            "Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
            constructor: {
                value: t,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        }), e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
    }
    Object.defineProperty(e, "__esModule", {
        value: !0
    });
    var s = n(1),
        u = r(s),
        f = function (t) {
            function e(n, r) {
                return o(this, e), i(this, t.call(this, String.fromCharCode(208) + n, r))
            }
            return a(e, t), e.prototype.valid = function () {
                return this.data.search(/^[\x00-\x5F\xC8-\xCF]+$/) !== -1
            }, e
        }(u["default"]);
    e["default"] = f
}, function (t, e, n) {
    "use strict";

    function r(t) {
        return t && t.__esModule ? t : {
            "default": t
        }
    }
    function o(t, e) {
        if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function")
    }
    function i(t, e) {
        if (!t) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
    }
    function a(t, e) {
        if ("function" != typeof e && null !== e) throw new TypeError(
            "Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
            constructor: {
                value: t,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        }), e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
    }
    Object.defineProperty(e, "__esModule", {
        value: !0
    });
    var s = n(1),
        u = r(s),
        f = function (t) {
            function e(n, r) {
                return o(this, e), i(this, t.call(this, String.fromCharCode(209) + n, r))
            }
            return a(e, t), e.prototype.valid = function () {
                return this.data.search(/^[\x20-\x7F\xC8-\xCF]+$/) !== -1
            }, e
        }(u["default"]);
    e["default"] = f
}, function (t, e, n) {
    "use strict";

    function r(t) {
        return t && t.__esModule ? t : {
            "default": t
        }
    }
    function o(t, e) {
        if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function")
    }
    function i(t, e) {
        if (!t) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
    }
    function a(t, e) {
        if ("function" != typeof e && null !== e) throw new TypeError(
            "Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
            constructor: {
                value: t,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        }), e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
    }
    Object.defineProperty(e, "__esModule", {
        value: !0
    });
    var s = n(1),
        u = r(s),
        f = function (t) {
            function e(n, r) {
                return o(this, e), i(this, t.call(this, String.fromCharCode(210) + n, r))
            }
            return a(e, t), e.prototype.valid = function () {
                return this.data.search(/^(\xCF*[0-9]{2}\xCF*)+$/) !== -1
            }, e
        }(u["default"]);
    e["default"] = f
}, function (t, e, n) {
    "use strict";

    function r(t) {
        return t && t.__esModule ? t : {
            "default": t
        }
    }
    function o(t, e) {
        if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function")
    }
    function i(t, e) {
        if (!t) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
    }
    function a(t, e) {
        if ("function" != typeof e && null !== e) throw new TypeError(
            "Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
            constructor: {
                value: t,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        }), e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
    }
    function s(t) {
        var e, n = t.match(/^[\x00-\x5F\xC8-\xCF]*/)[0].length,
            r = t.match(/^[\x20-\x7F\xC8-\xCF]*/)[0].length,
            o = t.match(/^(\xCF*[0-9]{2}\xCF*)*/)[0].length;
        return e = o >= 2 ? String.fromCharCode(210) + c(t) : n > r ? String.fromCharCode(208) + u(t) : String.fromCharCode(
            209) + f(t), e = e.replace(/[\xCD\xCE]([^])[\xCD\xCE]/, function (t, e) {
            return String.fromCharCode(203) + e
        })
    }
    function u(t) {
        var e = t.match(/^([\x00-\x5F\xC8-\xCF]+?)(([0-9]{2}){2,})([^0-9]|$)/);
        if (e) return e[1] + String.fromCharCode(204) + c(t.substring(e[1].length));
        var n = t.match(/^[\x00-\x5F\xC8-\xCF]+/);
        return n[0].length === t.length ? t : n[0] + String.fromCharCode(205) + f(t.substring(n[0].length))
    }
    function f(t) {
        var e = t.match(/^([\x20-\x7F\xC8-\xCF]+?)(([0-9]{2}){2,})([^0-9]|$)/);
        if (e) return e[1] + String.fromCharCode(204) + c(t.substring(e[1].length));
        var n = t.match(/^[\x20-\x7F\xC8-\xCF]+/);
        return n[0].length === t.length ? t : n[0] + String.fromCharCode(206) + u(t.substring(n[0].length))
    }
    function c(t) {
        var e = t.match(/^(\xCF*[0-9]{2}\xCF*)+/)[0],
            n = e.length;
        if (n === t.length) return t;
        t = t.substring(n);
        var r = t.match(/^[\x00-\x5F\xC8-\xCF]*/)[0].length,
            o = t.match(/^[\x20-\x7F\xC8-\xCF]*/)[0].length;
        return r >= o ? e + String.fromCharCode(206) + u(t) : e + String.fromCharCode(205) + f(t)
    }
    Object.defineProperty(e, "__esModule", {
        value: !0
    });
    var l = n(1),
        d = r(l),
        h = function (t) {
            function e(n, r) {
                if (o(this, e), n.search(/^[\x00-\x7F\xC8-\xD3]+$/) !== -1) var a = i(this, t.call(this, s(n), r));
                else var a = i(this, t.call(this, n, r));
                return i(a)
            }
            return a(e, t), e
        }(d["default"]);
    e["default"] = h
}, function (t, e, n) {
    "use strict";

    function r(t) {
        return t && t.__esModule ? t : {
            "default": t
        }
    }
    Object.defineProperty(e, "__esModule", {
        value: !0
    }), e.CODE128C = e.CODE128B = e.CODE128A = e.CODE128 = void 0;
    var o = n(15),
        i = r(o),
        a = n(12),
        s = r(a),
        u = n(13),
        f = r(u),
        c = n(14),
        l = r(c);
    e.CODE128 = i["default"], e.CODE128A = s["default"], e.CODE128B = f["default"], e.CODE128C = l["default"]
}, function (t, e, n) {
    "use strict";

    function r(t) {
        return t && t.__esModule ? t : {
            "default": t
        }
    }
    function o(t) {
        var e = {};
        for (var n in u["default"]) u["default"].hasOwnProperty(n) && (t.hasAttribute("jsbarcode-" + n.toLowerCase()) &&
        (e[n] = t.getAttribute("jsbarcode-" + n.toLowerCase())), t.hasAttribute("data-" + n.toLowerCase()) &&
        (e[n] = t.getAttribute("data-" + n.toLowerCase())));
        return e.value = t.getAttribute("jsbarcode-value") || t.getAttribute("data-value"), e = (0, a["default"])(e)
    }
    Object.defineProperty(e, "__esModule", {
        value: !0
    });
    var i = n(3),
        a = r(i),
        s = n(4),
        u = r(s);
    e["default"] = o
}, function (t, e, n) {
    "use strict";

    function r(t) {
        return t && t.__esModule ? t : {
            "default": t
        }
    }
    function o(t, e) {
        if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function")
    }
    Object.defineProperty(e, "__esModule", {
        value: !0
    });
    var i = n(0),
        a = r(i),
        s = n(5),
        u = function () {
            function t(e, n, r) {
                o(this, t), this.canvas = e, this.encodings = n, this.options = r
            }
            return t.prototype.render = function () {
                if (!this.canvas.getContext) throw new Error("The browser does not support canvas.");
                this.prepareCanvas();
                for (var t = 0; t < this.encodings.length; t++) {
                    var e = (0, a["default"])(this.options, this.encodings[t].options);
                    this.drawCanvasBarcode(e, this.encodings[t]), this.drawCanvasText(e, this.encodings[t]), this.moveCanvasDrawing(
                        this.encodings[t])
                }
                this.restoreCanvas()
            }, t.prototype.prepareCanvas = function () {
                var t = this.canvas.getContext("2d");
                t.save(), (0, s.calculateEncodingAttributes)(this.encodings, this.options, t);
                var e = (0, s.getTotalWidthOfEncodings)(this.encodings),
                    n = (0, s.getMaximumHeightOfEncodings)(this.encodings);
                this.canvas.width = e + this.options.marginLeft + this.options.marginRight, this.canvas.height = n,
                    t.clearRect(0, 0, this.canvas.width, this.canvas.height), this.options.background && (t.fillStyle =
                    this.options.background, t.fillRect(0, 0, this.canvas.width, this.canvas.height)), t.translate(
                    this.options.marginLeft, 0)
            }, t.prototype.drawCanvasBarcode = function (t, e) {
                var n, r = this.canvas.getContext("2d"),
                    o = e.data;
                n = "top" == t.textPosition ? t.marginTop + t.fontSize + t.textMargin : t.marginTop, r.fillStyle =
                    t.lineColor;
                for (var i = 0; i < o.length; i++) {
                    var a = i * t.width + e.barcodePadding;
                    "1" === o[i] ? r.fillRect(a, n, t.width, t.height) : o[i] && r.fillRect(a, n, t.width, t.height *
                        o[i])
                }
            }, t.prototype.drawCanvasText = function (t, e) {
                var n = this.canvas.getContext("2d"),
                    r = t.fontOptions + " " + t.fontSize + "px " + t.font;
                if (t.displayValue) {
                    var o, i;
                    i = "top" == t.textPosition ? t.marginTop + t.fontSize - t.textMargin : t.height + t.textMargin +
                        t.marginTop + t.fontSize, n.font = r, "left" == t.textAlign || e.barcodePadding > 0 ? (o =
                        0, n.textAlign = "left") : "right" == t.textAlign ? (o = e.width - 1, n.textAlign = "right") :
                        (o = e.width / 2, n.textAlign = "center"), n.fillText(e.text, o, i)
                }
            }, t.prototype.moveCanvasDrawing = function (t) {
                var e = this.canvas.getContext("2d");
                e.translate(t.width, 0)
            }, t.prototype.restoreCanvas = function () {
                var t = this.canvas.getContext("2d");
                t.restore()
            }, t
        }();
    e["default"] = u
}, function (t, e, n) {
    "use strict";

    function r(t) {
        return t && t.__esModule ? t : {
            "default": t
        }
    }
    Object.defineProperty(e, "__esModule", {
        value: !0
    });
    var o = n(18),
        i = r(o),
        a = n(21),
        s = r(a),
        u = n(20),
        f = r(u);
    e["default"] = {
        CanvasRenderer: i["default"],
        SVGRenderer: s["default"],
        ObjectRenderer: f["default"]
    }
}, function (t, e) {
    "use strict";

    function n(t, e) {
        if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function")
    }
    Object.defineProperty(e, "__esModule", {
        value: !0
    });
    var r = function () {
        function t(e, r, o) {
            n(this, t), this.object = e, this.encodings = r, this.options = o
        }
        return t.prototype.render = function () {
            this.object.encodings = this.encodings
        }, t
    }();
    e["default"] = r
}, function (t, e, n) {
    "use strict";

    function r(t) {
        return t && t.__esModule ? t : {
            "default": t
        }
    }
    function o(t, e) {
        if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function")
    }
    function i(t, e, n) {
        var r = document.createElementNS(l, "g");
        return r.setAttribute("transform", "translate(" + t + ", " + e + ")"), n.appendChild(r), r
    }
    function a(t, e) {
        t.setAttribute("style", "fill:" + e.lineColor + ";")
    }
    function s(t, e, n, r, o) {
        var i = document.createElementNS(l, "rect");
        return i.setAttribute("x", t), i.setAttribute("y", e), i.setAttribute("width", n), i.setAttribute("height",
            r), o.appendChild(i), i
    }
    Object.defineProperty(e, "__esModule", {
        value: !0
    });
    var u = n(0),
        f = r(u),
        c = n(5),
        l = "http://www.w3.org/2000/svg",
        d = function () {
            function t(e, n, r) {
                o(this, t), this.svg = e, this.encodings = n, this.options = r
            }
            return t.prototype.render = function () {
                var t = this.options.marginLeft;
                this.prepareSVG();
                for (var e = 0; e < this.encodings.length; e++) {
                    var n = this.encodings[e],
                        r = (0, f["default"])(this.options, n.options),
                        o = i(t, r.marginTop, this.svg);
                    a(o, r), this.drawSvgBarcode(o, r, n), this.drawSVGText(o, r, n), t += n.width
                }
            }, t.prototype.prepareSVG = function () {
                for (; this.svg.firstChild;) this.svg.removeChild(this.svg.firstChild);
                (0, c.calculateEncodingAttributes)(this.encodings, this.options);
                var t = (0, c.getTotalWidthOfEncodings)(this.encodings),
                    e = (0, c.getMaximumHeightOfEncodings)(this.encodings),
                    n = t + this.options.marginLeft + this.options.marginRight;
                this.setSvgAttributes(n, e), this.options.background && s(0, 0, n, e, this.svg).setAttribute(
                    "style", "fill:" + this.options.background + ";")
            }, t.prototype.drawSvgBarcode = function (t, e, n) {
                var r, o = n.data;
                r = "top" == e.textPosition ? e.fontSize + e.textMargin : 0;
                for (var i = 0, a = 0, u = 0; u < o.length; u++) a = u * e.width + n.barcodePadding, "1" === o[u] ?
                    i++ : i > 0 && (s(a - e.width * i, r, e.width * i, e.height, t), i = 0);
                i > 0 && s(a - e.width * (i - 1), r, e.width * i, e.height, t)
            }, t.prototype.drawSVGText = function (t, e, n) {
                var r = document.createElementNS(l, "text");
                if (e.displayValue) {
                    var o, i;
                    r.setAttribute("style", "font:" + e.fontOptions + " " + e.fontSize + "px " + e.font), i = "top" ==
                    e.textPosition ? e.fontSize - e.textMargin : e.height + e.textMargin + e.fontSize, "left" ==
                    e.textAlign || n.barcodePadding > 0 ? (o = 0, r.setAttribute("text-anchor", "start")) :
                        "right" == e.textAlign ? (o = n.width - 1, r.setAttribute("text-anchor", "end")) : (o = n.width /
                            2, r.setAttribute("text-anchor", "middle")), r.setAttribute("x", o), r.setAttribute("y", i),
                        r.appendChild(document.createTextNode(n.text)), t.appendChild(r)
                }
            }, t.prototype.setSvgAttributes = function (t, e) {
                var n = this.svg;
                n.setAttribute("width", t + "px"), n.setAttribute("height", e + "px"), n.setAttribute("x", "0px"),
                    n.setAttribute("y", "0px"), n.setAttribute("viewBox", "0 0 " + t + " " + e), n.setAttribute(
                    "xmlns", l), n.setAttribute("version", "1.1"), n.style.transform = "translate(0,0)"
            }, t
        }();
    e["default"] = d
}, function (t, e, n) {
    "use strict";

    function r(t) {
        return t && t.__esModule ? t : {
            "default": t
        }
    }
    function o(t, e) {
        O.prototype[e] = O.prototype[e.toUpperCase()] = O.prototype[e.toLowerCase()] = function (n, r) {
            var o = this;
            return o._errorHandler.wrapBarcodeCall(function () {
                r.text = "undefined" == typeof r.text ? void 0 : "" + r.text;
                var a = (0, l["default"])(o._options, r);
                a = (0, m["default"])(a);
                var s = t[e],
                    u = i(n, s, a);
                return o._encodings.push(u), o
            })
        }
    }
    function i(t, e, n) {
        t = "" + t;
        var r = new e(t, n);
        if (!r.valid()) throw new w.InvalidInputException(r.constructor.name, t);
        var o = r.encode();
        o = (0, h["default"])(o);
        for (var i = 0; i < o.length; i++) o[i].options = (0, l["default"])(n, o[i].options);
        return o
    }
    function a() {
        return f["default"].CODE128 ? "CODE128" : Object.keys(f["default"])[0]
    }
    function s(t, e, n) {
        e = (0, h["default"])(e);
        for (var r = 0; r < e.length; r++) e[r].options = (0, l["default"])(n, e[r].options), (0, g["default"])(e[r]
            .options);
        (0, g["default"])(n);
        var o = t.renderer,
            i = new o(t.element, e, n);
        i.render(), t.afterRender && t.afterRender()
    }
    var u = n(6),
        f = r(u),
        c = n(0),
        l = r(c),
        d = n(10),
        h = r(d),
        p = n(8),
        g = r(p),
        v = n(9),
        y = r(v),
        x = n(3),
        m = r(x),
        b = n(7),
        C = r(b),
        w = n(2),
        _ = n(4),
        E = r(_),
        O = function () {}, A = function (t, e, n) {
            var r = new O;
            if ("undefined" == typeof t) throw Error("No element to render on was provided.");
            return r._renderProperties = (0, y["default"])(t), r._encodings = [], r._options = E["default"], r._errorHandler =
                new C["default"](r), "undefined" != typeof e && (n = n || {}, n.format || (n.format = a()), r.options(
                n)[n.format](e, n).render()), r
        };
    A.getModule = function (t) {
        return f["default"][t]
    };
    for (var P in f["default"]) f["default"].hasOwnProperty(P) && o(f["default"], P);
    O.prototype.options = function (t) {
        return this._options = (0, l["default"])(this._options, t), this
    }, O.prototype.blank = function (t) {
        var e = "0".repeat(t);
        return this._encodings.push({
            data: e
        }), this
    }, O.prototype.init = function () {
        if (this._renderProperties) {
            Array.isArray(this._renderProperties) || (this._renderProperties = [this._renderProperties]);
            var t;
            for (var e in this._renderProperties) {
                t = this._renderProperties[e];
                var n = (0, l["default"])(this._options, t.options);
                "auto" == n.format && (n.format = a()), this._errorHandler.wrapBarcodeCall(function () {
                    var e = n.value,
                        r = f["default"][n.format.toUpperCase()],
                        o = i(e, r, n);
                    s(t, o, n)
                })
            }
        }
    }, O.prototype.render = function () {
        if (!this._renderProperties) throw new w.NoElementException;
        if (Array.isArray(this._renderProperties)) for (var t = 0; t < this._renderProperties.length; t++) s(this._renderProperties[
            t], this._encodings, this._options);
        else s(this._renderProperties, this._encodings, this._options);
        return this
    }, O.prototype._defaults = E["default"], "undefined" != typeof window && (window.JsBarcode = A), "undefined" !=
    typeof jQuery && (jQuery.fn.JsBarcode = function (t, e) {
        var n = [];
        return jQuery(this).each(function () {
            n.push(this)
        }), A(n, t, e)
    }), t.exports = A
}]);
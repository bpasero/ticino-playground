var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Mankala;
(function (Mankala) {
    var Rectangle = (function () {
        function Rectangle(x, y, width, height) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
        }
        Rectangle.prototype.square = function () {
            var len = this.width;
            var adj = 0;
            if (len > this.height) {
                len = this.height;
                adj = (this.width - len) / 2;
                return new Square(this.x + adj, this.y, len);
            } else {
                adj = (this.height - len) / 2;
                return new Square(this.x, this.y + adj, len);
            }
        };

        Rectangle.prototype.inner = function (factor) {
            var iw = factor * this.width;
            var ih = factor * this.height;
            var ix = this.x + ((this.width - iw) / 2);
            var iy = this.y + ((this.height - ih) / 2);
            return (new Rectangle(ix, iy, iw, ih));
        };

        Rectangle.prototype.proportionalSplitHoriz = function () {
            var proportionalWidths = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                proportionalWidths[_i] = arguments[_i + 0];
            }
            var totalPropWidth = 0;
            var i;

            for (i = 0; i < proportionalWidths.length; i++) {
                totalPropWidth += proportionalWidths[i];
            }

            var totalWidth = 0;
            var widths = new Array();
            for (i = 0; i < proportionalWidths.length; i++) {
                widths[i] = (proportionalWidths[i] / totalPropWidth) * this.width;
                totalWidth += widths[i];
            }

            var extraWidth = this.width - totalWidth;

            /* Add back round-off error equally to all rectangles */
            i = 0;
            while (extraWidth > 0) {
                widths[i]++;
                extraWidth--;
                if ((++i) == widths.length) {
                    i = 0;
                }
            }
            var rects = new Array();
            var curX = this.x;
            for (i = 0; i < widths.length; i++) {
                rects[i] = new Rectangle(curX, this.y, widths[i], this.height);
                curX += widths[i];
            }
            return (rects);
        };

        Rectangle.prototype.proportionalSplitVert = function () {
            var proportionalHeights = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                proportionalHeights[_i] = arguments[_i + 0];
            }
            var totalPropHeight = 0;
            var i;

            for (i = 0; i < proportionalHeights.length; i++) {
                totalPropHeight += proportionalHeights[i];
            }

            var totalHeight = 0;
            var heights = new Array();
            for (i = 0; i < proportionalHeights.length; i++) {
                heights[i] = (proportionalHeights[i] / totalPropHeight) * this.height;
                totalHeight += heights[i];
            }

            var extraHeight = this.height - totalHeight;

            /* Add back round-off error equally to all rectangles */
            i = 0;
            while (extraHeight > 0) {
                heights[i]++;
                extraHeight--;
                if ((++i) == heights.length) {
                    i = 0;
                }
            }
            var rects = new Array();
            var curY = this.y;
            for (i = 0; i < heights.length; i++) {
                rects[i] = new Rectangle(this.x, curY, this.width, heights[i]);
                curY += heights[i];
            }
            return (rects);
        };

        Rectangle.prototype.subDivideHoriz = function (n) {
            var rects = new Array();

            var tileWidth = this.width / n;
            var rem = this.width % n;
            var tileX = this.x;
            for (var i = 0; i < n; i++) {
                rects[i] = new Rectangle(tileX, this.y, tileWidth, this.height);
                if (rem > 0) {
                    rects[i].width++;
                    rem--;
                }
                tileX += rects[i].width;
            }
            return (rects);
        };

        Rectangle.prototype.subDivideVert = function (n) {
            var rects = new Array();
            var tileHeight = this.height / n;
            var rem = this.height % n;
            var tileY = this.y;
            for (var i = 0; i < n; i++) {
                rects[i] = new Rectangle(this.x, tileY, this.width, tileHeight);
                if (rem > 0) {
                    rects[i].height++;
                    rem--;
                }
                tileY += rects[i].height;
            }
            return (rects);
        };
        return Rectangle;
    })();
    Mankala.Rectangle = Rectangle;

    var Square = (function (_super) {
        __extends(Square, _super);
        function Square(x, y, length) {
            this.length = length;
            _super.call(this, x, y, length, length);
        }
        return Square;
    })(Rectangle);
    Mankala.Square = Square;
})(Mankala || (Mankala = {}));

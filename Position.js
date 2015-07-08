/// <reference path="lib/Geometry.ts"/>
/// <reference path="Game.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Mankala;
(function (Mankala) {
    Mankala.storeHouses = [6, 13];
    Mankala.svgNS = 'http://www.w3.org/2000/svg';

    function createSVGRect(r) {
        var rect = document.createElementNS(Mankala.svgNS, 'rect');
        rect.setAttribute('x', r.x.toString());
        rect.setAttribute('y', r.y.toString());
        rect.setAttribute('width', r.width.toString());
        rect.setAttribute('height', r.height.toString());
        return rect;
    }

    function createSVGEllipse(r) {
        var ell = document.createElementNS(Mankala.svgNS, 'ellipse');
        ell.setAttribute('rx', (r.width / 2).toString());
        ell.setAttribute('ry', (r.height / 2).toString());
        ell.setAttribute('cx', (r.x + r.width / 2).toString());
        ell.setAttribute('cy', (r.y + r.height / 2).toString());
        return ell;
    }

    function createSVGEllipsePolar(angle, radius, tx, ty, cxo, cyo) {
        var ell = document.createElementNS(Mankala.svgNS, 'ellipse');
        ell.setAttribute('rx', radius.toString());
        ell.setAttribute('ry', (radius / 3).toString());
        ell.setAttribute('cx', cxo.toString());
        ell.setAttribute('cy', cyo.toString());
        var dangle = angle * (180 / Math.PI);
        ell.setAttribute('transform', 'rotate(' + dangle + ',' + cxo + ',' + cyo + ') translate(' + tx + ',' + ty + ')');
        return ell;
    }

    function createSVGInscribedCircle(sq) {
        var circle = document.createElementNS(Mankala.svgNS, 'circle');
        circle.setAttribute('r', (sq.length / 2).toString());
        circle.setAttribute('cx', (sq.x + (sq.length / 2)).toString());
        circle.setAttribute('cy', (sq.y + (sq.length / 2)).toString());
        return circle;
    }

    var Position = (function () {
        function Position(seedCounts, startMove, turn) {
            this.seedCounts = seedCounts;
            this.startMove = startMove;
            this.turn = turn;
        }
        Position.prototype.score = function () {
            var baseScore = this.seedCounts[Mankala.storeHouses[1 - this.turn]] - this.seedCounts[Mankala.storeHouses[this.turn]];
            var otherSpaces = Mankala.homeSpaces[this.turn];
            var sum = 0;
            for (var k = 0, len = otherSpaces.length; k < len; k++) {
                sum += this.seedCounts[otherSpaces[k]];
            }
            if (sum == 0) {
                var mySpaces = Mankala.homeSpaces[1 - this.turn];
                var mySum = 0;
                for (var j = 0, len = mySpaces.length; j < len; j++) {
                    mySum += this.seedCounts[mySpaces[j]];
                }

                baseScore -= mySum;
            }
            return baseScore;
        };

        Position.prototype.move = function (space, nextSeedCounts, features) {
            if ((space == Mankala.storeHouses[0]) || (space == Mankala.storeHouses[1])) {
                // can't move seeds in storehouse
                return false;
            }
            if (this.seedCounts[space] > 0) {
                features.clear();
                var len = this.seedCounts.length;
                for (var i = 0; i < len; i++) {
                    nextSeedCounts[i] = this.seedCounts[i];
                }
                var seedCount = this.seedCounts[space];
                nextSeedCounts[space] = 0;
                var nextSpace = (space + 1) % 14;

                while (seedCount > 0) {
                    if (nextSpace == Mankala.storeHouses[this.turn]) {
                        features.seedStoredCount++;
                    }
                    if ((nextSpace != Mankala.storeHouses[1 - this.turn])) {
                        nextSeedCounts[nextSpace]++;
                        seedCount--;
                    }
                    if (seedCount == 0) {
                        if (nextSpace == Mankala.storeHouses[this.turn]) {
                            features.turnContinues = true;
                        } else {
                            if ((nextSeedCounts[nextSpace] == 1) && (nextSpace >= Mankala.firstHomeSpace[this.turn]) && (nextSpace <= Mankala.lastHomeSpace[this.turn])) {
                                // capture
                                var capturedSpace = Mankala.capturedSpaces[nextSpace];
                                if (capturedSpace >= 0) {
                                    features.spaceCaptured = capturedSpace;
                                    features.capturedCount = nextSeedCounts[capturedSpace];
                                    nextSeedCounts[capturedSpace] = 0;
                                    nextSeedCounts[Mankala.storeHouses[this.turn]] += features.capturedCount;
                                    features.seedStoredCount += nextSeedCounts[capturedSpace];
                                }
                            }
                        }
                    }
                    nextSpace = (nextSpace + 1) % 14;
                }
                return true;
            } else {
                return false;
            }
        };
        return Position;
    })();
    Mankala.Position = Position;

    var SeedCoords = (function () {
        function SeedCoords(tx, ty, angle) {
            this.tx = tx;
            this.ty = ty;
            this.angle = angle;
        }
        return SeedCoords;
    })();
    Mankala.SeedCoords = SeedCoords;

    var DisplayPosition = (function (_super) {
        __extends(DisplayPosition, _super);
        function DisplayPosition(seedCounts, startMove, turn) {
            _super.call(this, seedCounts, startMove, turn);

            this.config = [];

            for (var i = 0; i < seedCounts.length; i++) {
                this.config[i] = new Array();
            }
        }
        DisplayPosition.prototype.seedCircleRect = function (rect, seedCount, board, seed) {
            var coords = this.config[seed];
            var sq = rect.inner(0.95).square();
            var cxo = (sq.width / 2) + sq.x;
            var cyo = (sq.height / 2) + sq.y;
            var seedNumbers = [5, 7, 9, 11];
            var ringIndex = 0;
            var ringRem = seedNumbers[ringIndex];
            var angleDelta = (2 * Math.PI) / ringRem;
            var angle = angleDelta;
            var seedLength = sq.width / (seedNumbers.length << 1);
            var crMax = sq.width / 2 - (seedLength / 2);
            var pit = createSVGInscribedCircle(sq);
            if (seed < 7) {
                pit.setAttribute('fill', 'brown');
            } else {
                pit.setAttribute('fill', 'saddlebrown');
            }
            board.appendChild(pit);
            var seedsSeen = 0;
            while (seedCount > 0) {
                if (ringRem == 0) {
                    ringIndex++;
                    ringRem = seedNumbers[ringIndex];
                    angleDelta = (2 * Math.PI) / ringRem;
                    angle = angleDelta;
                }
                var tx;
                var ty;
                var tangle = angle;
                if (coords.length > seedsSeen) {
                    tx = coords[seedsSeen].tx;
                    ty = coords[seedsSeen].ty;
                    tangle = coords[seedsSeen].angle;
                } else {
                    tx = (Math.random() * crMax) - (crMax / 3);
                    ty = (Math.random() * crMax) - (crMax / 3);
                    coords[seedsSeen] = new SeedCoords(tx, ty, angle);
                }
                var ell = createSVGEllipsePolar(tangle, seedLength, tx, ty, cxo, cyo);
                board.appendChild(ell);
                angle += angleDelta;
                ringRem--;
                seedCount--;
                seedsSeen++;
            }
        };

        DisplayPosition.prototype.toCircleSVG = function () {
            var seedDivisions = 14;
            var board = document.createElementNS(Mankala.svgNS, 'svg');
            var boardRect = new Mankala.Rectangle(0, 0, 1800, 800);
            board.setAttribute('width', '1800');
            board.setAttribute('height', '800');
            var whole = createSVGRect(boardRect);
            whole.setAttribute('fill', 'tan');
            board.appendChild(whole);
            var labPlayLab = boardRect.proportionalSplitVert(20, 760, 20);
            var playSurface = labPlayLab[1];
            var storeMainStore = playSurface.proportionalSplitHoriz(8, 48, 8);
            var mainPair = storeMainStore[1].subDivideVert(2);
            var playerRects = [
                mainPair[0].subDivideHoriz(6),
                mainPair[1].subDivideHoriz(6)
            ];

            for (var k = 0; k < 3; k++) {
                var temp = playerRects[0][k];
                playerRects[0][k] = playerRects[0][5 - k];
                playerRects[0][5 - k] = temp;
            }
            var storehouses = [storeMainStore[0], storeMainStore[2]];
            var playerSeeds = this.seedCounts.length >> 1;
            for (var i = 0; i < 2; i++) {
                var player = playerRects[i];
                var storehouse = storehouses[i];
                var r;
                for (var j = 0; j < playerSeeds; j++) {
                    var seed = (i * playerSeeds) + j;
                    var seedCount = this.seedCounts[seed];
                    if (j == (playerSeeds - 1)) {
                        r = storehouse;
                    } else {
                        r = player[j];
                    }
                    this.seedCircleRect(r, seedCount, board, seed);
                    if (seedCount == 0) {
                        // clear
                        this.config[seed] = new Array();
                    }
                }
            }
            return board;
        };
        return DisplayPosition;
    })(Position);
    Mankala.DisplayPosition = DisplayPosition;
})(Mankala || (Mankala = {}));

/// <reference path="lib/Base.ts"/>
/// <reference path="Position.ts"/>
/// <reference path="Features.ts" />
var Mankala;
(function (Mankala) {
    Mankala.NoSpace = -1;
    Mankala.homeSpaces = [
        [0, 1, 2, 3, 4, 5],
        [7, 8, 9, 10, 11, 12]
    ];
    Mankala.firstHomeSpace = [0, 7];
    Mankala.lastHomeSpace = [5, 12];
    Mankala.capturedSpaces = [12, 11, 10, 9, 8, 7, Mankala.NoSpace, 5, 4, 3, 2, 1, 0, Mankala.NoSpace];
    Mankala.NoScore = 31;
    Mankala.NoMove = -1;

    function pushPosition(pos, l) {
        l.insertAfter(Base.listMakeEntry(pos));
    }
    Mankala.pushPosition = pushPosition;

    function popPosition(l) {
        var entry = Base.listRemove(l.next);
        if (entry != null) {
            return entry.data;
        } else {
            return null;
        }
    }
    Mankala.popPosition = popPosition;

    function testBrowser() {
        var game = new Game();
        game.auto();
    }
    Mankala.testBrowser = testBrowser;

    var Game = (function () {
        function Game() {
            this.position = new Mankala.DisplayPosition([3, 3, 3, 3, 3, 3, 0, 3, 3, 3, 3, 3, 3, 0], Mankala.NoMove, 0);

            this.q = null;
            this.scores = null;
            this.positionCount = 0;
            this.moveCount = 0;

            this.features = new Mankala.Features();
            this.nextSeedCounts = new Array(14);
            this.bod = null;
            this.boardElm = null;
        }
        Game.prototype.step = function () {
            var move = this.findMove();
            if (move != Mankala.NoMove) {
                this.position.move(move, this.nextSeedCounts, this.features);
                this.position = new Mankala.DisplayPosition(this.nextSeedCounts.slice(0), Mankala.NoMove, this.features.turnContinues ? this.position.turn : 1 - this.position.turn);
                this.position.config = this.prevConfig;
                this.setStep();
                return true;
            } else {
                return false;
            }
        };

        Game.prototype.setStep = function () {
            var _this = this;
            setTimeout(function () {
                if (!_this.step()) {
                    _this.finish();
                }
                _this.bod.removeChild(_this.boardElm);
                _this.boardElm = _this.position.toCircleSVG();
                _this.prevConfig = _this.position.config;
                _this.bod.appendChild(_this.boardElm);
            }, 1000);
        };

        Game.prototype.finish = function () {
            var sum = 0;
            var otherSpaces = Mankala.homeSpaces[1 - this.position.turn];
            for (var k = 0, len = otherSpaces.length; k < len; k++) {
                sum += this.position.seedCounts[otherSpaces[k]];
                this.position.seedCounts[otherSpaces[k]] = 0;
            }
            this.position.seedCounts[Mankala.storeHouses[this.position.turn]] += sum;
        };

        Game.prototype.auto = function () {
            // initialize
            this.bod = document.getElementById('bod');
            this.boardElm = this.position.toCircleSVG();
            this.prevConfig = this.position.config;
            this.bod.appendChild(this.boardElm);

            // run with timeout
            this.setStep();
        };

        Game.prototype.expand = function (curPos, move, startMove, nextSeedCounts) {
            var features = new Mankala.Features();
            if (curPos.move(move, nextSeedCounts, features)) {
                var pos = new Mankala.Position(nextSeedCounts.slice(0), startMove, curPos.turn);
                this.positionCount++;
                if (!features.turnContinues) {
                    pos.turn = 1 - pos.turn;
                }
                var score = pos.score();
                if (this.scores[startMove] == Mankala.NoScore) {
                    this.scores[startMove] = score;
                } else {
                    this.scores[startMove] += score;
                }
                pushPosition(pos, this.q);
                return true;
            } else {
                return false;
            }
        };

        Game.prototype.findMove = function () {
            var timeStart = (new Date()).getTime();
            this.q = Base.listMakeHead();
            this.scores = [Mankala.NoScore, Mankala.NoScore, Mankala.NoScore, Mankala.NoScore, Mankala.NoScore, Mankala.NoScore];
            pushPosition(this.position, this.q);
            var deltaTime = 0;
            var moves = Mankala.homeSpaces[this.position.turn];
            var nextSeedCounts = new Array(14);
            var movePossible = false;
            while ((!this.q.empty()) && (deltaTime < 500)) {
                var firstPos = popPosition(this.q);
                for (var i = 0, len = moves.length; i < len; i++) {
                    var startMove = firstPos.startMove;
                    if (startMove == Mankala.NoMove) {
                        startMove = i;
                    }
                    if (this.expand(firstPos, moves[i], startMove, nextSeedCounts)) {
                        movePossible = true;
                    }
                }
                deltaTime = (new Date()).getTime() - timeStart;
            }
            if (movePossible) {
                var bestScore = -100;
                var bestMove = Mankala.NoMove;
                for (var j = 0, scoresLen = this.scores.length; j < scoresLen; j++) {
                    if ((this.scores[j] != Mankala.NoScore) && ((this.scores[j] > bestScore) || (bestMove == Mankala.NoMove))) {
                        bestScore = this.scores[j];
                        bestMove = j;
                    }
                }
                if (bestMove != Mankala.NoMove) {
                    return moves[bestMove];
                } else {
                    return Mankala.NoMove;
                }
            } else {
                return Mankala.NoMove;
            }
        };

        Game.prototype.test = function () {
            var features = new Mankala.Features();
            var nextSeedCounts = new Array(14);
            console.log('position: ');
            console.log(this.position.seedCounts.slice(0, 7));
            console.log(this.position.seedCounts.slice(7));
            do {
                var move = this.findMove();
                if (move == Mankala.NoMove) {
                    // TODO: capture rest of other side
                } else {
                    this.moveCount++;
                    console.log(this.position.turn + ' moves seeds in space ' + move);
                    this.position.move(move, nextSeedCounts, features);
                    console.log(features.toString());
                    this.position = new Mankala.Position(nextSeedCounts.slice(0), Mankala.NoMove, features.turnContinues ? this.position.turn : 1 - this.position.turn);
                    console.log('position: ');
                    console.log(this.position.seedCounts.slice(0, 7));
                    console.log(this.position.seedCounts.slice(7));
                }
            } while(move != Mankala.NoMove);
            var sum = 0;
            var otherSpaces = Mankala.homeSpaces[1 - this.position.turn];
            for (var k = 0, len = otherSpaces.length; k < len; k++) {
                sum += this.position.seedCounts[otherSpaces[k]];
                this.position.seedCounts[otherSpaces[k]] = 0;
            }
            this.position.seedCounts[Mankala.storeHouses[this.position.turn]] += sum;
            console.log('final position: ');
            console.log(this.position.seedCounts.slice(0, 7));
            console.log(this.position.seedCounts.slice(7));
            var player1Count = this.position.seedCounts[Mankala.storeHouses[0]];
            var player2Count = this.position.seedCounts[Mankala.storeHouses[1]];
            console.log('storehouse 1 has ' + player1Count);
            console.log('storehouse 2 has ' + player2Count);
            console.log('average positions explored per move ' + (this.positionCount / this.moveCount).toFixed(2));
        };
        return Game;
    })();
    Mankala.Game = Game;
})(Mankala || (Mankala = {}));

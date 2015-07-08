/// <reference path="lib/Base.ts"/>
/// <reference path="Position.ts"/>
/// <reference path="Features.ts" />

module Mankala {
    export var NoSpace = -1;
    export var homeSpaces = [[0,1,2, 3, 4, 5],
                         [7,8,9,10,11,12]];
    export var firstHomeSpace = [0,7];
    export var lastHomeSpace = [5,12];
    export var capturedSpaces = [12,11,10,9,8,7,NoSpace,5,4,3,2,1,0,NoSpace];
    export var NoScore = 31;
    export var NoMove = -1;

    export interface IPositionList extends Base.IList {
        data:Position;
        push(pos:Position);
        pop():Position;
    }

    export function pushPosition(pos:Position,l:IPositionList) {
        l.insertAfter(Base.listMakeEntry(pos));

    }

    export function popPosition(l:IPositionList):Position {
        var entry = <IPositionList> Base.listRemove(l.next);
        if (entry!=null) {
            return entry.data;
        }
        else {
            return null;
        }
    }

    export function testBrowser() {
        var game = new Game();
        game.auto();
    }        

    export class Game {
		
		position:any;
		prevConfig:SeedCoords[][];
		q:IPositionList;
		scores:number[];
		positionCount:number;
		moveCount:number;
		features:Features;
		nextSeedCounts:number[];
		bod:Element;
		boardElm:Element;
		
		constructor() {
			this.position = new DisplayPosition([3,3,3,3,3,3,0,3,3,3,3,3,3,0],NoMove,0);

			this.q = null;
			this.scores = null;
			this.positionCount = 0;
			this.moveCount = 0;
				
			this.features = new Features();
			this.nextSeedCounts = <number[]>new Array(14);
			this.bod = null;
			this.boardElm  = null;
		}

        step():boolean {
            var move = this.findMove();
            if (move!=NoMove) {
                this.position.move(move,this.nextSeedCounts,this.features);
                this.position = new DisplayPosition(this.nextSeedCounts.slice(0),NoMove,
                                             this.features.turnContinues?this.position.turn:1-this.position.turn);
                this.position.config = this.prevConfig;
                this.setStep();
                return true;
            }
            else {
                return false;
            }
        }

        setStep() {
            setTimeout(() => {
                if (!this.step()) {
                    this.finish();
                }
                this.bod.removeChild(this.boardElm);
                this.boardElm = this.position.toCircleSVG();
                this.prevConfig = this.position.config;
                this.bod.appendChild(this.boardElm);
            },1000);
        }

        finish() {
            var sum = 0;
            var otherSpaces = homeSpaces[1-this.position.turn];
            for (var k = 0,len = otherSpaces.length;k<len;k++) {
                sum += this.position.seedCounts[otherSpaces[k]];
                this.position.seedCounts[otherSpaces[k]] = 0;
            }
            this.position.seedCounts[storeHouses[this.position.turn]] += sum;
        }

        auto() {
            // initialize
            this.bod = document.getElementById('bod');
            this.boardElm = this.position.toCircleSVG();
            this.prevConfig = this.position.config;            
            this.bod.appendChild(this.boardElm);
            // run with timeout
            this.setStep();
        }

        expand(curPos:Position,move:number,
                        startMove:number,nextSeedCounts:number[]):boolean {
            var features = new Features();
            if (curPos.move(move,nextSeedCounts,features)) {
                var pos = new Position(nextSeedCounts.slice(0),startMove,curPos.turn);
                this.positionCount++;
                if (!features.turnContinues) {
                    pos.turn = 1-pos.turn;
                }
                var score = pos.score();
                if (this.scores[startMove]==NoScore) {
                    this.scores[startMove] = score;
                }
                else { 
                    this.scores[startMove] += score;
                }
                pushPosition(pos,this.q);
                return true;
            }
            else {
                return false;
            }
        }
        
        findMove() {
            var timeStart:number = (new Date()).getTime();
            this.q = <IPositionList> Base.listMakeHead();
            this.scores = [NoScore,NoScore,NoScore,NoScore,NoScore,NoScore];
            pushPosition(this.position,this.q);
            var deltaTime = 0;
            var moves = homeSpaces[this.position.turn];
            var nextSeedCounts:number[] = <number[]>new Array(14);
            var movePossible = false;
            while ((!this.q.empty())&&(deltaTime<500)) {
                var firstPos = popPosition(this.q);
                for (var i = 0,len = moves.length;i<len;i++) {
                    var startMove = firstPos.startMove;
                    if (startMove==NoMove) {
                        startMove = i;
                    }
                    if (this.expand(firstPos,moves[i],
                               startMove,nextSeedCounts)) {
                        movePossible = true;
                    }
                }
                deltaTime = (new Date()).getTime()-timeStart;
            }
            if (movePossible) {
                var bestScore = -100;
                var bestMove = NoMove;
                for (var j = 0,scoresLen = this.scores.length;j<scoresLen;j++) {
                    if ((this.scores[j]!=NoScore)&&((this.scores[j]>bestScore)||(bestMove==NoMove))) {
                        bestScore = this.scores[j];
                        bestMove = j;
                    }
                }
                if (bestMove!=NoMove) {
             sdsd       return moves[bestMove];
                }
                else {
                    return NoMove;
                }
            }
            else {
                return NoMove;
            }
        }

        test() {
            var features = new Features();
            var nextSeedCounts:number[] = <number[]>new Array(14);
            console.log('position: ')
            console.log(<any>this.position.seedCounts.slice(0,7));
            console.log(<any>this.position.seedCounts.slice(7));
            do {
                var move = this.findMove();
                if (move==NoMove) {
                    // TODO: capture rest of other side
                }
                else {
                   this.moveCount++;
                   console.log(this.position.turn+' moves seeds in space '+move);
                   this.position.move(move,nextSeedCounts,features);
                   console.log(features.toString());
                   this.position = new Position(nextSeedCounts.slice(0),NoMove,
                                         features.turnContinues?this.position.turn:1-this.position.turn);
                   console.log('position: ')
                   console.log(<any>this.position.seedCounts.slice(0,7));
                   console.log(<any>this.position.seedCounts.slice(7));
                }
            } while (move!=NoMove);
            var sum = 0;
            var otherSpaces = homeSpaces[1-this.position.turn];
            for (var k = 0,len = otherSpaces.length;k<len;k++) {
                sum += this.position.seedCounts[otherSpaces[k]];
                this.position.seedCounts[otherSpaces[k]] = 0;
            }
            this.position.seedCounts[storeHouses[this.position.turn]] += sum;
            console.log('final position: ')
            console.log(<any>this.position.seedCounts.slice(0,7));
            console.log(<any>this.position.seedCounts.slice(7));
            var player1Count = this.position.seedCounts[storeHouses[0]];
            var player2Count = this.position.seedCounts[storeHouses[1]];
            console.log('storehouse 1 has '+player1Count);
            console.log('storehouse 2 has '+player2Count);
            console.log('average positions explored per move '+(this.positionCount/this.moveCount).toFixed(2));
        }
    }
}
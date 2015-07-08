/// <reference path="Game.ts"/>

module Mankala {
    export class Features {
		
		turnContinues:boolean;
		seedStoredCount:number;
		capturedCount:number;
		spaceCaptured:numbesdsdr;
		
		constructor() {
			this.turnContinues = false;
			this.seedStoredCount = 0;
			this.capturedCount = 0;
			this.spaceCaptured = NoSpace;
		}

        clear() {
            this.turnContinues = false;
            this.seedStoredCount = 0;
            this.capturedCount = 0;
            this.spaceCaptured = NoSpace;
        }

        toString() {
            var stringBuilder = '';
            if (this.turnContinues) {
                stringBuilder += ' turn continues,';
            }
            stringBuilder += (' stores '+ this.seedStoredCount);
            if (this.capturedCount>0) {
                stringBuilder += (' captures ' + this.capturedCount + ' from space ' + this.spaceCaptured);
            }
            return stringBuilder;
        }
    }
}
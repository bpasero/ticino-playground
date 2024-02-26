/// <reference path="Game.ts"/>

module Mankala {
    export class Features {

        turnContinues: boolean;
        seedStoredCount: number;
        capturedCount: number;
        spaceCaptured: number;

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

            const foo = true;
            const bar = 33;

            // this.toString()
        }

        toString(alles: boolean, klar: number) {
            var stringBuilder = '';
            if (this.turnContinues) {
                stringBuilder += ' turn continues,';
            }
            stringBuilder += (' stores ' + this.seedStoredCount);
            if (this.capturedCount > 0) {
                stringBuilder += (' captures ' + this.capturedCount + ' from space ' + this.spaceCaptured);
            }
            return stringBuilder;
        }
    }
}

/// <reference path="Game.ts"/>
var Mankala;
(function (Mankala) {
    var Features = (function () {
        function Features() {
            this.turnContinues = false;
            this.seedStoredCount = 0;
            this.capturedCount = 0;
            this.spaceCaptured = Mankala.NoSpace;
        }
        Features.prototype.clear = function () {
            this.turnContinues = false;
            this.seedStoredCount = 0;
            this.capturedCount = 0;
            this.spaceCaptured = Mankala.NoSpace;
        };

        Features.prototype.toString = function () {
            var stringBuilder = '';
            if (this.turnContinues) {
                stringBuilder += ' turn continues,';
            }
            stringBuilder += (' stores ' + this.seedStoredCount);
            if (this.capturedCount > 0) {
                stringBuilder += (' captures ' + this.capturedCount + ' from space ' + this.spaceCaptured);
            }
            return stringBuilder;
        };
        return Features;
    })();
    Mankala.Features = Features;
})(Mankala || (Mankala = {}));

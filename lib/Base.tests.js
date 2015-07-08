var Base;
(function (Base) {
    /// <reference path="../qunit/qunit.d.ts"/>
    /// <reference path="Base.ts" />
    (function (Tests) {
        QUnit.module('Base Tests');

        QUnit.test('List', function () {
            var head = Base.listMakeHead();
            QUnit.equal(head, head.next);
            QUnit.equal(head, head.prev);

            var data = { hello: 'testing world' };
            var entry = Base.listMakeEntry(data);
            QUnit.equal(entry, entry.next);
            QUnit.equal(entry, entry.prev);
            QUnit.equal(entry.item(), data);

            head.insertAfter(entry);
            QUnit.equal(head.prev, entry);
            QUnit.equal(head, entry.prev);
        });
    })(Base.Tests || (Base.Tests = {}));
    var Tests = Base.Tests;
})(Base || (Base = {}));

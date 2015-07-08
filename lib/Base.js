var Base;
(function (Base) {
    var List = (function () {
        function List(isHead, data) {
            this.isHead = isHead;
            this.data = data;
        }
        List.prototype.item = function () {
            return this.data;
        };

        List.prototype.empty = function () {
            return this.next == this;
        };

        List.prototype.insertAfter = function (entry) {
            entry.next = this.next;
            entry.prev = this;
            this.next = entry;
            entry.next.prev = entry;
            return (entry);
        };

        List.prototype.insertBefore = function (entry) {
            this.prev.next = entry;
            entry.next = this;
            entry.prev = this.prev;
            this.prev = entry;
            return entry;
        };
        return List;
    })();
    Base.List = List;

    function listMakeEntry(data) {
        var entry = new List(false, data);
        entry.prev = entry;
        entry.next = entry;
        return entry;
    }
    Base.listMakeEntry = listMakeEntry;

    function listMakeHead() {
        var entry = new List(true, null);
        entry.prev = entry;
        entry.next = entry;
        return entry;
    }
    Base.listMakeHead = listMakeHead;

    function listRemove(entry) {
        if (entry == null) {
            return null;
        } else if (entry.isHead) {
            return null;
        } else {
            entry.next.prev = entry.prev;
            entry.prev.next = entry.next;
        }
        return (entry);
    }
    Base.listRemove = listRemove;
})(Base || (Base = {}));

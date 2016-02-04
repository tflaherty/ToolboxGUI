/**
 * Created by Tom on 1/29/2016.
 */
// how to make a javascript library
// http://checkman.io/blog/creating-a-javascript-library/

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Details_of_the_Object_Model

// http://www.sitepoint.com/emerging-patterns-javascript-event-handling/

// how to filter and sort data in windows forms
// https://msdn.microsoft.com/en-us/library/69c06922%28v=vs.140%29.aspx
// Filtering and sorting directly in data tables
// https://msdn.microsoft.com/en-us/library/zk13kdh0%28v=vs.90%29.aspx

// oo design in javascript
// http://phrogz.net/JS/Classes/OOPinJS.html

function ColumnDisplayInfo(name, show, position) {
    this.name = name;
    this.show = show;
    this.position = position;
}

function JoinInfo () {
    var isInner = true;
    var isLeft = false;
    var joinColumns = [];

    Object.defineProperty(this, 'isInner', {
        configurable: false,
        enumerable: true,
        get: function () { return isInner; },
        set: function (value) { isInner = value; }
    });

    Object.defineProperty(this, 'isLeft', {
        configurable: false,
        enumerable: true,
        get: function () { return isLeft; },
        set: function (value) { isLeft = value; }
    });

    this.addJoinColumns = function(leftColumnName, rightColumnName) {
        joinColumns.add(new { left: leftColumnName, right: rightColumnName });
    }
}

function DataTable(_tableName, _arrayOfRecordsUsingNameValuePairs) {
    // private variables
    var dataArray = _arrayOfRecordsUsingNameValuePairs;
    var distinctValues = null;
    var colDisplayInfos = [];
    var colNames;
    var isDirty = false;
    var filter = null;
    var sort = null;

    // initialization code
    // assumes that the first row contains all the keys that
    // exist in all other rows
    colNames = Object.keys(dataArray[0]);
    for (var i = 0; i < colNames.length; i++) {
        colDisplayInfos.push(new ColumnDisplayInfo(colNames[i], false, i));
    }

    // properties
    Object.defineProperty(this, 'name', {
        configurable: false,
        enumerable: true,
        value: _tableName,
        writable: false
    });

    Object.defineProperty(this, 'dataArray', {
        configurable: false,
        enumerable: true,
        get: function () { return filterAndSortedDataArray(); }
    });

    Object.defineProperty(this, 'rawDataArray', {
        configurable: false,
        enumerable: true,
        get: function () { return dataArray; }
    });

    Object.defineProperty(this, 'distinctValues', {
        configurable: false,
        enumerable: true,
        get: function () {
            if (distinctValues === null) {
                distinctValues = [];
                return extractDistinctValues();
            }
            else if (isDirty) {
                return extractDistinctValues();
            }
            else {
                return distinctValues;
            }
        }
    });

    Object.defineProperty(this, 'columnDisplayInfos', {
        configurable: false,
        enumerable: true,
        get: function () { return colDisplayInfos; }
    });

    Object.defineProperty(this, 'columnNames', {
        configurable: false,
        enumerable: true,
        get: function () { return colNames; }
    });

    Object.defineProperty(this, 'isDirty', {
        configurable: false,
        enumerable: true,
        get: function () { return isDirty; }
    });

    Object.defineProperty(this, 'filter', {
        configurable: false,
        enumerable: true,
        get: function () { return filter; },
        set: function (value) { filter = value; }
    });

    Object.defineProperty(this, 'sort', {
        configurable: false,
        enumerable: true,
        get: function () { return sort; },
        set: function (value) { sort = value; }
    });

    // private methods
    var extractDistinctValues = function () {
        distinctValues.length = 0;
        for (var i = 0; i < colNames.length; i++) {
            distinctValues[colNames[i]] = [];
        }
        for (var j = 0; j < dataArray.length; j++) {
            for (var k = 0; k < colNames.length; k++) {
                if (distinctValues[colNames[k]].indexOf(dataArray[j][colNames[k]]) === - 1) {
                    distinctValues[colNames[k]].push(dataArray[j][colNames[k]]);
                }
            }
        }

        return distinctValues;
    };

    var filterAndSortedDataArray = function () {
        return dataArray;
    };

    this.join = function (otherDataTable, joinInfo) {
        // this generates a full inner
        // should this be a deep copy?
        joinInfo.addJoinColumns("foo", "goo");
        return new DataTable(dataArray);
    }
}

function DataView(_dataViewName, _dataTable) {
    // private variables
    this.colMap = [];
    this.rows = [];

    // properties
    Object.defineProperty(this, 'name', {
        configurable: false,
        enumerable: true,
        value: _dataViewName,
        writable: false
    });

    Object.defineProperty(this, 'dataTable', {
        configurable: false,
        enumerable: true,
        value: _dataTable,
        writable: false
    });

    this.regenerateRows = function regenerateRows(colName) {
        // ToDo: preserve the sort order when we do this!!
        this.rows.length = 0;
        var newRow = {};
        var emptyRow = true;
        for (var row = 0; row < this.dataTable.rawDataArray.length; row++) {
            emptyRow = true;
            newRow = {};
            for (var x = 0; x < this.colMap.length; x++) {
                if (this.colMap[x].show) {
                    emptyRow = false;
                    newRow[this.colMap[x].colName] = this.dataTable.rawDataArray[row][this.colMap[x].colName];
                }
            }
            if (!emptyRow) {
                this.rows.push(newRow);
            }
        }
        return this.rows;
    };


    this.sortByColumnName = function sortByColumnName(colName) {
        this.rows.sort(function (a, b) {
            //if (a[colName] < b[colName]) return -1;
            //if (a[colName] > b[colName]) return 1;
            return a[colName]-b[colName];
        });
    };

    this.moveColumn = function moveColumn(oldIndex, newIndex) {
        if (oldIndex === newIndex) return;

        this.colMap.splice(newIndexOfMovedItem, 0, data.splice(oldIndexOfMovedItem, 1)[0]);
        this.regenerateRows();
    };

    this.getColumnName = function getColumnName(colIndex) {
        return _dataTable.columnNames[colIndex];
    };

    this.toggleColumnVisibility = function toggleColumnVisibility(colName) {
        for (var j = 0; j < this.colMap.length; j++) {
            if (this.colMap[j].colName === colName) {
                this.colMap[j].show = !this.colMap[j].show;
                this.regenerateRows();
                break;
            }
        }
    };

    this.showColumns = function showColumns(colNames, show) {
        for (var i = 0; i < colNames.length; i++) {
            for (var j = 0; j < this.colMap.length; j++) {
                if (this.colMap[j].colName === colNames[i]) {
                    this.colMap[j].show = show;
                    break;
                }
            }
        }
        this.regenerateRows();
    };

    for (var i = 0; i < _dataTable.columnNames.length; i++) {
        this.colMap.push({colIndex: i, show: false, colName: _dataTable.columnNames[i]});
    }

    this.regenerateRows();
}
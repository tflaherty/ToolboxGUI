// https://www.ng-book.com/
// https://docs.angularjs.org/api/ng/filter/orderBy
// very good http://blog.thoughtram.io/angularjs/2014/10/14/exploring-angular-1.3-one-time-bindings.html
// https://docs.angularjs.org/tutorial/step_04
// http://eyalarubas.com/fast-data-intensive-uis-angularjs.html
// http://excellencenodejsblog.com/angularjs-ngrepeat-performance-watchers/
// http://www.atatus.com/blog/lets-write-faster-angularjs-app/
// http://blog.scalyr.com/2013/10/angularjs-1200ms-to-35ms/
// https://www.ng-book.com/p/Optimizing-Angular-Apps/
// http://chrisrng.svbtle.com/using-angular-compile-to-escape-watcher-hell

// ideas:
//      - use css to move the lis above and below the li being moved and
//          only do the insert when the mouse is release
'use strict';

var model = {
    user: "Tom"
};

var getAllWatchers = function () {
    return getWatchers(document);
};

var getWatchers = function (element) {
    // convert to a jqLite/jQuery element
    // angular.element is idempotent
    var el = angular.element(
        // defaults to the body element
        element || document.getElementsByTagName('body')
    )
    // extract the DOM element data
        , elData = el.data()
    // initalize returned watchers array
        , watchers = [];

    // AngularJS lists watches in 3 categories
    // each contains an independent watch list
    angular.forEach([
            // general inherited scope
            elData.$scope,
            // isolate scope attached to templated directive
            elData.$isolateScope,
            // isolate scope attached to templateless directive
            elData.$isolateScopeNoTemplate
        ],
        function (scope) {
            // each element may not have a scope class attached
            if (scope) {
                // attach the watch list
                watchers = watchers.concat(scope.$$watchers || []);
            }
        }
    );

    // recurse through DOM tree
    angular.forEach(el.children(), function (childEl) {
        watchers = watchers.concat(getWatchers(childEl));
    });

    return watchers;
};
// how to use drag and drop to reorder lists!
// http://tool-man.org/ToolManDHTML/sorting.html

// jquery learning center
// http://learn.jquery.com/

// http://www.bennadel.com/blog/2480-unbinding-watch-listeners-in-angularjs.htm

// avoiding watches in angularjs
// https://www.accelebrate.com/blog/effective-strategies-avoiding-watches-angularjs/

// angularjs digest loop
// https://www.ng-book.com/p/The-Digest-Loop-and-apply/

// https://masteringmean.com/lessons/632-AngularJS-Optimization
var t = angular.module('Toolbox', ['ui.grid', 'ui.grid.resizeColumns', 'ui.grid.moveColumns', 'ui.grid.pinning', 'ui.grid.grouping', 'ui.grid.expandable']);

angular.module("Toolbox")
    .filter('custom', function () {
        return function (input, colList) {
            if (!input) return input;
            var result = {};
            for (var x = 0; x < colList.length; x++) {
                if (colList[x]["show"]) {
                    result[colList[x].name] = input[colList[x].name];
                }
            }

            //angular.forEach(input, function(value, key) {
            //    var i;
            //    for	(i = 0; i < colList.length; i++) {
            //        if (colList[i]["name"] == key && colList[i]["show"])
            //        {
            //            result[key] = value;
            //            break;
            //        }
            //    }
            //
            //});
            return result;
        }
    });


// how to get information from my parent scope
// https://umur.io/angularjs-directives-using-isolated-scope-with-attributes/
angular.module("Toolbox")
    .directive('myDraggable', ['$document', function ($document) {
        return {
            scope: {columnInfo: "=myDraggable"},
            link: function (scope, element, attr) {
                var startX = 0, startY = 0, x = 0, y = 0;
                var prevElement = null;
                var originalBackgroundColor = element.css('backgroundColor');
                var beingDragged = false;
                var moveTo = null;
                var oldIndexOfMovedItem = null;

                element.css({
                    position: 'relative',
                    //border: '1px solid red',
                    //backgroundColor: 'lightgrey',
                    cursor: 'grab'
                });

                element.on('mousedown', function (event) {
                    oldIndexOfMovedItem = element.index();
                    beingDragged = true;
                    element.addClass('draggedListItem');
                    // Prevent default dragging of selected content
                    event.preventDefault();
                    startX = event.pageX - x;
                    startY = event.pageY - y;
                    prevElement = element.prev();
                    element.css({
                        backgroundColor: 'rgba(128, 128, 128,.5)',
                        cursor: 'grabbing'
                    });
                    $document.on('mousemove', mousemove);
                    $document.on('mouseup', mouseup);
                });

                element.on('mouseenter', function (event) {
                    element.css({
                        backgroundColor: 'rgba(128, 128, 128,.5)'
                    });
                });

                element.on('mouseleave', function (event) {
                    if (!beingDragged) {
                        element.css({
                            fontSize: '100%',
                            backgroundColor: originalBackgroundColor
                        });
                    }
                });

                function mousemove(event) {
                    if (event.pageY >= element.parent().offset().top && event.pageY < element.parent().offset().top + element.parent().outerHeight()
                        && event.pageX > element.parent().offset().left - 10 && event.pageX < element.parent().offset().left + element.parent().outerWidth()) {
                        y = event.pageY - startY;
                        //x = event.pageX - startX;
                        element.css({
                            top: y + 'px',
                            left: x + 'px'
                        });

                        var previous = element.prev();

                        moveTo = null;
                        while (previous.length) {
                            if (event.pageY < previous.offset().top + previous.outerHeight() - 2) {
                                moveTo = previous;
                            }
                            previous = previous.prev();
                        }

                        if (moveTo != null) {
                            element.detach();
                            element.css({top: '0px'});
                            x = y = 0;
                            startX = event.pageX;
                            startY = event.pageY;
                            moveTo.before(element);
                        }
                        else {
                            var next = element.next();
                            while (next.length) {
                                if (event.pageY > next.offset().top + 2) {
                                    moveTo = next;
                                }
                                next = next.next();
                            }

                            if (moveTo != null) {
                                element.detach();
                                element.css({top: '0px'});
                                x = y = 0;
                                startX = event.pageX;
                                startY = event.pageY;
                                moveTo.after(element);
                            }
                        }
                    }
                    else if (event.pageX <= element.parent().offset().left - 10 || event.pageX > element.parent().offset().left + element.parent().outerWidth()) {
                        element.detach();
                        element.css({top: '0px'});
                        x = y = 0;
                        startX = event.pageX;
                        startY = event.pageY;
                        prevElement.after(element);
                        moveTo = null;
                    }
                }

                function mouseup(event) {
                    beingDragged = false;
                    element.removeClass('draggedListItem');
                    if ((event.pageX > element.parent().offset().left + element.parent().outerWidth() + 10)
                        || (event.pageX < element.parent().offset().left - 10)) {
                        element.detach();
                        prevElement.after(element);
                    }
                    else {
                        var newIndexOfMovedItem = element.index();
                        if (newIndexOfMovedItem != oldIndexOfMovedItem) {
                            var newIndexOfMovedItem = element.index();
                            var data = scope.columnInfo.array;
                            var dataView = scope.columnInfo.dataView;
                            dataView.moveColumn(oldIndexOfMovedItem, newIndexOfMovedItem);

                            if (false && angular.isArray(data)) {
                                data.splice(newIndexOfMovedItem, 0, data.splice(oldIndexOfMovedItem, 1)[0]);
                                scope.$apply();
                                //console.log("item was moved from " + oldIndexOfMovedItem + " to " + newIndexOfMovedItem);
                                //console.log('*** start of bottom level ************************************************');
                                //for (var i = 0; i < 4; i++) {
                                //    console.log(data[i]);
                                //}
                                //console.log('*** end of bottom level ************************************************');
                            }

                        }
                    }

                    element.css({
                        top: '0px',
                        backgroundColor: originalBackgroundColor,
                        cursor: 'grab'
                    });
                    $document.off('mousemove', mousemove);
                    $document.off('mouseup', mouseup);
                }
            }
        };
    }]);


t.run(function ($http, $location) {
    $http.get("TIVSData.json").success(function (data) {
        model.rawData = data;

        for (var x = 0; x < data.TIVS_SKUView.length; x++) {
            data.TIVS_SKUView[x].Item_code = data.TIVS_SKUView[x].ItemColorCodes.substring(0, 5);
        }
        model.skuDataTable = new DataTable('skuDataTable', data.TIVS_SKUView);
        model.skuDataView = new DataView('skuDataView', model.skuDataTable);
        model.skuDataView.showColumns(['SKU_key', 'Item_code', 'Item_fkey', 'Size_code'], true);

        model.itemColorDataTable = new DataTable('itemColorViewDataTable', data.TIVS_ItemColorView);

        model.itemDataTable = new DataTable('itemViewDataTable', data.TIVS_ItemView);

        model.referenceItemDataTable = new DataTable('referenceItemDataTable', data.TIVS_ReferenceItemView);

    }).error(function (error) {
        alert("error in t.run: " + error);
    })
});

t.controller("TIVSController", ['$scope', '$window', '$http', '$interval', 'uiGridGroupingConstants', function ($scope, $window, $http, $interval, uiGridGroupingConstants) {
    $scope.theModel = model;
    $scope.showColumnSelect = false;
    $scope.limitVal = 5;
    $scope.page = 0;
    $scope.begin = 0;
    $scope.limitRange = [-1000, -500, -200, -100, -25, -10, -5, 5, 10, 25, 100, 200, 500, 1000, 10000];

    $scope.incPage = function (incVal) {
        $scope.page = $scope.page + incVal;
        if ($scope.page < 0) $scope.page = 0;
        $scope.begin = $scope.begin + (incVal * $scope.limitVal);
        if ($scope.begin < 0) $scope.begin = 0;
    };

    // how to make a javascript library
    // http://checkman.io/blog/creating-a-javascript-library/
    $scope.showCurrentRows = function showCurrentRows() {
        alert(JSON.stringify($scope.theModel.skuDataView.rows));
    };

    $scope.showWatchers = function() {
        alert(JSON.stringify($window.getAllWatchers()));
    };

    // stuff for ui grid
    $scope.columns = [];
    $scope.gridOptions = {
        expandableRowTemplate: 'expandableRowTemplate.html',
        expandableRowHeight: 150,
        //subGridVariable will be available in subGrid scope
        //expandableRowScope: {
        //    subGridVariable: 'subGridScopeVariable'
        //}
        enableSorting: true,
        enableGridMenu: true,
        columnDefs: $scope.columns,
        onRegisterApi: function( gridApi ) {
            $scope.gridApi = gridApi;
        }
    };

    init();

    function init() {
        $scope.loading = true;
        $http.get('TIVSData.json')
            .success(function (data) {
                $scope.columns.length = 0;

                var itemCodeRegex = /\d+/;
                var colorCodeRegex = /[a-zA-Z]+/;

                // do ItemView level stuff
                var itemColNames = Object.keys(data.TIVS_ItemView[0]);
                for (var i = 0; i < itemColNames.length; i++) {
                    $scope.columns[i] = { field: itemColNames[i] };
                    if (itemColNames[i] !== 'SizeClass' && itemColNames[i] !== 'Item_code') {
                        $scope.columns[i].visible = false;
                    }
                }

                for(var j = 0; j < data.TIVS_ItemView.length; j++) {
                    var subGridData = [];
                    subGridData.length = 0;
                    for (var k = 0; k < data.TIVS_ItemColorView.length; k++) {
                        if (data.TIVS_ItemColorView[k].Item_fkey === data.TIVS_ItemView[j].Item_key) {
                            subGridData.push(data.TIVS_ItemColorView[k]);
                        }
                    }
                    data.TIVS_ItemView[j].subGridOptions = {
                        columnDefs: [ {name:"Color", field:"Color_code"} ],
                        data: subGridData
                    }
                }
                $scope.gridOptions.data = data.TIVS_ItemView;

                // do ItemColor level stuff


                // do SKUView level stuff
                for (var x = 0; x < data.TIVS_SKUView.length; x++) {
                    data.TIVS_SKUView[x].Item_code = data.TIVS_SKUView[x].ItemColorCodes.match(itemCodeRegex)[0];
                    data.TIVS_SKUView[x].Color_code = data.TIVS_SKUView[x].ItemColorCodes.match(colorCodeRegex)[0];
                }

                /*
                var skuColNames = Object.keys(data.TIVS_SKUView[0]);
                for (var i = 0; i < skuColNames.length; i++) {
                    $scope.columns[i] = { field: skuColNames[i] };
                    if (skuColNames[i] !== 'Color_code' && skuColNames[i] !== 'Item_code' && skuColNames[i] !== 'Size_code') {
                        $scope.columns[i].visible = false;
                    }
                    if (skuColNames[i] === 'Item_code') {
                        //$scope.columns[i].grouping = { groupPriority: 0 };
                        //$scope.columns[i].sort = { groupPriority: 0, direction: 'asc' };
                    }
                    if (skuColNames[i] === 'Color_code') {
                        //$scope.columns[i].grouping = { groupPriority: 1 };
                        //$scope.columns[i].sort = { groupPriority: 1, direction: 'asc' };
                    }
                }
                $scope.gridOptions.data = data.TIVS_ItemView;
                /// This can be used for dynamic grouping $scope.gridApi.grouping.clearGrouping();
                /// This can be used for dynamic grouping $scope.gridApi.grouping.groupColumn('SKU_key');
                /// This can be used for dynamic grouping $scope.gridApi.grouping.aggregateColumn('Item_code', uiGridGroupingConstants.aggregation.COUNT);
                */
            })
            .finally(function () {
                $scope.loading = false;
                $scope.loadAttempted = true;
            })
    }
}]);


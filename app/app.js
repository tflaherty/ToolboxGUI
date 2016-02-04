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

// how to use drag and drop to reorder lists!
// http://tool-man.org/ToolManDHTML/sorting.html

// jquery learning center
// http://learn.jquery.com/

// http://www.bennadel.com/blog/2480-unbinding-watch-listeners-in-angularjs.htm

var t = angular.module('Toolbox', []);

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
                            //dataView.moveColumn(oldIndexOfMovedItem, newIndexOfMovedItem);

                            if (angular.isArray(data)) {
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

t.controller("TIVSController", function ($scope) {
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
});


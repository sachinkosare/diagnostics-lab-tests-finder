angular.module('controllers', []).
controller('UkDiagnosticsRatesController', function ($scope, $timeout, $filter, $http, $localStorage, $sessionStorage, loadRateData) {
    $scope.$storage = $localStorage;
    $scope.allItems = [];
    $scope.selectedItems = [];
    $scope.currentSelectedItemId = 0;
    $scope.listTotal = 0;
    $scope.quickAddButtonClicked = false;
    $scope.views = [{
            id: "dashboard",
            label: "Dashboard",
            visible: false,
            path: "dashboard.html",
            icon: "dashboard"
        },
        {
            id: "current",
            label: "Current List",
            visible: true,
            path: "current.html",
            icon: "format_list_numbered"
        },
        {
            id: "all",
            label: "All Tests",
            visible: false,
            path: "all.html",
            icon: "list"
        },
        {
            id: "manage",
            label: "Manage Tests",
            visible: false,
            path: "manage.html",
            icon: "build"
        }
    ];
    $scope.currentView;
    $scope.viewTitle;
    $scope.templatePath;

    var clearButton = null;
    delete $scope.$storage.rateData;
    var self = this;

    self.simulateQuery = false;

    self.querySearch = querySearch;
    self.selectedItemChange = selectedItemChange;
    self.searchTextChange = searchTextChange;

    $(document).ready(function () {

        $("md-autocomplete").on("keydown", "input", function () {
            console.log("hi")
            $("md-autocomplete").on("click", "button", function (event) {
                console.log("Clear! hide dropdown")
                document.getElementsByTagName("md-virtual-repeat-container")[0].style.cssText += ';display:none !important;';
            });

            var that = this;
            $timeout(function () {
                if ($.trim(that.value) == "") {
                    document.getElementsByTagName("md-virtual-repeat-container")[0].style.cssText += ';display:none !important;';
                } else {
                    document.getElementsByTagName("md-virtual-repeat-container")[0].style.cssText += ';display:block !important;';
                }
            }, 0);
        });
    })

    $scope.renderView = function () {
        console.log("render veiw")
        console.log($scope.$storage.rateData)
        $scope.$storage.rateData.rate_list.forEach(function (item) {
            if (item.test_name != undefined) {
                $scope.allItems[item.ID] = {
                    "test_id": item.ID,
                    "test_name": item.test_name,
                    "sample_instruction": item.sample_instruction,
                    "clinical_use": item.clinical_use,
                    "reporting_time": item.reporting_time,
                    "price": item.price,
                    "selected": false
                }
            }
        });

        $scope.updateView("", true);
    }

    $scope.updateView = function (template, pageLoad) {
        console.log("---- updateView")
        for (let view of $scope.views) {
            if ((pageLoad && view.visible) || (!pageLoad && view.id == template)) {
                $scope.currentView = view.id;
                $scope.viewTitle = view.label;
                $scope.templatePath = view.path;
                break;
            }
        }     
        if (!pageLoad) {   
            document.getElementsByTagName("md-virtual-repeat-container")[0].style.cssText += ';display:none !important;';
        }
    }

    $scope.updateCurrentSelectedItemId = function (itemId) {
        $scope.currentSelectedItemId = itemId;
    }

    if (!$scope.$storage.rateData) {
        loadRateData.then(function success(response) {
                console.log("No local storage found. Get data via Ajax")
                $scope.$storage.rateData = response.data;
                $scope.renderView();
            },
            function fail(response) {
                console.log("error fetching rate data. EXIT");
                return false;
            });

    } else {
        console.log("Local storage found")
        $scope.renderView();
    }


    $scope.AddToList = function (item, event) {
        console.log("AddToList " + item.price, event);
        event.stopPropagation();
        $scope.currentSelectedItemId = item.test_id;
        item.selected = true;
        $scope.selectedItems.push(item.test_id);
        if (event.currentTarget.id != "add-from-details") {
            $scope.quickAddButtonClicked = true;
            document.getElementsByTagName("md-virtual-repeat-container")[0].style.cssText += ';display:block !important;';
        }
        $scope.listTotal = $scope.listTotal + parseInt(item.price.replace(/\,/g, ''));
    }

    $scope.RemoveFromList = function (item, event) {
        console.log("RemoveFromList");
        event.stopPropagation();
        item.selected = false;
        $scope.selectedItems.splice($scope.selectedItems.indexOf(item.test_id), 1);
        if (event.currentTarget.id != "remove-from-details" &&  event.currentTarget.id != "remove-from-summary") {
            $scope.quickAddButtonClicked = true;
            document.getElementsByTagName("md-virtual-repeat-container")[0].style.cssText += ';display:block !important;';
        }
        $scope.listTotal = $scope.listTotal - parseInt(item.price.replace(/\,/g, ''));
    }

    function RecalcalculateListTotal() {
        $scope.listTotal = 0;
        $scope.selectedItems.forEach(function (itemId) {
            $scope.listTotal += parseInt($scope.allItems[itemId].price);
        });
    }

    function querySearch(query) {
        var results = query ? $scope.allItems.filter(createFilterFor(query)) : $scope.allItems,
            deferred;

        if (self.simulateQuery) {
            deferred = $q.defer();
            $timeout(function () {
                deferred.resolve(results);
            }, Math.random() * 1000, false);
            return deferred.promise;
        } else {
            return results;
        }
    }

    function searchTextChange(text) {
        console.log('Text changed to ' + text);
    }

    function selectedItemChange(item) {
        if (item) {
            console.log("selectedItemChange");
            $scope.currentSelectedItemId = item.test_id;
            $scope.updateView("current", false);
        }
    }

    function createFilterFor(query) {
        if (query) {
            var lowercaseQuery = query.toLowerCase();

            return function filterFn(item) {
                if (item.test_name) {
                    var testName = item.test_name.toLowerCase();
                    return (testName.search(lowercaseQuery) !== -1);
                } else {
                    return false;
                }
            };
        }

    }





});
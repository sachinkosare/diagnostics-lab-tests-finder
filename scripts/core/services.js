angular.module('services', [])
    .service('loadRateData', function ($http, PATHS) {
        return $http.get(PATHS.DATA + "/rate_data.json");
    });
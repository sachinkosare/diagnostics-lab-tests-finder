angular.module('UkDiagnosticsRatesApp', [
    'ngSanitize',
    'services',
    'controllers',
    'directives',
    'constants',
    'ngStorage',
    'ngMaterial', 
    'ngMessages'
  ])
  .run(function ($rootScope, PATHS) {
    $rootScope.PATHS = PATHS;
  });
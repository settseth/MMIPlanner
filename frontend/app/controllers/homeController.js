angular.module('MMIPlanner').controller('HomeController', function($scope, $window) {
    $scope.isScrolled = false;

    angular.element($window).on('scroll', function() {
        $scope.isScrolled = $window.scrollY > 100;
        $scope.$apply();
    });
});

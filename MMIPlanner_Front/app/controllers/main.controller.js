app.controller('MainController', function($scope, $window) {
    $scope.isScrolled = false;

    angular.element($window).on('scroll', function() {
        if ($window.scrollY > 300) { // Ajuste 100 selon la hauteur où l'effet doit disparaître
            $scope.isScrolled = true;
        } else {
            $scope.isScrolled = false;
        }
        $scope.$apply();
    });
});

angular.module('MMIPlanner')
.controller('AuthController', function($scope, $location, AuthService) {
    $scope.credentials = {
        email: '',
        motdepasse: ''
    };

    $scope.userData = {
        email: '',
        motdepasse: '',
        prenom: '',
        nom: ''
    };

    $scope.error = null;

    $scope.login = function() {
        $scope.error = null;
        AuthService.login($scope.credentials)
            .then(function(user) {
                $location.path('/events');
            })
            .catch(function(error) {
                $scope.error = error.data?.message || 'Erreur de connexion';
            });
    };

    $scope.register = function() {
        $scope.error = null;
        AuthService.register($scope.userData)
            .then(function() {
                $location.path('/login');
            })
            .catch(function(error) {
                $scope.error = error.data?.message || 'Erreur d\'inscription';
            });
    };
});

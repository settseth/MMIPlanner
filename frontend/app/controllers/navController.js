angular.module('MMIPlanner')
.controller('NavController', function($scope, $location, AuthService) {
    // Fonction pour vérifier si l'utilisateur est connecté
    $scope.isAuthenticated = function() {
        return AuthService.isAuthenticated();
    };
    
    // Récupérer l'utilisateur courant
    $scope.getCurrentUser = function() {
        return AuthService.getCurrentUser();
    };
    
    // Fonction pour se déconnecter
    $scope.logout = function() {
        AuthService.logout()
            .then(function() {
                // Rediriger vers la page d'accueil après déconnexion
                $location.path('/');
            })
            .catch(function(error) {
                console.error('Erreur lors de la déconnexion:', error);
                alert('Erreur lors de la déconnexion. Veuillez réessayer.');
            });
    };
    
    // Vérifier si le lien actuel est actif
    $scope.isActive = function(path) {
        return $location.path() === path;
    };
});

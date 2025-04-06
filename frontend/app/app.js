angular.module('MMIPlanner', ['ngRoute'])

// Role label filter
.filter('roleLabel', function() {
    return function(role) {
        const labels = {
            'ROLE_USER': 'Utilisateur',
            'ROLE_ADMIN': 'Administrateur'
        };
        return labels[role] || role;
    };
})
.config(['$routeProvider', '$locationProvider',
function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/login', {
            templateUrl: 'views/login.html',
            controller: 'AuthController'
        })
        .when('/', {
            templateUrl: 'views/home.html',
            controller: 'HomeController'
        })
        .when('/clubs', {
            templateUrl: 'views/club.html',  // Met à jour le chemin ici
            controller: 'ClubController'
        })
        
        
        .when('/register', {
            templateUrl: 'views/register.html',
            controller: 'AuthController'
        })
        .when('/events', {
            templateUrl: 'views/events.html',
            controller: 'EventController'
        })
        
        .when('/events/:id', {
            templateUrl: 'views/event-detail.html',
            controller: 'EventDetailController'
        })
        .when('/my-events', {
            templateUrl: 'views/my-events.html',
            controller: 'MyEventsController'
        })
        .when('/admin', {
            templateUrl: 'views/admin.html',
            controller: 'AdminController',
            resolve: {
                auth: ['AuthService', '$q', '$location', function(AuthService, $q, $location) {
                    return $q(function(resolve, reject) {
                        if (!AuthService.isAuthenticated()) {
                            $location.path('/login');
                            reject('Not authenticated');
                        } else {
                            const currentUser = AuthService.getCurrentUser();
                            const isAdmin = currentUser.roles && 
                                currentUser.roles.includes('ROLE_ADMIN');
                            
                            if (!isAdmin) {
                                $location.path('/events');
                                reject('Not an admin');
                            } else {
                                resolve();
                            }
                        }
                    });
                }]
            }
        })
        .otherwise({
            redirectTo: '/'
        });

    $locationProvider.hashPrefix('');
}])
.run(['$rootScope', '$location', 'AuthService', 
function($rootScope, $location, AuthService) {
    $rootScope.$on('$routeChangeStart', function(event, next, current) {
        // No protected routes at the moment
        // Future routes can be added here if needed
    });
}])
.config(['$httpProvider', function($httpProvider) {
    // Intercepteur HTTP pour ajouter le token d'authentification
    $httpProvider.interceptors.push(['$q', function($q) {
        return {
            'request': function(config) {
                // Ajouter l'en-tête d'authentification si l'utilisateur est connecté
                const user = JSON.parse(localStorage.getItem('user') || 'null');
                console.log('Intercepteur HTTP - User:', user);
                
                if (user) {
                    config.headers = config.headers || {};
                    
                    // Si l'API utilise JWT
                    if (user.token) {
                        config.headers.Authorization = 'Bearer ' + user.token;
                        console.log('Ajout du token Bearer:', config.headers.Authorization);
                    } 
                    // Si l'utilisateur a un email (pour API Platform)
                    else if (user.email) {
                        // Utiliser l'en-tête Authorization standard sans préfixe
                        // Cela évite de déclencher une requête preflight CORS
                        config.headers.Authorization = user.email;
                        console.log('Ajout de l\'email comme autorisation:', config.headers.Authorization);
                    }
                    // Si l'API utilise un cookie de session
                    else {
                        console.log('Aucune méthode d\'authentification disponible');
                    }
                }
                
                // Ajouter l'en-tête Content-Type pour les requêtes POST et PUT
                if (config.method === 'POST' || config.method === 'PUT') {
                    config.headers['Content-Type'] = 'application/ld+json';
                    config.headers['Accept'] = 'application/ld+json';
                    console.log('Ajout des en-têtes pour API Platform:', config.headers);
                }
                // Pour les requêtes PATCH, utiliser merge-patch+json
                if (config.method === 'PATCH') {
                    config.headers['Content-Type'] = 'application/merge-patch+json';
                    config.headers['Accept'] = 'application/ld+json';
                    console.log('Ajout des en-têtes pour PATCH:', config.headers);
                }
                // Pour les requêtes DELETE, utiliser application/ld+json
                if (config.method === 'DELETE') {
                    config.headers['Content-Type'] = 'application/ld+json';
                    config.headers['Accept'] = 'application/ld+json';
                    console.log('Ajout des en-têtes pour DELETE:', config.headers);
                }
                
                console.log('Requête HTTP:', config.method, config.url);
                return config;
            },
            'responseError': function(rejection) {
                console.error('Erreur HTTP:', rejection.status, rejection.statusText, rejection.config.url);
                console.log('Détails de l\'erreur:', rejection.data);
                
                // Ne pas rediriger automatiquement pour pouvoir déboguer
                if (rejection.status === 401) {
                    console.error('Erreur d\'authentification 401 - Vérifiez les logs');
                    // Ne pas supprimer l'utilisateur ni rediriger automatiquement
                    // localStorage.removeItem('user');
                    // window.location.href = '#!/login';
                }
                return $q.reject(rejection);
            }
        };
    }]);
}]);

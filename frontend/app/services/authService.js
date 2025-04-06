angular.module('MMIPlanner')
.service('AuthService', function($http, $q) {
    const API_URL = 'http://localhost:8000/api';
    
    return {
        login: function(credentials) {
            return $http.post(`${API_URL}/login`, {
                email: credentials.email,
                motdepasse: credentials.motdepasse
            })
            .then(function(response) {
                if (response.data.user) {
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                    return response.data.user;
                }
                throw new Error('Invalid response format');
            });
        },

        register: function(userData) {
            return $http.post(`${API_URL}/register`, {
                email: userData.email,
                motdepasse: userData.motdepasse,
                prenom: userData.prenom,
                nom: userData.nom
            })
            .then(function(response) {
                return response.data;
            });
        },

        logout: function() {
            // Essayer d'appeler l'API de déconnexion, mais ne pas dépendre de sa réussite
            return $http.post(`${API_URL}/logout`)
                .then(function() {
                    localStorage.removeItem('user');
                    return true; // Indiquer que la déconnexion a réussi
                })
                .catch(function(error) {
                    console.warn('Erreur lors de l\'appel à l\'API de déconnexion:', error);
                    // Supprimer quand même l'utilisateur du localStorage
                    localStorage.removeItem('user');
                    return true; // Considérer la déconnexion comme réussie même si l'API échoue
                });
        },

        getCurrentUser: function() {
            const user = localStorage.getItem('user');
            return user ? JSON.parse(user) : null;
        },

        isAuthenticated: function() {
            return !!localStorage.getItem('user');
        }
    };
});

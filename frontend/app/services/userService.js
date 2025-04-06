angular.module('MMIPlanner')
.service('UserService', function($http) {
    const API_URL = 'http://localhost:8000/api';
    
    return {
        /**
         * Get a specific user by ID
         * @param {number} id - The user ID
         * @returns {Promise} Promise containing user data
         */
        getUser: function(id) {
            return $http.get(`${API_URL}/utilisateurs/${id}`)
                .then(function(response) {
                    return response.data;
                })
                .catch(function(error) {
                    console.error(`Error fetching user ${id}:`, error);
                    throw error;
                });
        },
        
        /**
         * Get a user by email
         * @param {string} email - The user email
         * @returns {Promise} Promise containing user data
         */
        getUserByEmail: function(email) {
            return $http.get(`${API_URL}/utilisateurs?email=${encodeURIComponent(email)}`)
                .then(function(response) {
                    // Vérifier si nous avons des résultats
                    if (response.data && response.data.member && response.data.member.length > 0) {
                        // Retourner le premier utilisateur trouvé
                        return response.data.member[0];
                    }
                    throw new Error(`No user found with email ${email}`);
                })
                .catch(function(error) {
                    console.error(`Error fetching user by email ${email}:`, error);
                    throw error;
                });
        }
    };
});

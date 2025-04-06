angular.module('MMIPlanner')
.service('CommentService', function($http, AuthService) {
    const API_URL = 'http://localhost:8000/api';
    
    // Fonction pour obtenir les en-têtes d'authentification
    function getAuthHeaders() {
        const user = AuthService.getCurrentUser();
        if (!user || !user.email) {
            return {};
        }
        
        // Utiliser l'email de l'utilisateur comme token
        return {
            'Authorization': 'Bearer ' + user.email
        };
    }
    
    return {
        /**
         * Get a specific comment by ID
         * @param {number} id - The comment ID
         * @returns {Promise} Promise containing comment data
         */
        getComment: function(id) {
            return $http.get(`${API_URL}/commentaires/${id}`)
                .then(function(response) {
                    return response.data;
                })
                .catch(function(error) {
                    console.error(`Error fetching comment ${id}:`, error);
                    throw error;
                });
        },
        
        /**
         * Add a comment to an event
         * @param {number} eventId - The event ID
         * @param {Object} commentData - The comment data
         * @returns {Promise} Promise containing created comment
         */
        addComment: function(eventId, commentData) {
            // Configurer les headers pour la requête POST
            var config = {
                headers: {
                    'Content-Type': 'application/ld+json',
                    ...getAuthHeaders() // Ajouter les en-têtes d'authentification
                },
                withCredentials: true // Envoyer les cookies avec la requête
            };
            
            // Ne pas convertir les données en JSON car AngularJS le fait automatiquement
            return $http.post(`${API_URL}/commentaires`, commentData, config)
                .then(function(response) {
                    console.log('Comment added successfully:', response.data);
                    return response.data;
                })
                .catch(function(error) {
                    console.error(`Error adding comment to event ${eventId}:`, error);
                    // Afficher le détail de l'erreur si disponible
                    if (error.data && error.data.detail) {
                        console.error('Détail de l\'erreur:', error.data.detail);
                    } else if (error.data && error.data.violations) {
                        console.error('Violations:', error.data.violations);
                    } else if (error.data) {
                        console.error('Données d\'erreur:', error.data);
                    }
                    throw error;
                });
        },
        
        /**
         * Delete a comment
         * @param {number} id - The comment ID
         * @returns {Promise} Promise resolving on successful deletion
         */
        deleteComment: function(id) {
            // Configurer les headers pour la requête DELETE
            var config = {
                headers: {
                    'Content-Type': 'application/ld+json',
                    ...getAuthHeaders() // Ajouter les en-têtes d'authentification
                },
                withCredentials: true // Envoyer les cookies avec la requête
            };
            
            return $http.delete(`${API_URL}/commentaires/${id}`, config)
                .then(function(response) {
                    return response.data;
                })
                .catch(function(error) {
                    console.error(`Error deleting comment ${id}:`, error);
                    throw error;
                });
        }
    };
});

(function() {
    'use strict';
    
    angular
        .module('MMIPlanner')
        .service('EventService', EventService);
    
    EventService.$inject = ['$http', 'AuthService', '$q'];
    
    function EventService($http, AuthService, $q) {
        const API_URL = 'http://localhost:8000/api';
        
        // Fonction pour obtenir les en-têtes d'authentification
        function getAuthHeaders() {
            const user = AuthService.getCurrentUser();
            if (!user || !user.email) {
                return {};
            }
            
            // Utiliser l'email de l'utilisateur comme token
            return {
                'Authorization': user.email
            };
        }
        
        // Fonction pour vérifier les permissions de modification/suppression
        function canModifyEvent(event, currentUser) {
        // Gérer différentes structures possibles de l'objet utilisateur
        const userObject = currentUser.user || currentUser;
        
        // Vérifier si l'utilisateur est admin
        const roles = userObject.roles || userObject.role || [];
        const isAdmin = roles.includes('ROLE_ADMIN') || 
                        roles.includes('ROLE_SUPER_ADMIN') || 
                        roles.includes('admin');
        
        if (isAdmin) {
            return true;
        }
        
        // Vérifier si l'utilisateur est l'organisateur de l'événement
        const currentUserId = userObject.id || 
            userObject.userId || 
            (userObject['@id'] ? 
                userObject['@id'].split('/').pop() : 
                null);
        
        // Vérifier que l'événement a un organisateur
        if (!event.organisateur) {
            console.error('DEBUG: Pas d\'organisateur pour l\'événement');
            return false;
        }
        
        const organizerId = event.organisateur.split('/').pop();
        
        return currentUserId === organizerId;
    }

    return {
        /**
         * Get all events from the API
         * @returns {Promise} Promise containing events collection
         */
        getAllEvents: function() {
            return $http.get(`${API_URL}/evenements`, { headers: getAuthHeaders() })
            .then(function(response) {
                return response.data;
            })
            .catch(function(error) {
                console.error('Error fetching events:', error);
                    throw error;
            });
        },
        
        /**
         * Get a specific event by ID
         * @param {number} id - The event ID
         * @returns {Promise} Promise containing event data
         */
        getEvent: function(id) {
            return $http.get(`${API_URL}/evenements/${id}`, { headers: getAuthHeaders() })
                .then(function(response) {
                    return response.data;
                })
                .catch(function(error) {
                    console.error(`Error fetching event ${id}:`, error);
                    throw error;
                });
        },

        /**
         * Create a new event
         * @param {Object} eventData - The event data
         * @returns {Promise} Promise containing created event
         */
        createEvent: function(eventData) {
            // Format JSON-LD précis pour API Platform
            const jsonLdData = {
                '@context': '/api/contexts/Evenement',
                '@type': 'Evenement',
                'titre': eventData.titre,
                'description': eventData.description,
                'date': eventData.date || new Date().toISOString(), // Default to current date if not provided
                'lieu': eventData.lieu,
                'organisateur': eventData.organisateur, // Utiliser directement l'URL complète
                'club': eventData.club || null, // Ajouter le club ou null
                'image': eventData.image || null, // Ajouter l'image si disponible
                'dateCreation': new Date().toISOString() // Ajouter la date de création actuelle
            };
            
            // Supprimer les propriétés null
            Object.keys(jsonLdData).forEach(key => 
                jsonLdData[key] === null && delete jsonLdData[key]
            );
            
            console.log('Données envoyées à l\'API:', JSON.stringify(jsonLdData, null, 2));
            
            return $http({
                method: 'POST',
                url: `${API_URL}/evenements`,
                data: jsonLdData,
                headers: {
                    'Content-Type': 'application/ld+json',
                    'Accept': 'application/ld+json',
                    ...getAuthHeaders()
                },
                withCredentials: true
            })
                .then(function(response) {
                    return response.data;
                })
                .catch(function(error) {
                    console.error('Error creating event:', error);
                    console.error('Détails de la requête:', {
                        data: jsonLdData,
                        headers: error.config.headers,
                        url: error.config.url,
                        responseError: error.data
                    });
                    throw error;
                });
        },

        /**
         * Mettre à jour un événement
         * @param {string} eventId - L'ID de l'événement à mettre à jour
         * @param {Object} eventData - Les nouvelles données de l'événement
         * @returns {Promise} Promesse contenant l'événement mis à jour
         */
        updateEvent: function(eventId, eventData) {
            const currentUser = AuthService.getCurrentUser();
            
            // Récupérer l'événement pour vérifier les permissions
            return this.getEvent(eventId)
                .then(event => {
                    // Vérifier les permissions
                    if (!canModifyEvent(event, currentUser)) {
                        return $q.reject({
                            status: 403,
                            message: 'Vous n\'avez pas la permission de modifier cet événement.'
                        });
                    }
                    
                    // Préparer les données pour l'API Platform en conservant les données existantes
                    const jsonLdData = {
                        '@context': '/api/contexts/Evenement',
                        '@type': 'Evenement',
                        'titre': eventData.titre || event.titre,
                        'description': eventData.description || event.description,
                        'date': eventData.date || event.date,
                        'lieu': eventData.lieu || event.lieu,
                        'organisateur': event.organisateur, 
                        'club': eventData.club !== undefined ? eventData.club : event.club,
                        'image': eventData.image !== undefined ? eventData.image : event.image
                    };
                    
                    console.log('Données de mise à jour:', jsonLdData);
                    
                    // Supprimer les propriétés null
                    Object.keys(jsonLdData).forEach(key => 
                        jsonLdData[key] === null && delete jsonLdData[key]
                    );
                    
                    return $http({
                        method: 'PUT',
                        url: `${API_URL}/evenements/${eventId}`,
                        data: jsonLdData,
                        headers: {
                            'Content-Type': 'application/ld+json',
                            'Accept': 'application/ld+json',
                            ...getAuthHeaders()
                        },
                        withCredentials: true
                    }).then(response => response.data);
                })
                .catch(error => {
                    console.error('Erreur lors de la mise à jour de l\'événement:', error);
                    throw error;
                });
        },

        /**
         * Supprimer un événement
         * @param {string} eventId - L'ID de l'événement à supprimer
         * @returns {Promise} Promesse de suppression
         */
        deleteEvent: function(eventId) {
            const currentUser = AuthService.getCurrentUser();
            
            // Récupérer l'événement pour vérifier les permissions
            return this.getEvent(eventId)
                .then(event => {
                    // Vérifier les permissions
                    if (!canModifyEvent(event, currentUser)) {
                        return $q.reject({
                            status: 403,
                            message: 'Vous n\'avez pas la permission de supprimer cet événement.'
                        });
                    }
                    
                    return $http({
                        method: 'DELETE',
                        url: `${API_URL}/evenements/${eventId}`,
                        headers: {
                            ...getAuthHeaders()
                        },
                        withCredentials: true
                    }).then(response => response.data);
                })
                .catch(error => {
                    console.error('Erreur lors de la suppression de l\'événement:', error);
                    throw error;
                });
        },

        /**
         * Get events for a specific club
         * @param {number} clubId - The club ID
         * @returns {Promise} Promise containing club events
         */
        getClubEvents: function(clubId) {
            return $http.get(`${API_URL}/clubs/${clubId}/evenements`, { headers: getAuthHeaders() })
                .then(function(response) {
                    return response.data;
                })
                .catch(function(error) {
                    console.error(`Error fetching events for club ${clubId}:`, error);
                    throw error;
                });
        },

        /**
         * Get events organized by a specific user
         * @param {number} userId - The user ID
         * @returns {Promise} Promise containing user's events
         */
        getUserEvents: function(userId) {
            return $http.get(`${API_URL}/utilisateurs/${userId}/evenements`, { headers: getAuthHeaders() })
                .then(function(response) {
                    return response.data;
                })
                .catch(function(error) {
                    console.error(`Error fetching events for user ${userId}:`, error);
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
            return $http.post(`${API_URL}/evenements/${eventId}/commentaires`, commentData, {
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/ld+json'
                }
            })
                .then(function(response) {
                    return response.data;
                })
                .catch(function(error) {
                    console.error(`Error adding comment to event ${eventId}:`, error);
                    throw error;
                });
        }
    };
}
})();

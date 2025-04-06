angular.module('MMIPlanner')
.service('ClubService', function($http) {
    const API_URL = 'http://localhost:8000/api';
    
    return {
        /**
         * Get a specific club by ID
         * @param {number} id - The club ID
         * @returns {Promise} Promise containing club data
         */
        getClub: function(id) {
            return $http.get(`${API_URL}/clubs/${id}`)
                .then(function(response) {
                    return response.data;
                })
                .catch(function(error) {
                    console.error(`Error fetching club ${id}:`, error);
                    throw error;
                });
        },
        
        /**
         * Get all clubs
         * @returns {Promise} Promise containing clubs collection
         */
        getAllClubs: function() {
            return $http.get(`${API_URL}/clubs`, {
                headers: {
                    'Accept': 'application/ld+json'
                }
            })
            .then(function(response) {
                console.log('Response from getAllClubs:', response);
                console.log('Response data:', response.data);
                
                // Explicitly access hydra:member
                const clubs = response.data['hydra:member'] || 
                              (response.data.member ? response.data.member : 
                              (Array.isArray(response.data) ? response.data : []));
                
                console.log('Extracted clubs:', clubs);
                return clubs;
            })
            .catch(function(error) {
                console.error('Error fetching clubs:', error);
                throw error;
            });
        }
    };
});

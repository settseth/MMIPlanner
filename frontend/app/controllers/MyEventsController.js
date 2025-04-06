angular.module('MMIPlanner')
.controller('MyEventsController', ['$scope', 'AuthService', 'EventService', '$q', function($scope, AuthService, EventService, $q) {
    $scope.participatedEvents = [];
    $scope.loading = true;
    $scope.error = null;

    // Format date for display
    $scope.formatDate = function(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const parts = {
            year: date.getFullYear(),
            month: String(date.getMonth() + 1).padStart(2, '0'),
            day: String(date.getDate()).padStart(2, '0'),
            hours: String(date.getHours()).padStart(2, '0'),
            minutes: String(date.getMinutes()).padStart(2, '0')
        };
        return `${parts.day}/${parts.month}/${parts.year} à ${parts.hours}:${parts.minutes}`;
    };

    $scope.loadParticipatedEvents = function() {
        $scope.loading = true;
        $scope.error = null;

        // Check authentication
        if (!AuthService.isAuthenticated()) {
            $scope.participatedEvents = [];
            $scope.loading = false;
            return;
        }

        // Retrieve participated events from localStorage
        const participatedIds = JSON.parse(localStorage.getItem('participatedEvents') || '[]');
        console.log('Participated events from localStorage:', participatedIds);

        if (participatedIds.length === 0) {
            $scope.loading = false;
            return;
        }

        // Get full event details for each ID
        const promises = participatedIds.map(event => 
            EventService.getEvent(event.id)
                .then(fullEvent => {
                    fullEvent.isParticipating = true;
                    return fullEvent;
                })
                .catch(error => {
                    console.error(`Error loading event ${event.id}:`, error);
                    return null; // Return null for failed events
                })
        );

        $q.all(promises)
            .then(events => {
                // Filter out failed events (null values)
                events = events.filter(event => event !== null);
                console.log('Loaded full event details:', events);
                $scope.participatedEvents = events;
            })
            .catch(error => {
                console.error('Error loading events:', error);
                $scope.error = 'Erreur lors du chargement des événements';
            })
            .finally(() => {
                $scope.loading = false;
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            });
    };

    // Toggle participation
    $scope.toggleParticipation = function(event) {
        let participatedEvents = JSON.parse(localStorage.getItem('participatedEvents') || '[]');
        const eventIndex = participatedEvents.findIndex(e => e.id === event.id);
        
        if (eventIndex !== -1) {
            participatedEvents.splice(eventIndex, 1);
            event.isParticipating = false;
            localStorage.setItem('participatedEvents', JSON.stringify(participatedEvents));
            $scope.loadParticipatedEvents(); // Reload the list
        }
    };

    // Load events when controller initializes
    $scope.loadParticipatedEvents();
}]);
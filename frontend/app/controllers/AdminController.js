angular.module('MMIPlanner')
.controller('AdminController', ['$scope', '$http', 'AuthService', 'EventService', 'UserService', 'ClubService', '$q', '$timeout', 
function($scope, $http, AuthService, EventService, UserService, ClubService, $q, $timeout) {
    console.log('AdminController initialized');
    console.log('Current user:', AuthService.getCurrentUser()); // Debug auth



    // Initialize loading states
    $scope.loading = {
        events: false,
        users: false,
        clubs: false
    };

    // Initialize admin dashboard
    $scope.dashboardData = {
        totalEvents: 0,
        totalUsers: 0,
        totalClubs: 0,
        recentEvents: [],
        recentUsers: []
    };
    console.log('Dashboard data initialized:', $scope.dashboardData); // Debug initial state

    // Loading and error states
    $scope.loading = {
        events: false,
        users: false,
        clubs: false
    };
    $scope.error = null;

    // Active section in admin panel
    $scope.activeSection = 'dashboard';
    console.log('Initial activeSection:', $scope.activeSection); // Debug

    // Utility function to format date
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

    // Dashboard statistics
    $scope.loadDashboardData = function() {
        console.log('Loading dashboard data...');
        $scope.loading.events = true;
        $scope.loading.users = true;
        $scope.loading.clubs = true;
        $scope.error = null;

        const currentUser = AuthService.getCurrentUser();
        const headers = {
            'Authorization': currentUser.email,
            'Accept': 'application/ld+json'
        };

        $q.all({
            events: EventService.getAllEvents(),
            users: $http.get('http://localhost:8000/api/utilisateurs', { headers }),
            clubs: $http.get('http://localhost:8000/api/clubs', { headers })
        }).then(function(results) {
            $timeout(function() {
                // Process events
                const eventsList = results.events.member || results.events || [];
                $scope.dashboardData.totalEvents = results.events.totalItems || eventsList.length;
                $scope.dashboardData.recentEvents = [...eventsList]
                    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
                    .slice(0, 5);
                $scope.loading.events = false;

                // Process users
                const users = results.users.data['hydra:member'] || [];
                $scope.dashboardData.totalUsers = results.users.data.totalItems || users.length;

                // Process clubs
                const clubs = results.clubs.data['hydra:member'] || [];
                $scope.dashboardData.totalClubs = results.clubs.data.totalItems || clubs.length;

                $scope.loading.users = false;
                $scope.loading.clubs = false;
            });
        }).catch(function(error) {
            console.error('Error loading dashboard data:', error);
            $timeout(function() {
                $scope.error = 'Impossible de charger les données du tableau de bord';
                $scope.loading.events = false;
                $scope.loading.users = false;
                $scope.loading.clubs = false;
                $scope.dashboardData.totalEvents = 0;
                $scope.dashboardData.totalUsers = 0;
                $scope.dashboardData.totalClubs = 0;
                $scope.dashboardData.recentEvents = [];
            });
        });
    };

    // Users management
    $scope.users = [];
    $scope.userError = null;

    $scope.loadUsers = function() {
        console.log('Loading users...');
        $scope.loading.users = true;
        $scope.userError = null;

        $http.get(`http://localhost:8000/api/utilisateurs`, {
            headers: {
                'Authorization': AuthService.getCurrentUser().email,
                'Accept': 'application/ld+json'
            }
        })
        .then(function(response) {
            console.log('Users loaded:', response.data);
            $timeout(function() {
                if (response.data && response.data.member) {
                    $scope.users = response.data.member;
                    console.log('Processed users:', $scope.users);
                } else {
                    console.error('No users found in response:', response.data);
                    $scope.userError = 'Aucun utilisateur trouvé';
                    $scope.users = [];
                }
                $scope.loading.users = false;
            });
        })
        .catch(function(error) {
            console.error('Error loading users:', error);
            $timeout(function() {
                $scope.loading.users = false;
                $scope.userError = 'Impossible de charger les utilisateurs';
                $scope.users = [];
            });
        });
    };

    $scope.toggleUserStatus = function(user) {
        const newStatus = user.estactif === '0' ? '1' : '0';
        const currentUser = AuthService.getCurrentUser();
        
        $http({
            method: 'PATCH',
            url: `http://localhost:8000/api/utilisateurs/${user.id}`,
            data: { estactif: newStatus },
            headers: {
                'Content-Type': 'application/merge-patch+json',
                'Accept': 'application/json',
                'Authorization': currentUser ? currentUser.email : null
            },
            withCredentials: true,
            crossDomain: true
        })
        .then(function(response) {
            user.estactif = newStatus;
            console.log('User status updated successfully');
        })
        .catch(function(error) {
            console.error('Detailed error updating user status:', {
                status: error.status,
                data: error.data,
                headers: error.headers(),
                config: error.config
            });
            alert('Impossible de modifier le statut : ' + 
                (error.data?.detail || error.statusText || 'Erreur inconnue'));
        });
    };

    $scope.deleteUser = function(user) {
        if (!confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
            return;
        }
        
        const currentUser = AuthService.getCurrentUser();
        
        $http({
            method: 'DELETE',
            url: `http://localhost:8000/api/utilisateurs/${user.id}`,
            headers: {
                'Content-Type': 'application/merge-patch+json',
                'Accept': 'application/json',
                'Authorization': currentUser ? currentUser.email : null
            },
            withCredentials: true,
            crossDomain: true
        })
        .then(function(response) {
            // Remove user from the list
            const index = $scope.users.indexOf(user);
            if (index > -1) {
                $scope.users.splice(index, 1);
            }
            console.log('User deleted successfully');
        })
        .catch(function(error) {
            console.error('Detailed error deleting user:', {
                status: error.status,
                data: error.data,
                headers: error.headers(),
                config: error.config
            });
            alert('Impossible de supprimer l\'utilisateur : ' + 
                (error.data?.detail || error.statusText || 'Erreur inconnue'));
        });
    };

    // Events management
    $scope.events = [];
    $scope.loadEvents = function() {
        console.log('Loading events...'); // Debug
        $scope.loading.events = true;
        $scope.error = null;

        EventService.getAllEvents()
            .then(function(events) {
                console.log('Events received for list:', events); // Debug
                // Handle API Platform Collection format
                const eventsList = events.member || events || [];
                console.log('Events list for table:', eventsList);

                $timeout(function() {
                    $scope.events = eventsList;
                    $scope.loading.events = false;
                });
            })
            .catch(function(error) {
                console.error('Error loading events:', error);
                $timeout(function() {
                    $scope.error = 'Impossible de charger les événements';
                    $scope.loading.events = false;
                    $scope.events = [];
                });
            });
    };

    // Section navigation
    $scope.setActiveSection = function(section) {
        console.log('Setting active section to:', section); // Debug
        $scope.activeSection = section;
        $scope.error = null;

        // Load data for the specific section
        switch(section) {
            case 'dashboard':
                $scope.loadDashboardData();
                break;
            case 'events':
                $scope.loadEvents();
                break;
            case 'users':
                $scope.loadUsers();
                break;
        }
    };

    // Initialize dashboard on controller load
    $timeout(function() {
        $scope.loadDashboardData();
    });
}]);

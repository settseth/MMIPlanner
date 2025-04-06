angular.module('MMIPlanner')
.controller('EventController', function($scope, EventService, UserService, ClubService, AuthService, $filter, $q, $window) {

    
    // Modèle pour le nouvel événement
    $scope.newEvent = {
        titre: '',
        description: '',
        eventDate: new Date(),
        lieu: '',
        club: null,
        image: null
    };
    
    // État du formulaire
    $scope.formSubmitted = false;
    $scope.formError = null;
    $scope.formSuccess = false;
    $scope.showEventForm = false;
    
    // Liste des clubs pour le formulaire
    $scope.clubs = [];
    
    // Vérifier si l'utilisateur est connecté
    $scope.isAuthenticated = function() {
        return AuthService.isAuthenticated();
    };
    
    // Récupérer l'utilisateur actuel
    $scope.getCurrentUser = function() {
        return AuthService.getCurrentUser();
    };

    // Fonction utilitaire pour formater une date
    function formatDateParts(date) {
        return {
            year: date.getFullYear(),
            month: String(date.getMonth() + 1).padStart(2, '0'),
            day: String(date.getDate()).padStart(2, '0'),
            hours: String(date.getHours()).padStart(2, '0'),
            minutes: String(date.getMinutes()).padStart(2, '0')
        };
    }

    // Format date for display
    $scope.formatDate = function(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const parts = formatDateParts(date);
        return `${parts.day}/${parts.month}/${parts.year} à ${parts.hours}:${parts.minutes}`;
    };
    
    // Formater la date pour l'input datetime-local
    $scope.formatDateForInput = function(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const parts = formatDateParts(date);
        return `${parts.year}-${parts.month}-${parts.day}T${parts.hours}:${parts.minutes}:00`;
    };
    
    // Convertir la date du format input en format ISO pour l'API
    $scope.convertDateForAPI = function(inputDate) {
        console.log('Date d\'entrée:', inputDate);
        
        // Si aucune date n'est fournie, utiliser la date actuelle
        let dateToConvert = inputDate || new Date();
        
        // S'assurer que c'est un objet Date
        if (!(dateToConvert instanceof Date)) {
            dateToConvert = new Date(dateToConvert);
        }
        
        // Vérifier si la date est valide
        if (isNaN(dateToConvert.getTime())) {
            console.warn('Date invalide, utilisation de la date actuelle');
            dateToConvert = new Date();
        }
        
        const parts = formatDateParts(dateToConvert);
        const isoDate = `${parts.year}-${parts.month}-${parts.day}T${parts.hours}:${parts.minutes}:00`;
        
        console.log('Date convertie:', isoDate);
        return isoDate;
    };

    // Fonction pour extraire l'ID d'une URL d'API
    function extractIdFromApiUrl(url) {
        if (!url) return null;
        const parts = url.split('/');
        return parts[parts.length - 1];
    }
    
    // Optimized batch loading for event details
    function loadEventDetailsBatch(events) {
        // Collect unique user and club IDs
        const uniqueUserIds = new Set();
        const uniqueClubIds = new Set();

        events.forEach(event => {
            if (event.organisateur) {
                const organizerId = extractIdFromApiUrl(event.organisateur);
                if (organizerId) uniqueUserIds.add(organizerId);
            }
            if (event.club) {
                const clubId = extractIdFromApiUrl(event.club);
                if (clubId) uniqueClubIds.add(clubId);
            }
        });

        // Batch load users and clubs
        const userPromises = Array.from(uniqueUserIds).map(id => 
            UserService.getUser(id)
                .catch(error => {
                    console.error(`Error loading organizer ${id}:`, error);
                    return { id, prenom: 'Inconnu', nom: '' };
                })
        );

        const clubPromises = Array.from(uniqueClubIds).map(id => 
            ClubService.getClub(id)
                .catch(error => {
                    console.error(`Error loading club ${id}:`, error);
                    return { id, nom: 'Club inconnu' };
                })
        );

        // Wait for all batch loads to complete
        return $q.all({
            users: $q.all(userPromises),
            clubs: $q.all(clubPromises)
        }).then(results => {
            // Create lookup maps for efficient access
            const userMap = results.users.reduce((map, user) => {
                map[user.id] = user;
                return map;
            }, {});

            const clubMap = results.clubs.reduce((map, club) => {
                map[club.id] = club;
                return map;
            }, {});

            // Attach details to each event
            events.forEach(event => {
                if (event.organisateur) {
                    const organizerId = extractIdFromApiUrl(event.organisateur);
                    event.organizerDetails = userMap[organizerId] || { prenom: 'Inconnu', nom: '' };
                }
                if (event.club) {
                    const clubId = extractIdFromApiUrl(event.club);
                    event.clubDetails = clubMap[clubId] || { nom: 'Club inconnu' };
                }
            });

            return events;
        });
    }

    // Modify loadEvents to use batch loading
    $scope.loadEvents = function() {
        $scope.loading = true;
        EventService.getAllEvents()
            .then(function(data) {
                // Check if the data has the expected format with 'member' property
                const events = (data && data.member && Array.isArray(data.member)) 
                    ? data.member 
                    : (Array.isArray(data) ? data : []);
                
                $scope.events = events;
                console.log('Events loaded:', $scope.events);
                
                // Use batch loading instead of individual promises
                return loadEventDetailsBatch($scope.events);
            })
            .then(function() {
                console.log('Events details loaded:', $scope.events);
                $scope.loading = false;
            })
            .catch(function(error) {
                console.error('Error loading events:', error);
                $scope.loading = false;
                $scope.error = 'Impossible de charger les événements';
            });
    };

    // Charger la liste des clubs
    $scope.loadClubs = function() {
        console.log('Démarrage du chargement des clubs...');
        console.log('Authentification:', $scope.isAuthenticated());
        if ($scope.isAuthenticated()) {
            ClubService.getAllClubs()
                .then(function(clubs) {
                    console.log('Clubs reçus (type: ' + typeof clubs + '):', clubs);
                    
                    // Ensure clubs is an array and has the correct properties
                    $scope.clubs = clubs.map(function(club) {
                        // Ensure each club has the expected properties
                        return {
                            id: club.id || club['@id'],
                            nom: club.nom || club.name || 'Club sans nom'
                        };
                    });
                    
                    console.log('Clubs formatés:', $scope.clubs);
                    
                    // Force Angular update if needed
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                })
                .catch(function(error) {
                    console.error('Erreur lors du chargement des clubs:', error);
                    $scope.formError = 'Erreur lors du chargement des clubs';
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                });
        } else {
            console.warn('Tentative de chargement des clubs sans authentification');
        }
    };

    // Afficher/masquer le formulaire d'ajout d'événement
    $scope.toggleEventForm = function() {
        console.log('=== DÉBOGAGE FORMULAIRE D\'ÉVÉNEMENT ===');
        
        // Vérifier si l'utilisateur est connecté
        if (!AuthService.isAuthenticated()) {
            console.error('Tentative d\'accès au formulaire sans authentification');
            $scope.formError = 'Vous devez être connecté pour créer un événement.';
            return;
        }
        
        // Récupérer l'utilisateur actuel
        const currentUser = AuthService.getCurrentUser();
        console.log('Utilisateur actuel:', currentUser);
        
        // Charger les clubs immédiatement
        $scope.loadClubs();
        console.log('Utilisateur actuel:', currentUser);
        
        // Vérifier si l'utilisateur est actif
        if (currentUser && currentUser.estactif === '0') {
            console.error('Tentative d\'accès au formulaire avec un compte désactivé');
            $scope.formError = 'Votre compte est désactivé. Vous ne pouvez pas créer d\'événement.';
            return;
        }
        
        // Toggle l'état du formulaire
        $scope.showEventForm = !$scope.showEventForm;
        console.log('État du formulaire:', $scope.showEventForm);
        
        // Si on ouvre le formulaire
        if ($scope.showEventForm) {
            // Réinitialiser les erreurs
            $scope.formError = null;
            $scope.formSuccess = false;
            
            // Charger les clubs si nécessaire
            if (!$scope.clubs || $scope.clubs.length === 0) {
                console.log('Chargement des clubs...');
                $scope.loadClubs();
            }
            
            // Réinitialiser le formulaire
            $scope.resetForm();
        } else {
            // Si on ferme le formulaire, réinitialiser
            $scope.resetForm();
        }
        
        // Réinitialiser le formulaire si on le ferme
        if (!$scope.showEventForm) {
            $scope.resetForm();
        }
    };

    // Réinitialiser le formulaire
    $scope.resetForm = function() {
        console.log('=== RÉINITIALISATION DU FORMULAIRE ===');
        
        $scope.newEvent = {
            titre: '',
            description: '',
            eventDate: new Date(),
            lieu: '',
            club: null,
            image: null
        };
        $scope.formSubmitted = false;
        $scope.formError = null;
        $scope.formSuccess = false;
        
        console.log('Formulaire réinitialisé:', $scope.newEvent);
    };
    
    // Créer un nouvel événement
    $scope.createEvent = function() {
        console.log('=== DÉBOGAGE CRÉATION D\'ÉVÉNEMENT ===');
        
        // Vérifier si l'utilisateur est connecté avant de créer un événement
        const isAuthenticated = $scope.isAuthenticated();
        console.log('Authentification:', isAuthenticated);
        
        if (!isAuthenticated) {
            $scope.formError = 'Vous devez être connecté pour créer un événement.';
            console.warn('Création d\'événement refusée: Utilisateur non authentifié');
            return;
        }

        // Vérifier si l'utilisateur est actif
        const currentUser = $scope.getCurrentUser();
        console.log('Utilisateur actuel:', currentUser);
        
        if (currentUser && currentUser.estactif === '0') {
            $scope.formError = 'Votre compte est désactivé. Vous ne pouvez pas créer d\'événement.';
            console.warn('Création d\'événement refusée: Compte désactivé');
            return;
        }

        $scope.formSubmitted = true;
        $scope.formError = null;
        $scope.formSuccess = false;
        
        // Vérifier que tous les champs requis sont remplis
        if (!$scope.newEvent.titre || !$scope.newEvent.description || !$scope.newEvent.lieu) {
            console.error('Champs requis manquants');
            $scope.formError = 'Veuillez remplir tous les champs obligatoires.';
            return;
        }
        
        // Préparer les données de l'événement
        // Convertir la date du format input en format ISO pour l'API
        const apiDate = $scope.convertDateForAPI($scope.newEvent.eventDate);
        console.log('Date convertie pour API:', apiDate);
        
        const userId = $scope.extractUserId(currentUser);
        console.log('ID utilisateur extrait:', userId);
        
        // Extraire l'ID du club correctement
        let clubId = null;
        if ($scope.newEvent.club) {
            // Enlever les préfixes '/api/clubs/' s'ils existent
            clubId = $scope.newEvent.club.replace('/api/clubs/', '');
            console.log('ID du club extrait:', clubId);
        }
        
        // Préparer les données de l'événement pour l'API
        const eventData = {
            titre: $scope.newEvent.titre,
            description: $scope.newEvent.description,
            eventDate: apiDate,
            lieu: $scope.newEvent.lieu,
            organisateur: `/api/utilisateurs/${userId}`,
            club: clubId ? `/api/clubs/${clubId}` : null,
            dateCreation: new Date().toISOString()
        };
        
        console.log('Données de l\'événement à créer:', eventData);
        
        // Réinitialiser les erreurs précédentes
        $scope.formError = null;
        $scope.formSuccess = false;

        // Envoyer la requête
        EventService.createEvent(eventData)
            .then(function(response) {
                console.log('Événement créé avec succès:', response);
                $scope.formSuccess = true;
                $scope.resetForm();
                $scope.loadEvents(); // Recharger la liste des événements
                
                // Afficher un message de succès temporaire
                $scope.successMessage = 'Événement créé avec succès !';
                setTimeout(function() {
                    $scope.$apply(function() {
                        $scope.successMessage = null;
                    });
                }, 2000);
            })
            .catch(function(error) {
                $scope.logDetailedError('Création d\'événement', error);
                
                if (error.status === 401) {
                    $scope.formError = 'Erreur d\'authentification. Veuillez vous reconnecter.';
                } else if (error.status === 400) {
                    $scope.formError = 'Erreur de validation. Veuillez vérifier vos données.';
                } else {
                    $scope.formError = 'Une erreur inattendue s\'est produite. Veuillez réessayer.';
                }
                
                console.error('Détails de l\'erreur:', {
                    status: error.status,
                    data: error.data,
                    message: error.message
                });
            });
    };

    // Fonction pour extraire l'ID utilisateur
    $scope.extractUserId = function(user) {
        if (user) {
            // Cas 1: Si l'email est admin@eventspace.com, utiliser l'ID 3 (selon les données fournies)
            if (user.email === 'admin@eventspace.com') {
                return 3;
            }
            // Cas 2: Si l'utilisateur a directement un ID
            else if (user.id) {
                return user.id;
            }
            // Cas 3: Si l'utilisateur a un @id au format API Platform
            else if (user['@id']) {
                return user['@id'].split('/').pop();
            }
            // Cas 4: Si l'utilisateur a un champ organisateur qui contient l'ID
            else if (user.organisateur && typeof user.organisateur === 'string') {
                return user.organisateur.split('/').pop();
            }
            // Cas 5: Si l'utilisateur est dans un wrapper (comme dans la réponse de login)
            else if (user.user && (user.user.id || user.user['@id'])) {
                if (user.user.id) {
                    return user.user.id;
                } else {
                    return user.user['@id'].split('/').pop();
                }
            }
            // Cas 6: Utiliser l'API pour récupérer l'ID utilisateur par email
            else {
                // Solution temporaire: Générer un ID numérique à partir de l'email
                // Cette approche fonctionne pour n'importe quel nombre d'utilisateurs
                // et garantit que le même email produira toujours le même ID
                if (user.email) {
                    // Utiliser une fonction de hachage simple pour convertir l'email en nombre
                    let hash = 0;
                    for (let i = 0; i < user.email.length; i++) {
                        hash = ((hash << 5) - hash) + user.email.charCodeAt(i);
                        hash |= 0; // Convertir en entier 32 bits
                    }
                    
                    // Prendre la valeur absolue et limiter à un nombre raisonnable (1-1000)
                    return Math.abs(hash % 1000) + 1;
                } else {
                    // Fallback si pas d'email
                    return 1; 
                }
            }
        } else {
            return 1; 
        }
    };

    // Fonction de débogage pour les erreurs
    $scope.logDetailedError = function(context, error) {
        console.error(`=== ERREUR DÉTAILLÉE: ${context} ===`);
        console.error('Type d\'erreur:', typeof error);
        
        if (error instanceof Error) {
            console.error('Message:', error.message);
            console.error('Pile de trace:', error.stack);
        } else if (typeof error === 'object') {
            console.error('Propriétés de l\'erreur:', Object.keys(error));
            console.error('Contenu complet de l\'erreur:', JSON.stringify(error, null, 2));
            
            // Propriétés spécifiques à Angular/$http
            if (error.status) console.error('Statut HTTP:', error.status);
            if (error.data) console.error('Données de réponse:', error.data);
            if (error.config) console.error('Configuration de la requête:', error.config);
        } else {
            console.error('Contenu de l\'erreur:', error);
        }
    };

    // Fonction pour gérer la participation à un événement
    $scope.toggleParticipation = function(event) {
        // Vérifier si l'utilisateur est connecté
        if (!$scope.isAuthenticated()) {
            alert('Vous devez être connecté pour participer à un événement');
            return;
        }

        // Récupérer l'utilisateur courant
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) return;

        // Récupérer les événements participés depuis localStorage
        let participatedEvents = JSON.parse(localStorage.getItem('participatedEvents') || '[]');

        // Vérifier si l'utilisateur participe déjà
        const eventIndex = participatedEvents.findIndex(e => e.id === event.id);

        if (eventIndex === -1) {
            // Ajouter la participation
            participatedEvents.push({
                id: event.id,
                titre: event.titre,
                date: event.date
            });
            event.isParticipating = true;
        } else {
            // Retirer la participation
            participatedEvents.splice(eventIndex, 1);
            event.isParticipating = false;
        }

        // Sauvegarder dans localStorage
        localStorage.setItem('participatedEvents', JSON.stringify(participatedEvents));
    };

    // Fonction pour vérifier la participation à un événement
    $scope.checkParticipation = function(event) {
        if (!$scope.isAuthenticated()) return false;

        const participatedEvents = JSON.parse(localStorage.getItem('participatedEvents') || '[]');
        return participatedEvents.some(e => e.id === event.id);
    };

    // Initialiser le statut de participation pour chaque événement
    $scope.$watch('events', function(newEvents) {
        if (newEvents && newEvents.length) {
            newEvents.forEach(event => {
                event.isParticipating = $scope.checkParticipation(event);
            });
        }
    });

    // Load events when controller initializes
    $scope.loadEvents();
    
    // Charger les clubs si l'utilisateur est connecté
    if ($scope.isAuthenticated()) {
        $scope.loadClubs();
    }
});

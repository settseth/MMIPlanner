angular.module('MMIPlanner')
.controller('EventDetailController', function($scope, $routeParams, $filter, $q, $location, EventService, AuthService, UserService, ClubService, CommentService) {
    $scope.event = null;
    $scope.organizer = null;
    $scope.club = null;
    $scope.comments = [];
    $scope.loading = true;
    $scope.error = null;
    $scope.newComment = {
        contenu: ''
    };
    
    // Vérifier si EventService est correctement injecté
    if (!EventService) {
        $scope.error = 'Erreur système : Service EventService non chargé';
        $scope.loading = false;
        return;
    }
    
    // Get event ID from route parameters
    const eventId = $routeParams.id;
    
    // Fonction pour charger les détails de l'événement
    $scope.loadEventDetails = function() {
        $scope.loading = true;
        
        // Ajouter une gestion d'erreur robuste
        EventService.getEvent(eventId)
            .then(function(data) {
                $scope.event = data;
                
                // Vérification immédiate des permissions
                $scope.userCanModifyEvent = $scope.canModifyEvent();
                
                // Créer un tableau pour stocker toutes les promesses
                const promises = [];
                
                // Charger les informations de l'organisateur si disponibles
                if ($scope.event.organisateur && typeof $scope.event.organisateur === 'string') {
                    // Extraire l'ID de l'URL (ex: "/api/utilisateurs/1" -> "1")
                    const organizerId = $scope.event.organisateur.split('/').pop();
                    promises.push(loadOrganizer(organizerId));
                }
                
                // Charger les informations du club si disponibles
                if ($scope.event.club && typeof $scope.event.club === 'string') {
                    // Extraire l'ID de l'URL (ex: "/api/clubs/5" -> "5")
                    const clubId = $scope.event.club.split('/').pop();
                    promises.push(loadClub(clubId));
                }
                
                // Charger les commentaires si disponibles
                if ($scope.event.commentaires && Array.isArray($scope.event.commentaires)) {
                    promises.push(loadComments($scope.event.commentaires));
                }
                
                // Attendre que toutes les promesses soient résolues
                return $q.all(promises);
            })
            .then(function() {
                $scope.loading = false;
                
                // Vérification finale des permissions
                $scope.userCanModifyEvent = $scope.canModifyEvent();
            })
            .catch(function(error) {
                $scope.error = 'Impossible de charger les détails de l\'événement : ' + (error.message || 'Erreur inconnue');
                $scope.loading = false;
            });
    };
    
    // Function to load organizer details
    function loadOrganizer(organizerId) {
        return UserService.getUser(organizerId)
            .then(function(user) {
                $scope.organizer = user;
                return user;
            })
            .catch(function(error) {
                // Fallback to dummy data if API fails
                $scope.organizer = {
                    id: organizerId,
                    prenom: 'Prénom Organisateur',
                    nom: 'Nom Organisateur',
                    email: 'organisateur@example.com'
                };
                return $scope.organizer;
            });
    }
    
    // Function to load club details
    function loadClub(clubId) {
        return ClubService.getClub(clubId)
            .then(function(club) {
                $scope.club = club;
                return club;
            })
            .catch(function(error) {
                // Fallback to dummy data if API fails
                $scope.club = {
                    id: clubId,
                    nom: 'Nom du Club',
                    description: 'Description du club associé à cet événement.'
                };
                return $scope.club;
            });
    }
    
    // Function to load comments
    function loadComments(commentUrls) {
        if (!commentUrls || commentUrls.length === 0) {
            $scope.comments = [];
            return $q.resolve([]);
        }
        
        const commentPromises = commentUrls.map(function(url) {
            const commentId = url.split('/').pop();
            return CommentService.getComment(commentId)
                .then(function(comment) {
                    // Check if the comment has an author reference
                    if (comment.auteur && typeof comment.auteur === 'string') {
                        // Extract author ID from URL (e.g., "/api/utilisateurs/1" -> "1")
                        const authorId = comment.auteur.split('/').pop();
                        
                        // Load author details
                        return UserService.getUser(authorId)
                            .then(function(author) {
                                // Replace the author URL with the actual author object
                                comment.auteur = author;
                                return comment;
                            })
                            .catch(function(error) {
                                // Keep the URL but add a placeholder author object
                                comment.auteur = {
                                    id: authorId,
                                    prenom: 'Utilisateur',
                                    nom: authorId,
                                    _url: comment.auteur // Keep the original URL for reference
                                };
                                return comment;
                            });
                    }
                    
                    // If there's no author or it's already an object, return the comment as is
                    return comment;
                })
                .catch(function(error) {
                    // Return a placeholder comment if loading fails
                    return {
                        id: commentId,
                        contenu: 'Commentaire non disponible',
                        dateCreation: new Date().toISOString(),
                        auteur: {
                            prenom: 'Utilisateur',
                            nom: 'Inconnu'
                        }
                    };
                });
        });
        
        return $q.all(commentPromises)
            .then(function(comments) {
                $scope.comments = comments;
                return comments;
            });
    }
    
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
        return `${parts.year}-${parts.month}-${parts.day}T${parts.hours}:${parts.minutes}`;
    };
    
    // Convertir la date du format input en format ISO pour l'API
    $scope.convertDateForAPI = function(inputDate) {
        if (!inputDate) return null;
        
        // Convertir la date du format input (YYYY-MM-DDTHH:mm) en objet Date
        const date = new Date(inputDate);
        
        // Retourner la date au format ISO
        return date.toISOString();
    };
    
    // Check if user is authenticated
    $scope.isAuthenticated = function() {
        return AuthService.isAuthenticated();
    };
    
    // Add a new comment
    $scope.addComment = function() {
        if (!$scope.newComment.contenu.trim()) {
            return;
        }
        
        // Récupérer l'utilisateur courant
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) {
            alert('Vous devez être connecté pour ajouter un commentaire');
            return;
        }

        // Vérifier si l'utilisateur est actif
        if (currentUser.estactif === '0') {
            alert('Votre compte est désactivé. Vous ne pouvez pas ajouter de commentaire.');
            return;
        }
        
        // Vérifier que l'utilisateur a un email
        if (!currentUser.email) {
            alert('Erreur: Impossible de récupérer vos informations utilisateur');
            $scope.isAddingComment = false;
            return;
        }
        
        // Si l'utilisateur n'a pas d'ID, on utilise son email pour le retrouver
        // Dans un système réel, on devrait faire une requête pour obtenir l'ID à partir de l'email
        // Mais pour simplifier, on va utiliser l'email comme identifiant
        
        // Log de l'utilisateur courant pour débogage
        
        // Vérifier que l'ID de l'événement est un nombre
        const eventIdNum = parseInt(eventId, 10);
        if (isNaN(eventIdNum)) {
            alert('Erreur: ID de l\'événement invalide');
            $scope.isAddingComment = false;
            return;
        }
        
        // Afficher un indicateur de chargement
        $scope.isAddingComment = true;
        
        // Récupérer l'ID de l'utilisateur à partir de son email
        UserService.getUserByEmail(currentUser.email)
            .then(function(userData) {
                
                if (!userData || !userData.id) {
                    throw new Error('Impossible de récupérer l\'ID de l\'utilisateur');
                }
                
                // Construire les IRIs (URLs de référence) correctement
                const evenementIRI = `/api/evenements/${eventIdNum}`;
                const auteurIRI = `/api/utilisateurs/${userData.id}`;
                
                const commentData = {
                    '@context': '/api/contexts/Commentaire',
                    '@type': 'Commentaire',
                    'contenu': $scope.newComment.contenu,
                    'evenement': evenementIRI,
                    'auteur': auteurIRI,
                    'dateCreation': new Date().toISOString()
                };
                
                // Envoyer le commentaire
                return CommentService.addComment(eventId, commentData);
            })
            .then(function(response) {
                // Add the new comment to the list
                const newComment = {
                    id: response.id || $scope.comments.length + 1,
                    contenu: $scope.newComment.contenu,
                    dateCreation: new Date().toISOString(),
                    auteur: currentUser
                };
                
                $scope.comments.unshift(newComment);
                $scope.newComment.contenu = '';
            })
            .catch(function(error) {
                // Afficher un message d'erreur plus détaillé
                let errorMessage = 'Erreur lors de l\'ajout du commentaire';
                if (error.status === 401) {
                    errorMessage = 'Vous devez être connecté pour ajouter un commentaire';
                } else if (error.status === 400) {
                    errorMessage = 'Données invalides. Veuillez vérifier votre commentaire';
                } else if (error.status === 403) {
                    errorMessage = 'Vous n\'avez pas les droits pour ajouter un commentaire';
                }
                alert(errorMessage);
            })
            .finally(function() {
                // Cacher l'indicateur de chargement
                $scope.isAddingComment = false;
            });
    };
    
    // Delete a comment
    $scope.deleteComment = function(comment) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
            return;
        }
        
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) {
            alert('Vous devez être connecté pour supprimer un commentaire');
            return;
        }
        
        // Check if the current user is the author of the comment or an admin
        const isAuthor = comment.auteur && comment.auteur.id === currentUser.id;
        const isAdmin = currentUser.roles && currentUser.roles.includes('ROLE_ADMIN');
        
        if (!isAuthor && !isAdmin) {
            alert('Vous ne pouvez pas supprimer ce commentaire');
            return;
        }
        
        CommentService.deleteComment(comment.id)
            .then(function() {
                // Remove the comment from the list
                const index = $scope.comments.findIndex(c => c.id === comment.id);
                if (index !== -1) {
                    $scope.comments.splice(index, 1);
                }
            })
            .catch(function(error) {
                alert('Erreur lors de la suppression du commentaire');
            });
    };
    
    // Check if the current user can delete a comment
    $scope.canDeleteComment = function(comment) {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) {
            return false;
        }
        
        // User can delete if they are the author or an admin
        const isAuthor = comment.auteur && comment.auteur.id === currentUser.id;
        const isAdmin = currentUser.roles && currentUser.roles.includes('ROLE_ADMIN');
        
        return isAuthor || isAdmin;
    };
    
    // Check if user is authenticated
    $scope.isAuthenticated = function() {
        return AuthService.isAuthenticated();
    };
    
    // Vérifier si l'utilisateur peut modifier l'événement
    $scope.canModifyEvent = function() {
        // Récupérer l'utilisateur actuel
        const currentUser = AuthService.getCurrentUser();
        
        // Vérification des conditions de base
        if (!currentUser) {
            return false;
        }
        
        // Gérer différentes structures possibles de l'objet utilisateur
        const userObject = currentUser.user || currentUser;
        
        if (!userObject) {
            return false;
        }
        
        // Vérifier les rôles
        const roles = userObject.roles || userObject.role || [];
        
        const isAdmin = roles.includes('ROLE_ADMIN');
        
        if (isAdmin) {
            return true;
        }
        
        // Vérifier l'ID de l'utilisateur
        const currentUserId = userObject.id || 
            userObject.userId || 
            (userObject['@id'] ? 
                userObject['@id'].split('/').pop() : 
                null);
        
        if (!$scope.event || !$scope.event.organisateur) {
            return false;
        }
        
        const organizerId = $scope.event.organisateur.split('/').pop();
        
        const canModify = currentUserId === organizerId;
        
        return canModify;
    };
    
    // Préparer le formulaire de modification d'événement
    $scope.prepareEditEvent = function() {
        if (!$scope.canModifyEvent()) {
            alert('Vous n\'avez pas la permission de modifier cet événement.');
            return;
        }
        
        $scope.editingEvent = { ...($scope.event || {}) };
        $scope.isEditingEvent = true;
    };
    
    // Annuler la modification de l'événement
    $scope.cancelEditEvent = function() {
        $scope.isEditingEvent = false;
        $scope.editingEvent = null;
    };
    
    // Sauvegarder les modifications de l'événement
    $scope.saveEventChanges = function() {
        if (!$scope.canModifyEvent()) {
            alert('Vous n\'avez pas la permission de modifier cet événement.');
            return;
        }
        
        // Préparer les données de l'événement
        const eventData = {
            titre: $scope.editingEvent.titre,
            description: $scope.editingEvent.description,
            date: $scope.editingEvent.date,
            lieu: $scope.editingEvent.lieu,
            club: $scope.editingEvent.club || null,
            image: $scope.editingEvent.image || null
        };
        
        EventService.updateEvent(eventId, eventData)
            .then(function(updatedEvent) {
                alert('Événement mis à jour avec succès !');
                // Forcer le rechargement de la page pour obtenir les données à jour
                window.location.reload();
            })
            .catch(function(error) {
                alert('Impossible de mettre à jour l\'événement : ' + (error.message || 'Erreur inconnue'));
            });
    };
    
    // Supprimer l'événement
    $scope.deleteEvent = function() {
        if (!$scope.canModifyEvent()) {
            alert('Vous n\'avez pas la permission de supprimer cet événement.');
            return;
        }
        
        // Confirmer la suppression
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible.')) {
            return;
        }
        
        EventService.deleteEvent(eventId)
            .then(function() {
                alert('Événement supprimé avec succès !');
                // Rediriger vers la liste des événements et forcer le rechargement
                window.location.href = '#!/events';
            })
            .catch(function(error) {
                alert('Impossible de supprimer l\'événement : ' + (error.message || 'Erreur inconnue'));
            });
    };
    
    // Vérifier si l'utilisateur est authentifié
    $scope.isAuthenticated = function() {
        return AuthService.isAuthenticated();
    };

    // Fonction pour basculer la participation à un événement
    $scope.toggleParticipation = function(event) {
        if (!$scope.isAuthenticated()) {
            // Rediriger vers la page de connexion si non authentifié
            $location.path('/login');
            return;
        }

        // Récupérer les événements participés depuis localStorage
        let participatedEvents = JSON.parse(localStorage.getItem('participatedEvents') || '[]');
        const eventIndex = participatedEvents.findIndex(e => e.id === event.id);
        
        if (eventIndex !== -1) {
            // Retirer l'événement si déjà participé
            participatedEvents.splice(eventIndex, 1);
            event.isParticipating = false;
        } else {
            // Ajouter l'événement si non participé
            participatedEvents.push({
                id: event.id,
                titre: event.titre,
                date: event.date,
                lieu: event.lieu,
                description: event.description
            });
            event.isParticipating = true;
        }

        // Mettre à jour localStorage
        localStorage.setItem('participatedEvents', JSON.stringify(participatedEvents));
    };
    
    // Load event details when controller initializes
    $scope.loadEventDetails();
});

# MMIPlanner

MMI Planner est une application de gestion d'événement pour les MMI de l'IUT de Vélizy.

Comment y accéder? -> event.space.adnelly.carre.mmi-velizy.fr

Il est possible de : 
 * S'inscire
 * Se connecter

 * D'accèder à l'espace évènement
 * De créer un evenement / Le supprimer si on est auteur ou admin
 * De créer un commentaire / le supprimer si on est auteur ou admin
 * De s'inscire à un evenement / se désinscrire

Si on est admin : 
 * Désactiver un membre -> il ne peut créer/modifier/supprimer un evenement ni de commentaire
 * D'avoir accès à l'Admin Pannel



Pour avoir accès à l'application en local, il faut modifier dans les fichiers présents dans les services l'url d'accès :   
const API_URL = 'http://localhost:8000/api';
par votre port MAMP/XAMP

Admin : admin@eventspace.com ; admin123

User : adnelly.c@eventspace.com : test123

L'api est au format .zip puisque le fichier était trop gros pour github en une seule fois. 


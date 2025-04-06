angular.module('MMIPlanner').controller('ClubController', function($scope, $sce, $window) {
    $scope.clubs = [
        {
            nom: "Club VR",
            description: "Dirigé(e)s par Sofia Koukoulakou et Adnelly Carré.",
            bio: $sce.trustAsHtml("Le Club VR offre aux étudiants l'opportunité d'explorer les technologies immersives de la réalité virtuelle à travers des projets innovants.<br><br>Dirigé par Sofia Koukoulakou, professeure spécialisée en réalité virtuelle et en modélisation 3D sur Blender, elle mettra à profit son expertise pour vous aider à repousser les limites du réel.<br><br>Elle sera accompagnée de Adnelly Carré, étudiante en deuxième année de MMI, parcours Développement web et dispositifs interactifs. En tant qu’étudiante elle-même, elle saura vous guider dans votre apprentissage et vous aider à mieux comprendre l'univers du virtuel.<br> <br>Curieux d’en savoir plus sur la VR ? Rejoignez le Club VR et plongez dans un monde où l'imagination n'a pas de limites !"),
            expanded: false
        },
        {
            nom: "Club Cinéma",
            description: "Dirigé(e)s par Fred Pirat et Kawthar Mekouar.",
            bio: $sce.trustAsHtml("Le Club Cinéma est destiné à tous ceux qui souhaitent découvrir les coulisses de la réalisation cinématographique. Dirigé par Vincent Wable, technicien expérimenté en caméras et réglages, vous apprendrez à maîtriser les aspects techniques de la prise de vue.<br><br> Kawthar Mekouar, étudiante en MMI avec une année d’études en cinéma, vous guidera à travers l'histoire du cinéma et l'art de la narration visuelle.<br><br>Que vous soyez amateur ou curieux, rejoignez le club Cinéma pour explorer les bases du tournage, des angles de caméra à la composition des scènes. Un club pour tous les passionnés de cinéma !"),
            expanded: false
        },
        {
            nom: "Club Sport",
            description: "Dirigé(e)s par Julien Ramiro et Carole Seville.",
            bio: $sce.trustAsHtml("Le Club Sport est dirigé par Julien Ramio et Carole Seville, professeurs de sport passionnés par la santé et le bien-être physique. Ils vous accompagneront à travers diverses activités physiques, que ce soit pour un match de basket, une balade à pied à Vélizy, ou même des astuces pour lutter contre le stress.<br><br>Que vous soyez amateur ou curieux, rejoignez le club Sport pour participer à des activités variées et rester en forme !"),
            expanded: false
        },
        {
            nom: "Club Jeux Vidéo",
            description: "Dirigé(e)s par Xavier Hautbois et Mattheusz Glowaski.",
            bio: $sce.trustAsHtml("Le Club Jeux Vidéo est dirigé par Xavier Hautbois, professeur en dispositifs interactifs et expert en Unity, ainsi que Matheusz Glowaski, étudiant en MMI 2, spécialisé en développement web et dispositifs interactifs.<br><br> Ensemble, ils vous feront découvrir l'univers de la création de jeux vidéo, avec une expertise particulière sur Unity et C#.<br><br> Si vous avez toujours voulu savoir comment les jeux sont créés, rejoignez ce club pour apprendre à développer vos propres jeux vidéo. Que ce soit pour la programmation, la création de mondes virtuels ou l'intégration du son et de la musique, vous découvrirez de nombreuses facettes du développement de jeux vidéo !"),
            expanded: false
        }
    ];

    // Fonction pour afficher ou cacher la bio
    $scope.toggleBio = function(club) {
        club.expanded = !club.expanded;
    };


    // Fonction pour aller à la page d'authentification
    $scope.goToAuthPage = function() {
        $window.location.href = 'auth.html';  // Relatif à la structure de ton dossier
    };
});

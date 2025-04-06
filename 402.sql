-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost:8889
-- Généré le : dim. 06 avr. 2025 à 11:16
-- Version du serveur : 5.7.39
-- Version de PHP : 8.2.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `402`
--

-- --------------------------------------------------------

--
-- Structure de la table `club`
--

CREATE TABLE `club` (
  `id` int(11) NOT NULL,
  `nom` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_creation` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `club`
--

INSERT INTO `club` (`id`, `nom`, `description`, `image`, `date_creation`) VALUES
(5, 'Club de Football', 'Un club de football passionné', 'football.jpg', '2025-03-26 21:55:39'),
(6, 'Club de Basketball', 'Club de basketball dynamique', 'basketball.jpg', '2025-03-26 21:55:39');

-- --------------------------------------------------------

--
-- Structure de la table `commentaire`
--

CREATE TABLE `commentaire` (
  `id` int(11) NOT NULL,
  `evenement_id` int(11) NOT NULL,
  `auteur_id` int(11) NOT NULL,
  `club_id` int(11) DEFAULT NULL,
  `organisateur_id` int(11) DEFAULT NULL,
  `contenu` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_creation` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `commentaire`
--

INSERT INTO `commentaire` (`id`, `evenement_id`, `auteur_id`, `club_id`, `organisateur_id`, `contenu`, `date_creation`) VALUES
(2, 2, 2, 6, 2, 'Vraiment impressionnant!', '2025-03-26 21:55:42'),
(4, 1, 1, NULL, NULL, 'Test de commentaire', '2025-03-27 07:15:00'),
(9, 1, 1, NULL, NULL, 'qsdqsdjqsdjqsjdksqd', '2025-03-31 07:11:17');

-- --------------------------------------------------------

--
-- Structure de la table `doctrine_migration_versions`
--

CREATE TABLE `doctrine_migration_versions` (
  `version` varchar(191) COLLATE utf8_unicode_ci NOT NULL,
  `executed_at` datetime DEFAULT NULL,
  `execution_time` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Déchargement des données de la table `doctrine_migration_versions`
--

INSERT INTO `doctrine_migration_versions` (`version`, `executed_at`, `execution_time`) VALUES
('DoctrineMigrations\\Version20250326211214', '2025-03-26 21:12:31', 360),
('DoctrineMigrations\\Version20250326213127', '2025-03-26 21:32:06', 291);

-- --------------------------------------------------------

--
-- Structure de la table `evenement`
--

CREATE TABLE `evenement` (
  `id` int(11) NOT NULL,
  `titre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `lieu` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` datetime NOT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_creation` datetime NOT NULL,
  `club_id` int(11) NOT NULL,
  `organisateur_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `evenement`
--

INSERT INTO `evenement` (`id`, `titre`, `description`, `lieu`, `date`, `image`, `date_creation`, `club_id`, `organisateur_id`) VALUES
(1, 'Atelier Photo', 'Atelier de photographie pour débutants', 'Studio Créatif', '2025-03-31 10:50:00', 'photo_workshop.jpg', '2025-03-26 21:55:42', 5, 1),
(2, 'Exploration VR', 'Découverte des dernières technologies VR', 'Centre Technologique', '2025-05-26 21:55:42', 'vr_event.jpg', '2025-03-26 21:55:42', 6, 2),
(13, 'Jeu VR', 'Venez tester notre nouveau jeu VR!', 'AV3', '2025-04-06 10:45:40', NULL, '2025-04-06 10:45:40', 5, 1);

-- --------------------------------------------------------

--
-- Structure de la table `utilisateur`
--

CREATE TABLE `utilisateur` (
  `id` int(11) NOT NULL,
  `email` varchar(180) COLLATE utf8mb4_unicode_ci NOT NULL,
  `motdepasse` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `roles` json NOT NULL,
  `prenom` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nom` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estactif` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `utilisateur`
--

INSERT INTO `utilisateur` (`id`, `email`, `motdepasse`, `roles`, `prenom`, `nom`, `estactif`) VALUES
(1, 'photographe@example.com', '$2y$13$u77Dv2iZUgZDeWCJF4FZpe/GMlQX9OuB3AxXRKHSqEtFEfe6r7nA2', '[\"ROLE_USER\"]', 'Jean', 'Dupont', '1'),
(2, 'vr_expert@example.com', '$2y$13$85MDqc/kG7jQsjm6P.XLyu360zql3t33AkIMAaZVsdaN0yHpZBes6', '[\"ROLE_USER\"]', 'Marie', 'Durand', '1'),
(3, 'admin@eventspace.com', '$2y$13$5ftqHrYPB6Qcg8r5IjfNIe24FvNRE8hg4yp.dzv8DOlYDbBMcA6Ku', '[\"ROLE_ADMIN\", \"ROLE_USER\"]', 'Admin', 'EventSpace', '1'),
(4, 'adnelly.c@eventspace.com', '$2y$13$iTe0urKQsgB7BY/rSvill.VnddUHOwijjjiQxuIJnYyeUZ3JaxsJu', '[\"ROLE_USER\"]', 'Adnelly', 'Carré', '1');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `club`
--
ALTER TABLE `club`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `commentaire`
--
ALTER TABLE `commentaire`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_67F068BCFD02F13` (`evenement_id`),
  ADD KEY `IDX_67F068BC60BB6FE6` (`auteur_id`),
  ADD KEY `IDX_67F068BC61190A32` (`club_id`),
  ADD KEY `IDX_67F068BCD936B2FA` (`organisateur_id`);

--
-- Index pour la table `doctrine_migration_versions`
--
ALTER TABLE `doctrine_migration_versions`
  ADD PRIMARY KEY (`version`);

--
-- Index pour la table `evenement`
--
ALTER TABLE `evenement`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_B26681E61190A32` (`club_id`),
  ADD KEY `IDX_B26681ED936B2FA` (`organisateur_id`);

--
-- Index pour la table `utilisateur`
--
ALTER TABLE `utilisateur`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UNIQ_1D1C63B3E7927C74` (`email`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `club`
--
ALTER TABLE `club`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT pour la table `commentaire`
--
ALTER TABLE `commentaire`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT pour la table `evenement`
--
ALTER TABLE `evenement`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT pour la table `utilisateur`
--
ALTER TABLE `utilisateur`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `commentaire`
--
ALTER TABLE `commentaire`
  ADD CONSTRAINT `FK_67F068BC60BB6FE6` FOREIGN KEY (`auteur_id`) REFERENCES `utilisateur` (`id`),
  ADD CONSTRAINT `FK_67F068BC61190A32` FOREIGN KEY (`club_id`) REFERENCES `club` (`id`),
  ADD CONSTRAINT `FK_67F068BCD936B2FA` FOREIGN KEY (`organisateur_id`) REFERENCES `utilisateur` (`id`),
  ADD CONSTRAINT `FK_67F068BCFD02F13` FOREIGN KEY (`evenement_id`) REFERENCES `evenement` (`id`);

--
-- Contraintes pour la table `evenement`
--
ALTER TABLE `evenement`
  ADD CONSTRAINT `FK_B26681E61190A32` FOREIGN KEY (`club_id`) REFERENCES `club` (`id`),
  ADD CONSTRAINT `FK_B26681ED936B2FA` FOREIGN KEY (`organisateur_id`) REFERENCES `utilisateur` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

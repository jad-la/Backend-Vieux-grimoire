# Mon Vieux Grimoire Backend

Mon Vieux Grimoire Backend est la partie serveur de l'application Mon Vieux Grimoire. Il fournit une API pour gérer les opérations liées aux livres.
Objectif : Créer un site web de référencement et de notation de livres pour une chaîne de librairies, offrant aux utilisateurs la possibilité de découvrir de nouveaux livres, d'ajouter des livres à la base de données et de partager leurs avis via un système de notation.

## Installation

1. Clonez ce référentiel sur votre machine locale.
2. Assurez-vous d'avoir Node.js installé.
3. Exécutez `npm install` pour installer toutes les dépendances nécessaires.
4. Exécutez `npm start` pour démarrer le serveur backend.

## Utilisation

- Vous pouvez maintenant développer ou tester l'application frontend en utilisant cette API backend.

## Structure du projet

- Le fichier `app.js` est le point d'entrée du serveur backend.
- Le dossier `routes` contient les fichiers de définition des routes pour les livres, les utilisateurs.
- Le dossier `models` contient les modèles de données pour les livres, les utilisateurs.
- Le dossier `controllers` contient les fichiers de contrôleurs qui définissent la logique métier.
- Le dossier `middlewares` contient les middlewares utilisés pour des fonctionnalités telles que l'authentification, le traitement des fichiers, la validation des données.

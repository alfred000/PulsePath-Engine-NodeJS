# PulsePath Engine - Moteur Logique & API REST 🚀

Bienvenue sur le dépôt Back-End JavaScript de **PulsePath Engine**, un système expert prescriptif d'aide à la décision métabolique. Ce moteur calcule, ajuste et corrige dynamiquement les trajectoires énergétiques des utilisateurs sous contraintes physiologiques strictes.

## 🏗️ Architecture & Stack Technique
Ce service a été développé selon une approche modulaire et découplée, en respectant les principes de la Clean Architecture appliqués à l'écosystème Node.js :
* **Runtime** : Node.js (ES6+ / JavaScript Asynchrone)
* **Framework Web** : Express.js
* **Base de Données** : SQLite (Gestion asynchrone via `sqlite3` et requêtes paramétrées)
* **Sécurité & Auth** : Authentification par jetons JWT (`jsonwebtoken`) et hachage des mots de passe via `bcrypt`
* **Tests Unitaires** : Suite de tests automatisée avec Jest (Méthodologie TDD)

## 🛠️ Règles Métier Embarquées & TDD
L'intégralité de la logique algorithmique a été blindée en amont par des tests unitaires (Jest) pour garantir la sécurité métabolique :
* **RM-COR-01 (Moteur de Rattrapage Intelligent)** : Implémentation asynchrone d'un algorithme inspiré du Contrôle Prédictif (MPC) répartissant l'effort sur 7 jours (40% Alimentation / 60% Activité) avec blocage de sécurité au seuil du BMR.
* **RM-AUTH-01 & RM-GOAL-01** : Validation stricte des données d'entrée et isolation des profils utilisateurs par rapport au contexte de session JWT.

## 🕸️ Écosystème du Projet (Toile d'Araignée)
Ce dépôt fait partie d'un triptyque interconnecté simulant un cycle SDLC complet :
* 📊 **[PulsePath-Analyse-Metier](https://github.com/alfred000/PulsePath-Engine-BA-Case-Study)** : Cadrage, processus BPMN, Backlog MoSCoW et User Stories.
* 💻 **[PulsePath-Engine-NodeAPI](https://github.com/alfred000/PulsePath-Engine-NodeJS)** : *Vous êtes ici* — Moteur logique Node.js, base SQLite et API REST.
* 🎨 **[PulsePath-Web-Angular](https://github.com/alfred000/PulsePath-Web-Angular)** : Interface client de calcul et tableau de bord dynamique à 3 blocs.


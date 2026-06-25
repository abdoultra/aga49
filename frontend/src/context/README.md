# Context

`AuthProvider` contient l’état de session administrateur :

- administrateur connecté ;
- vérification initiale du JWT ;
- connexion ;
- déconnexion ;
- réaction à un JWT expiré.

Le contexte est séparé dans `authContextObject.js` afin de respecter la règle
de rechargement rapide de React.

Les composants lisent ce contexte avec le hook `useAuth()`.

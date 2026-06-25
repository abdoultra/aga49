# Services

`api.js` crée une seule instance Axios pour toute l’application.

Avantages :

- l’URL de base n’est écrite qu’une fois ;
- le délai maximal est commun ;
- les erreurs backend sont transformées en messages JavaScript simples ;
- le JWT pourra plus tard être ajouté dans un intercepteur.

`publicService.js` contient les appels publics. Une page ne construit donc pas
elle-même les URLs HTTP : elle demande au service de récupérer les données.

`publicationService.js` utilise `FormData` pour envoyer ensemble les champs
texte et l'image d'une publication. Le navigateur configure lui-même l'en-tête
`multipart/form-data`.

`galleryService.js` gère les albums et les photos. Les champs fichiers sont
`coverImage` pour un album et `image` pour une photo.

`documentService.js` gère les fichiers avec `FormData`, puis utilise un
`Blob` pour déclencher les téléchargements publics ou authentifiés.

`contactMessageService.js` sépare l'envoi public des opérations protégées de
lecture, changement de statut et suppression.

`adminAccountService.js` gère le profil courant et les comptes accessibles
uniquement au super administrateur.

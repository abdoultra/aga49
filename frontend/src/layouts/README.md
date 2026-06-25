# Layouts

`PublicLayout` affiche les éléments communs aux pages publiques :

```text
PublicHeader
Outlet
PublicFooter
```

`Outlet` est l’emplacement dans lequel React Router affiche la page
correspondant à l’URL courante.

Un `AdminLayout` sera ajouté avec la barre latérale du dashboard lorsque nous
commencerons les routes administratives protégées.

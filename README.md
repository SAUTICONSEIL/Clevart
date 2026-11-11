# Galerie Clevart

Galerie 3D de Clevart : 10 tableaux, chacun avec son titre, ses dimensions et sa technique.

## Lancer en local

Ouvrez un terminal dans ce dossier puis lancez :

    python3 -m http.server 8000

Ouvrez ensuite http://localhost:8000 dans le navigateur. Un double clic sur index.html ne suffit pas : les modules 3D ont besoin d'un serveur.

## Mettre en ligne sur GitHub Pages

Déposez tous les fichiers de ce dossier à la racine du dépôt, sans sous dossier, puis activez GitHub Pages sur la branche main et le dossier / (root).

## Modifier un tableau

Tout se trouve en haut de app.js, dans la liste works : title, size et technique.

Chaque image existe en deux tailles : nom.jpg (ordinateur et fiche) et nom-s.jpg (mobile et vignettes).

## Musique

Les morceaux sont des fichiers mp3 posés à côté de index.html (pink-white.mp3 et open-arms.mp3), sans YouTube donc sans pub. Pour en ajouter, déposez le mp3 dans le dossier puis ajoutez une ligne dans la liste tracks en haut de music.js.

Le bouton ▾ réduit le lecteur sans couper le son, la croix arrête la musique.

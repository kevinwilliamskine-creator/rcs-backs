# RCS Backs — l'application

## Ce qu'il y a dans ce dossier
- `index.html` : l'application (ne pas toucher, sauf avec Claude).
- `data/contenu.json` : TOUT le contenu (joueurs, matchs, clips, docs, skills, lancements, notre jeu).
- `media/` : les vidéos MP4 (26 vidéos reprises du site claude.ai).
- `img/`, `icons/`, `manifest.webmanifest`, `sw.js` : image du stade, icônes et fichiers qui font une « vraie » app sur téléphone.

## Tester sur l'ordinateur
VS Code › clic droit sur `index.html` › **Open with Live Server**.

## Modifier le contenu (sur l'ordi)
1. Dans Live Server, ajoute `?coach` à l'adresse : `http://127.0.0.1:5500/index.html?coach`, puis « Mode coach ».
2. Modifie (joueurs, match, clips, notre jeu…).
3. Clique **Enregistrer contenu.json** : le fichier arrive dans Téléchargements.
4. Remplace `data/contenu.json` par ce nouveau fichier.
5. Mets en ligne (voir plus bas). Les téléphones ont le nouveau contenu à la prochaine ouverture.

Nouvelle vidéo : copie le MP4 (moins de 20 Mo) dans `media/`, puis dans le clip mets le lien `media/nom-du-fichier.mp4`. Vidéo lourde : lien Google Drive ou YouTube.

## Mettre en ligne (gratuit, GitHub Pages)
1. Crée un compte sur github.com.
2. « New repository » › nom `rcs-backs` › Public › Create.
3. « uploading an existing file » › glisse TOUT le contenu de ce dossier › Commit changes.
4. Settings › Pages › Branch : `main` / root › Save. Après 1-2 minutes : `https://TON-NOM.github.io/rcs-backs/`.
5. Envoie ce lien aux joueurs sur WhatsApp. Sur le téléphone : Partager › « Sur l'écran d'accueil » (iPhone) ou ⋮ › « Installer l'application » (Android).

Mise à jour : dans le dépôt GitHub, « Add file › Upload files » › glisse le nouveau `contenu.json` dans le dossier `data` › Commit.
Si tu changes `index.html`, ouvre `sw.js` et passe `rcs-backs-v1` à `rcs-backs-v2` : les téléphones verront « Nouvelle version disponible ».

## Nouveautés (v2)
- Design plus moderne (cartes douces, bandeau du match, barre d'onglets en pastille).
- Match de la semaine : boutons **Itinéraire** (Google Maps) et **Agenda** (ajoute le match à ton calendrier).
- **Message du coach** en haut de la page : mode coach › « Message & club » › champ « Message du coach ».
- Mode coach : carte **Actions rapides** (modifier le match, nouveau match, message, tâche, prévenir le groupe).

## Gérer la page au quotidien
1. Le plus rapide : dicte tes changements à Claude, il modifie et publie.
2. Sinon, mode coach (`?coach` en local) › modifie › « Enregistrer contenu.json » › dépose-le dans `data/` sur GitHub (Add file › Upload files › Commit).
3. Si `index.html` change, `VERSION` dans `sw.js` doit augmenter (fait automatiquement par Claude).

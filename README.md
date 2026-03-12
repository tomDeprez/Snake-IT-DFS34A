# Snake-IT-DFS34A

Un jeu Snake classique développé en HTML, CSS et JavaScript vanilla, sans aucune dépendance externe.

## Apercu

Le joueur controle un serpent qui se deplace sur une grille et doit manger des pommes. Le jeu se termine si le serpent touche un mur.

## Structure du projet

```
Snake/
├── game.html        # Page principale du jeu
├── css/
│   └── main.css     # Styles du jeu (serpent, pomme, conteneur)
└── js/
    └── main.js      # Logique du jeu
```

## Fonctionnalites

- Grille de jeu 400x400px (8x8 cases de 50px)
- Deplacement automatique toutes les 300ms
- Detection de collision avec les murs (Game Over)
- Generation aleatoire des pommes
- Detection de la consommation des pommes

## Controles

| Touche / Bouton | Action          |
|-----------------|-----------------|
| Fleche gauche / `<` | Aller a gauche |
| Fleche droite / `>` | Aller a droite |
| Fleche haut / `^`   | Aller en haut  |
| Fleche bas / `v`    | Aller en bas   |

## Lancer le jeu

Ouvrir le fichier `game.html` directement dans un navigateur web, aucun serveur n'est necessaire.

## Technologies

- HTML5
- CSS3
- JavaScript (ES6)

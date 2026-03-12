let snake = document.getElementById("snake");
let gameContainer = document.getElementById("game-container");
let lastDirection = 'right';

const containerSize = [gameContainer.style.width ? parseInt(gameContainer.style.width) : 0, gameContainer.style.height ? parseInt(gameContainer.style.height) : 0];
const snakeSize = 50;
// setInterval(loopGame, 300);
// setInterval(botPlay, 1);
startGame();


// const brain = require('brain.js');

const net = new brain.NeuralNetwork({
    inputSize: 64,
    hiddenLayers: [64, 32, 16],
    outputSize: 4
});


function trainModel() {
    const trainingData = JSON.parse(localStorage.getItem('mes_donnees_sauvegardees') || '[]');
    if (trainingData.length === 0) {
        console.log("Aucune donnée d'entraînement trouvée !");
        return;
    }

    const formattedData = trainingData.map(entry => ({
        input: entry.matrice,
        output: entry.normalInput
    }));

    net.train(formattedData, {
        iterations: 1000,
        errorThresh: 0.005,
        log: true,
        logPeriod: 100,
    });

    console.log("Modèle entraîné avec les données du localStorage !");
}

function predictAction() {
    const currentState = generateMatrices();
    const prediction = net.run(currentState);
    const directions = ['left', 'right', 'up', 'down'];
    const direction = directions[prediction.indexOf(Math.max(...prediction))];
    console.log('Action prédite :', direction);
    moveSnake(direction);
}

function startGame() {
    generateApple();
}

function resetSnake() {
    snake.style.left = "0px";
    snake.style.top = "0px";
    lastDirection = 'right';
}

function resetGame() {
    resetSnake();
    resetApple();
}

function resetApple() {
    const apples = document.getElementsByClassName("apple");
    for (let apple of apples) {
        gameContainer.removeChild(apple);
    }
    generateApple();
}

function botPlay() {
    const apples = document.getElementsByClassName("apple");
    if (apples.length === 0) return; // Sécurité s'il n'y a pas de pomme

    const snakeRect = snake.getBoundingClientRect();
    const appleRect = apples[0].getBoundingClientRect();

    let directionToGo = lastDirection;

    // Calcul de la distance entre le serpent et la pomme
    const diffX = appleRect.left - snakeRect.left;
    const diffY = appleRect.top - snakeRect.top;

    // Le bot aligne d'abord l'axe X (gauche/droite), puis l'axe Y (haut/bas)
    if (Math.abs(diffX) > 0) {
        // Si la pomme n'est pas sur la même colonne, on va à gauche ou à droite
        directionToGo = diffX > 0 ? 'right' : 'left';
    } else if (Math.abs(diffY) > 0) {
        // Une fois aligné sur X, on s'aligne sur Y (on va en haut ou en bas)
        directionToGo = diffY > 0 ? 'down' : 'up';
    }

    // On met à jour la direction pour que la prochaine boucle de jeu l'utilise
    saveDirection(directionToGo);
    loopGame(); // On peut aussi appeler directement moveSnake(directionToGo) si on veut que le bot réagisse immédiatement
}

function loopGame() {
    let matrice = generateMatrices();
    moveSnake(lastDirection);
    let nomralInput = normalInput();
    sauvegarderEnLocal(matrice, nomralInput);
    checkEatApple();
    if (collideWithWall()) {
        GameOver();
    }
}

document.addEventListener("keydown", function (event) {
    switch (event.key) {
        case "ArrowLeft":
            saveDirection('left');
            break;
        case "ArrowRight":
            saveDirection('right');
            break;
        case "ArrowUp":
            saveDirection('up');
            break;
        case "ArrowDown":
            saveDirection('down');
            break;
    }
});

function saveDirection(event) {
    lastDirection = event;
}

function moveSnake(event) {

    if (event == 'left') {
        snake.style.left = (parseInt(snake.style.left ? snake.style.left : 0) - snakeSize) + "px";
    } else if (event == 'right') {
        snake.style.left = (parseInt(snake.style.left ? snake.style.left : 0) + snakeSize) + "px";
    } else if (event == 'up') {
        snake.style.top = (parseInt(snake.style.top ? snake.style.top : 0) - snakeSize) + "px";
    } else if (event == 'down') {
        snake.style.top = (parseInt(snake.style.top ? snake.style.top : 0) + snakeSize) + "px";
    }
}


function collideWithWall() {

    const snakeRect = snake.getBoundingClientRect();
    const containerRect = gameContainer.getBoundingClientRect();

    if (snakeRect.left < containerRect.left || snakeRect.right > containerRect.right ||
        snakeRect.top < containerRect.top || snakeRect.bottom > containerRect.bottom) {
        return true;
    }
    return false;
}



function GameOver() {
    alert("Game Over!");
    resetGame();
}

function generateApple() {
    const apple = document.createElement("div");
    apple.classList.add("apple");
    apple.style.left = Math.floor(Math.random() * (containerSize[0] / snakeSize)) * snakeSize + "px";
    apple.style.top = Math.floor(Math.random() * (containerSize[1] / snakeSize)) * snakeSize + "px";
    gameContainer.appendChild(apple);
}

function checkEatApple() {
    const snakeRect = snake.getBoundingClientRect();
    const apples = document.getElementsByClassName("apple");

    for (let apple of apples) {
        const appleRect = apple.getBoundingClientRect();
        if (snakeRect.left < appleRect.right && snakeRect.right > appleRect.left &&
            snakeRect.top < appleRect.bottom && snakeRect.bottom > appleRect.top) {
            gameContainer.removeChild(apple);
            generateApple();
            // Here you would also add code to grow the snake
        }
    }
}

function generateMatrices() {
    const snakeRect = snake.getBoundingClientRect();
    const apples = document.getElementsByClassName("apple");
    let inputMatrix = [];
    let outputMatrix = [];

    // On ajoute le serpent une seule fois
    inputMatrix.push([snakeRect, 'snake']);
    
    // On ajoute toutes les pommes
    for (let apple of apples) {
        inputMatrix.push([apple.getBoundingClientRect(), 'apple']);
    }

    // Déclaré en dehors de la boucle pour éviter de le recréer 64 fois
    const number = [9, 59, 109, 159, 209, 259, 309, 359, 409];

    for (let index = 0; index < 8; index++) {
        let calculY = number[index];
        for (let index3 = 0; index3 < 8; index3++) {
            let calculX = number[index3];
            
            // On définit la valeur de la case à 0 par défaut
            let cellValue = 0; 
            
            for (let index2 = 0; index2 < inputMatrix.length; index2++) {
                const element = inputMatrix[index2];
                // Si on trouve un élément à ces coordonnées
                if (element[0].left == calculX && element[0].top == calculY) {
                    if (element[1] === 'snake') {
                        cellValue = 0.1; 
                    } else if (element[1] === 'apple') {
                        // Si on trouve une pomme (et qu'il n'y a pas déjà le serpent dessus)
                        // On peut aussi choisir de prioriser le serpent si les deux se superposent
                        if (cellValue !== 0.1) {
                            cellValue = 0.2;
                        }
                    }
                }
            }
            // On pousse la valeur finale EXACTEMENT une fois par case
            outputMatrix.push(cellValue);
        }
    }

    return outputMatrix;
}

function normalInput(){
    if (lastDirection === 'left') {
        return [1, 0, 0, 0];
    }
    if (lastDirection === 'right') {
        return [0, 1, 0, 0];
    }
    if (lastDirection === 'up') {
        return [0, 0, 1, 0];  
    }
    if (lastDirection === 'down') {
        return [0, 0, 0, 1];  
    }
}

// 1. Fonction pour sauvegarder et cumuler dans le localStorage
function sauvegarderEnLocal(matrice, normalInput) {
    const cleLocalStorage = 'mes_donnees_sauvegardees';
    let donneesGlobales = [];

    // Récupérer les données existantes dans le localStorage
    const donneesExistantes = localStorage.getItem(cleLocalStorage);
    
    // S'il y a déjà des données, on les transforme de texte (JSON) en tableau JavaScript
    if (donneesExistantes) {
        donneesGlobales = JSON.parse(donneesExistantes);
    }

    // Préparer la nouvelle entrée
    const nouvelleEntree = {
        date: new Date().toISOString(),
        matrice: matrice,
        normalInput: normalInput
    };

    // Ajouter la nouvelle entrée au tableau
    donneesGlobales.push(nouvelleEntree);

    // Sauvegarder le tableau mis à jour dans le localStorage (converti en JSON)
    localStorage.setItem(cleLocalStorage, JSON.stringify(donneesGlobales));
    console.log("Les données ont été ajoutées au localStorage !");
}

// 2. Fonction pour exporter le localStorage en fichier JSON téléchargeable
function exporterFichierJSON() {
    const cleLocalStorage = 'mes_donnees_sauvegardees';
    const donnees = localStorage.getItem(cleLocalStorage);

    // Vérifier s'il y a des données à exporter
    if (!donnees) {
        alert("Aucune donnée à exporter !");
        return;
    }

    // Créer un "Blob" (un objet de type fichier) avec nos données JSON
    // On le formate joliment avec JSON.parse puis stringify(..., null, 2)
    const blob = new Blob([JSON.stringify(JSON.parse(donnees), null, 2)], { 
        type: 'application/json' 
    });

    // Créer une URL temporaire pointant vers ce fichier
    const urlFichier = URL.createObjectURL(blob);

    // Créer un lien HTML <a> invisible pour déclencher le téléchargement
    const lienTelechargement = document.createElement('a');
    lienTelechargement.href = urlFichier;
    lienTelechargement.download = 'export_mes_donnees.json'; // Nom du fichier

    // Ajouter le lien au document, cliquer dessus, puis le supprimer
    document.body.appendChild(lienTelechargement);
    lienTelechargement.click();
    document.body.removeChild(lienTelechargement);

    // Nettoyer la mémoire en révoquant l'URL temporaire
    URL.revokeObjectURL(urlFichier);
    console.log("Fichier JSON exporté !");
}

// --- Exemple d'utilisation ---

// Supposons que tu as tes variables :
// let matrice = generateMatrices();
// let nomralInput = normalInput();

// Pour sauvegarder (tu peux appeler ça plusieurs fois, ça va cumuler) :
// sauvegarderEnLocal(matrice, nomralInput);

// Pour télécharger le fichier quand tu as fini :
// exporterFichierJSON();
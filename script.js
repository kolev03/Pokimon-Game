// Selecting pages using IDs
const startPage = document.getElementById("start-page");
const selectPokemonPage = document.getElementById("select-pokemon-page");
const combatPage = document.getElementById("combat-page");
const resetTab = document.getElementById("reset-tab");

// Selecting elements from the pokemon selection page using IDs
const selectPokemonText = document.getElementById("select-pokemon-text");
const pokemonSelectionContainer = document.getElementById("pokemons-to-select");
const loadingText = document.getElementById("loading-container");

// Selecting elements from the combat page using IDs
const myPokemonImage = document.getElementById("my-pokemon-image");
const myPokemonName = document.getElementById("my-pokemon-name");
const myPokemonHpBar = document.getElementById("my-pokemon-hp-bar");

const opponentPokemonImage = document.getElementById("opponent-pokemon-image");
const opponentPokemonName = document.getElementById("opponent-pokemon-name");
const opponentPokemonHpBar = document.getElementById("opponent-pokemon-hp-bar");

const battleLogMessage = document.getElementById("battle-log-message");
const attackButton = document.getElementById("attack-button");
const hyperAttackButton = document.getElementById("hyper-attack-button");
const defenseButton = document.getElementById("defense-button");
const resetButton = document.getElementById("reset-button");

let selectedPokemon; // Mine Pokemon (full API data)
let selectedOpponentPokemon; // Opponent Pokemon (full API data)

let playerTotalHP, playerCurrentHP;
let opponentTotalHP, opponentCurrentHP;
let numbersArray = [];

/**
 * Fetch 151 unique Pokemons from the API into the selection container.
 */
async function fetchPokemons() {
  let randomNumber;
  for (let index = 1; index < 151; index++) {
    // Generate a unique random number between 1 and 500.
    do {
      randomNumber = Math.floor(Math.random() * 500) + 1;
    } while (numbersArray.includes(randomNumber));
    numbersArray.push(randomNumber);

    try {
      let response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${randomNumber}`
      );
      if (!response.ok) {
        alert(`Currently loading pokemon number ${randomNumber} from the API!`);
        continue;
      }
      let data = await response.json();
      // Insert a pokemon card. The onclick calls selectPokemon(this)
      pokemonSelectionContainer.insertAdjacentHTML(
        "beforeend",
        `<div onclick="selectPokemon(this)" id="${randomNumber}" class="pokemon-card" style="background-image: url('${
          data.sprites.front_default
        }');
           background-size: cover;
           background-position: center;">
           
            <div class="pokemon-data">
              <h2>${
                data.name.charAt(0).toUpperCase() +
                data.name.slice(1).toLowerCase()
              }</h2>
            </div>
          </div>`
      );
    } catch (error) {
      alert(error);
    }
  }

  selectPokemonText.style.visibility = "visible";
  loadingText.classList.add("invisible");
  pokemonSelectionContainer.classList.remove("invisible");
}

/**
 * Called when a Pokemon card is clicked.
 * Fetches and stores your selected Pokemon data, then loads the battle UI.
 *
 * @param {HTMLElement} elem - The clicked Pokemon card element.
 */
function selectPokemon(elem) {
  const id = elem.id;

  // Play the Pokemon cry.
  const sound = new Audio(
    `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`
  );
  sound.volume = 0.1;
  sound.playbackRate = 0.75;
  sound.play();

  // Hide selection page and, after a 2s delay, show the combat page.
  selectPokemonPage.classList.add("invisible");
  setTimeout(() => {
    combatPage.classList.remove("invisible");
  }, 1000);

  // Fetch your selected Pokemon's data and then load the battle UI.
  fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          "Failed to fetch selected Pokemon: " + response.statusText
        );
      }
      return response.json();
    })
    .then((data) => {
      selectedPokemon = data;
      // Once data is fetched, load the battle UI (which will also fetch the opponent).
      loadBattleUI();
    })
    .catch((error) => {
      alert(error);
    });
}

/**
 * Loads the battle UI.
 * Fetches a random opponent Pokemon, updates the UI, then starts the battle.
 */
function loadBattleUI() {
  let randomNumber = Math.floor(Math.random() * 500) + 1;
  fetch(`https://pokeapi.co/api/v2/pokemon/${randomNumber}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          "Failed to fetch opponent Pokemon: " + response.statusText
        );
      }
      return response.json();
    })
    .then((data) => {
      selectedOpponentPokemon = data;
      battleLogMessage.textContent = `You are now facing ${data.name.toUpperCase()}`;
      displayPokemonsData("mine", selectedPokemon);
      displayPokemonsData("opp", selectedOpponentPokemon);

      // After 2 seconds, start the battle by comparing attack speeds.
      setTimeout(battleStart, 2000);
    })
    .catch((error) => {
      alert(error);
    });
}

/**
 * Compares the attack speeds of both Pokemon.
 * Displays a message indicating who attacks first.
 * If you attack first, the attack button appears; if your opponent is faster, his attack is triggered automatically.
 */
function battleStart() {
  const mySpeed = selectedPokemon.stats.find(
    (stat) => stat.stat.name === "speed"
  ).base_stat;
  const opponentSpeed = selectedOpponentPokemon.stats.find(
    (stat) => stat.stat.name === "speed"
  ).base_stat;

  if (mySpeed >= opponentSpeed) {
    battleLogMessage.textContent = "You get to attack first!";
    displayAttacks(true);
  } else {
    battleLogMessage.textContent = "Your opponent will attack first!";
    setTimeout(opponentRandomAttack, 1500);
  }
}

/**
 * Updates the display of the opponent's HP bar.
 */
function updateOpponentHpBar() {
  let percentage = (opponentCurrentHP / opponentTotalHP) * 100;
  opponentPokemonHpBar.style.width = percentage + "%";
  opponentPokemonHpBar.textContent = `HP: ${opponentCurrentHP}`;
}

/**
 * Updates the display of your Pokemon's HP bar.
 */
function updatePlayerHpBar() {
  let percentage = (playerCurrentHP / playerTotalHP) * 100;
  myPokemonHpBar.style.width = percentage + "%";
  myPokemonHpBar.textContent = `HP: ${playerCurrentHP}`;
}
/**
 * Renders the given Pokemon's data in the battle UI.
 * - If side is "opp", the opponent's Pokemon data is displayed.
 * - If side is "mine", your Pokemon's data is displayed.
 *
 * @param {string} side - Either "mine" or "opp".
 * @param {object} pokemon - The Pokemon data fetched from the API.
 */
function displayPokemonsData(side, pokemon) {
  if (side === "opp") {
    opponentPokemonImage.style.backgroundImage = `url(${pokemon.sprites.front_default})`;
    opponentPokemonName.textContent =
      pokemon.name.charAt(0).toUpperCase() +
      pokemon.name.slice(1).toLowerCase();
    const oppHpStat = pokemon.stats.find(
      (statObj) => statObj.stat.name === "hp"
    );
    opponentTotalHP = oppHpStat.base_stat;
    opponentCurrentHP = opponentTotalHP;
    opponentPokemonHpBar.style.width = "100%";
    opponentPokemonHpBar.textContent = `HP: ${opponentCurrentHP}`;
  } else if (side === "mine") {
    myPokemonImage.style.backgroundImage = `url("https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${pokemon.id}.png")`;
    myPokemonName.textContent =
      pokemon.name.charAt(0).toUpperCase() +
      pokemon.name.slice(1).toLowerCase();
    const hpStat = pokemon.stats.find((stat) => stat.stat.name === "hp");
    playerTotalHP = hpStat.base_stat;
    playerCurrentHP = playerTotalHP;
    myPokemonHpBar.style.width = "100%";
    myPokemonHpBar.textContent = `HP: ${playerCurrentHP}`;
  }
}

function resetGame() {
  attackButton.classList.add("invisible");
  resetButton.classList.remove("invisible");
}

/**
 * Showing or hiding the attacks in the battle log
 * - If it's true, it will add them
 * - If it's false, it will hide them
 */
function displayAttacks(show) {
  if (show) {
    attackButton.classList.remove("invisible");
    hyperAttackButton.classList.remove("invisible");
    defenseButton.classList.remove("invisible");
    battleLogMessage.classList.add("invisible");
  } else {
    attackButton.classList.add("invisible");
    hyperAttackButton.classList.add("invisible");
    defenseButton.classList.add("invisible");
    battleLogMessage.classList.remove("invisible");
  }
}

const moves = {
  normal: {
    name: "Normal Attack",
    damage: 15,
    hitChance: 0.9, // 90% chance to hit
  },
  hyper: {
    name: "Hyper Attack",
    damage: 45,
    hitChance: 0.33, // 33%  chance to hit
  },
};

/**
 * Performing the battle moves. Here we take two variables, who and moveKey
 * - who -> choosing who is dealing the damage
 * - moveKey -> choosing which number of move will be applied
 */
function performMove(who, moveKey) {
  // console.log(selectedPokemon.stats[1].base_stat);
  const move = moves[moveKey];
  const isPlayer = who === "mine";

  const attackerName = isPlayer ? "You" : "Opponent";

  if (Math.random() > move.hitChance) {
    battleLogMessage.textContent = `${attackerName} missed the ${move.name}!`;
  } else {
    if (isPlayer) {
      opponentCurrentHP -= move.damage;
      if (opponentCurrentHP < 0) opponentCurrentHP = 0;
      updateOpponentHpBar();
    } else {
      playerCurrentHP -= move.damage;
      if (playerCurrentHP < 0) playerCurrentHP = 0;
      updatePlayerHpBar();
    }

    // Checking if the game is over
    if (opponentCurrentHP === 0) {
      displayAttacks(false);
      battleLogMessage.textContent = "You WON!";
      return resetGame();
    }
    if (playerCurrentHP === 0) {
      displayAttacks(false);
      battleLogMessage.textContent = "You LOST!";
      return resetGame();
    }

    // Next turn message
    battleLogMessage.textContent = isPlayer
      ? "Your opponent's turn!"
      : "Your turn!";
  }

  if (isPlayer) {
    displayAttacks(false);
    setTimeout(opponentRandomAttack, 1500);
  } else {
    setTimeout(() => displayAttacks(true), 1500);
  }
}

function opponentRandomAttack() {
  const keys = Object.keys(moves);
  const choiceNum = keys[Math.floor(Math.random() * keys.length)];
  const choice = moves[choiceNum];

  battleLogMessage.textContent = `Opponent uses ${choice.name}!`;

  displayAttacks(false);

  setTimeout(() => {
    performMove("opp", choiceNum);
  }, 1500);
}

document.getElementById("start-game").addEventListener("click", function () {
  gsap.set(selectPokemonPage, {
    display: "block",
    xPercent: 100,
  });

  gsap
    .timeline({
      defaults: { duration: 0.7, ease: "power3.inOut" },
      onComplete: () => {
        gsap.set(startPage, {
          visibility: "hidden",
          xPercent: 0,
        });
      },
    })
    .to(startPage, { xPercent: -100 })
    .to(selectPokemonPage, { xPercent: 0 }, "<");

  fetchPokemons();
});

attackButton.addEventListener("click", () => performMove("mine", "normal"));
hyperAttackButton.addEventListener("click", () => performMove("mine", "hyper"));
// defenseButton.   addEventListener("click", () => performMove("mine", "defend"));

resetButton.addEventListener("click", function () {
  combatPage.classList.add("invisible");
  numbersArray = [];
  pokemonSelectionContainer.innerHTML = "";
  selectPokemonText.style.visibility = "hidden";
  loadingText.classList.remove("invisible");
  pokemonSelectionContainer.classList.add("invisible");
  fetchPokemons();
  selectPokemonPage.classList.remove("invisible");
  resetButton.classList.add("invisible");
});

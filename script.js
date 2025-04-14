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
const resetButton = document.getElementById("reset-button");

// Global variables to store selected Pokémon data
let selectedPokemon; // Your Pokemon (full API data)
let selectedOpponentPokemon; // Opponent Pokemon (full API data)

let playerTotalHP, playerCurrentHP;
let opponentTotalHP, opponentCurrentHP;
let numbersArray = [];

// Start by fetching Pokemon for the selection screen.
fetchPokemons();

/**
 * Fetch 10 unique Pokemon from the API into the selection container.
 */
async function fetchPokemons() {
  let randomNumber;
  for (let index = 1; index < 51; index++) {
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
  console.log("Selected Pokemon id:", id);

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
    attackButton.classList.remove("invisible");
  } else {
    battleLogMessage.textContent = "Your opponent will attack first!";
    setTimeout(opponentAttack, 1500);
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
 * Called when the attack button is clicked.
 * Your Pokemon attacks, reducing the opponent's HP, then triggers the opponent's counterattack.
 */
function playerAttack() {
  attackButton.classList.add("invisible");
  let randomNumber = Math.floor(Math.random() * 10) + 1;
  console.log(randomNumber);
  if (randomNumber === 1) {
    battleLogMessage.textContent = "You missed your attack!";
  } else {
    opponentCurrentHP -= 15;
    if (opponentCurrentHP < 0) opponentCurrentHP = 0;
    updateOpponentHpBar();

    if (opponentCurrentHP === 0) {
      battleLogMessage.textContent = "You WON!";
      resetGame();
      return;
    }
    battleLogMessage.textContent = "Your opponent's turn!";
  }
  setTimeout(opponentAttack, 1500);
}

/**
 * Handles the opponent's attack.
 * The opponent's attack reduces your Pokemon's HP.
 */
function opponentAttack() {
  let randomNumber = Math.floor(Math.random() * 10) + 1;
  if (randomNumber === 1) {
    battleLogMessage.textContent = "Opponent missed their attack!";
  } else {
    playerCurrentHP -= 15;
    if (playerCurrentHP < 0) playerCurrentHP = 0;
    updatePlayerHpBar();

    if (playerCurrentHP === 0) {
      battleLogMessage.textContent = "You LOST!";
      resetGame();
      return;
    }
    battleLogMessage.textContent = "Your turn!";
  }
  attackButton.classList.remove("invisible");
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

// Attach event listener to the attack button.
attackButton.addEventListener("click", playerAttack);

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

pokemonCardElement.addEventListener("touchstart", function (e) {
  selectPokemon(this);
});

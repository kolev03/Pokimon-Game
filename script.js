// Selecting the different pages in the project
const startPage = document.querySelector("#start-page");
const selectPokemonPage = document.querySelector("#select-pokemon-page");
const combatPage = document.querySelector("#combat-page");
const resetTab = document.querySelector("#reset-tab");

// Selecting elements from the pokemon selection page
const pokemonSelectionContainer = document.querySelector(".pokemons-to-select");
const loadingText = document.querySelector(".loading-container");

// Selecting elements from the combat page
const myPokimonElement = document.querySelector(".my-pokemon").children[0];
const myPokimonElementName =
  document.getElementById("my-pokemon-stats").children[0];
const myPokimonElementHpBar =
  document.getElementById("my-pokemon-stats").children[1];
const opponentPokimonElement =
  document.querySelector(".opponent-pokemon").children[0];
const opponentElementName = document.getElementById("opponent-pokemon-stats")
  .children[0];
const opponentElementHpBar = document.getElementById("opponent-pokemon-stats")
  .children[1];
const battleLogMessage = document.querySelector(".battle-log-message");
const attackButton = document.getElementById("attack-button");

let selectedPokemon; // Your Pokemon (full API data)
let selectedOpponentPokemon; // Opponent Pokemon (full API data)

let playerTotalHP, playerCurrentHP;
let opponentTotalHP, opponentCurrentHP;

// Start by fetching Pokemon for the selection screen.
fetchPokemons();

/**
 * Fetch 10 unique Pokemon from the API into the selection container.
 */
async function fetchPokemons() {
  const numbersArray = [];
  let randomNumber;
  for (let index = 1; index < 11; index++) {
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
  loadingText.classList.add("invisible");
  pokemonSelectionContainer.classList.remove("invisible");
}

/**
 * Called when a Pokemon card is clicked.
 * Fetches and stores your selected Pokemon data, then loads the battle UI.
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
  }, 2000);

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
  // Fetch a random opponent Pokemon.
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

      // Display an initial battle log message.
      battleLogMessage.textContent = `You are now facing ${data.name.toUpperCase()}`;

      // Render the data for both your Pokemon and your opponent.
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
 * Compares the attack speeds of both Pokemon
 * Displays a message indicating who attacks first
 * If you attack first, the attack button appears; if your opponent is faster, his attack is triggered automatically
 */
function battleStart() {
  const mySpeed = selectedPokemon.stats.find(
    (stat) => stat.stat.name === "speed"
  ).base_stat;
  const opponentSpeed = selectedOpponentPokemon.stats.find(
    (stat) => stat.stat.name === "speed"
  ).base_stat;

  // Deciding who will attack first
  if (mySpeed >= opponentSpeed) {
    battleLogMessage.textContent = "You get to attack first!";
    attackButton.classList.remove("invisible");
  } else {
    battleLogMessage.textContent = "Your opponent will attack first!";
    setTimeout(opponentAttack, 1500);
  }
}

/**
 * Updates the display of HP bar for the opponent Pokemon
 */
function updateOpponentHpBar() {
  let percentage = (opponentCurrentHP / opponentTotalHP) * 100;
  opponentElementHpBar.style.width = percentage + "%";
  opponentElementHpBar.textContent = `HP: ${opponentCurrentHP}`;
}

/**
 * Updates the display of HP bar for your Pokemon.
 */
function updatePlayerHpBar() {
  let percentage = (playerCurrentHP / playerTotalHP) * 100;
  myPokimonElementHpBar.style.width = percentage + "%";
  myPokimonElementHpBar.textContent = `HP: ${playerCurrentHP}`;
}

/**
 * Called when the attack button is clicked.
 * Your Pokemon attacks, reducing the opponent's HP, then triggers the opponent's counterattack.
 */
function playerAttack() {
  attackButton.classList.add("invisible");

  // Subtract 20 HP from the opponent.
  opponentCurrentHP -= 20;
  if (opponentCurrentHP < 0) opponentCurrentHP = 0;
  updateOpponentHpBar();

  // Check if the opponent is defeated.
  if (opponentCurrentHP === 0) {
    battleLogMessage.textContent = "You defeated your opponent!";
    opponentPokimonElement.style.backgroundImage = `url()`;
    return;
  }

  battleLogMessage.textContent = "Your opponent's turn!";

  // After 1.5 seconds, trigger the opponent's attack.
  setTimeout(opponentAttack, 1500);
}

/**
 * Handles the opponent's attack
 * The opponent's attack reduces your Pokemon's HP
 */
function opponentAttack() {
  playerCurrentHP -= 20;
  if (playerCurrentHP < 0) playerCurrentHP = 0;
  updatePlayerHpBar();

  // Check if your Pokemon is defeated.
  if (playerCurrentHP === 0) {
    battleLogMessage.textContent = "Your opponent defeated you!";
    myPokimonElement.style.backgroundImage = "url()";
    return;
  }

  battleLogMessage.textContent = "Your turn!";

  // If not defeated, it's your turn again – show the attack button.
  attackButton.classList.remove("invisible");
}

/**
 * Renders the given Pokemon's data in the battle UI
 *
 * @param {string} side - Either "mine" or "opp".
 * @param {object} pokemon - The Pokemon data fetched from the API.
 */
function displayPokemonsData(side, pokemon) {
  if (side === "opp") {
    opponentPokimonElement.style.backgroundImage = `url(${pokemon.sprites.front_default})`;
    opponentElementName.textContent =
      pokemon.name.charAt(0).toUpperCase() +
      pokemon.name.slice(1).toLowerCase();
    const oppHpStat = pokemon.stats.find(
      (statObj) => statObj.stat.name === "hp"
    );
    opponentTotalHP = oppHpStat.base_stat;
    opponentCurrentHP = opponentTotalHP;
    opponentElementHpBar.style.width = "100%";
    opponentElementHpBar.textContent = `HP: ${opponentCurrentHP}`;
  } else if (side === "mine") {
    myPokimonElement.style.backgroundImage = `url(${pokemon.sprites.front_default})`;
    myPokimonElementName.textContent =
      pokemon.name.charAt(0).toUpperCase() +
      pokemon.name.slice(1).toLowerCase();
    const hpStat = pokemon.stats.find((stat) => stat.stat.name === "hp");
    playerTotalHP = hpStat.base_stat;
    playerCurrentHP = playerTotalHP;
    myPokimonElementHpBar.style.width = "100%";
    myPokimonElementHpBar.textContent = `HP: ${playerCurrentHP}`;
  }
}

attackButton.addEventListener("click", playerAttack);

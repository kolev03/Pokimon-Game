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

// Creating local variables for the current battle
let playerTotalHP, playerCurrentHP;
let opponentTotalHP, opponentCurrentHP;
let numbersArray = [];

let backgroundMusic;

/**
 * Fetch 151 unique Pokemons from the API into the selection container.
 */
async function fetchPokemons() {
  let randomNumber;

  for (let index = 1; index < 101; index++) {
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
      let hpStat = data.stats.find(
        (statObj) => statObj.stat.name === "hp"
      ).base_stat;

      pokemonSelectionContainer.insertAdjacentHTML(
        "beforeend",
        `
        <div onclick="selectPokemon(this)" id="${randomNumber}" class="pokemon-card" style="background-image: url('${
          data.sprites.front_default
        }');
           background-size: cover;
           background-position: center;">
           <span id="hoverBarPokemon">Hp: ${hpStat}</span>
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

  selectPokemonPage.style.position = "relative";
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

  backgroundMusic.pause();
  // Play the Pokemon cry.
  const sound = new Audio(
    `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`
  );
  sound.volume = 0.1;
  sound.playbackRate = 0.75;
  sound.play();

  selectPokemonPage.classList.add("invisible");
  startPage.style.display = "none";

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
      battleUIAnimation();
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

      // After 5 seconds, start the battle by comparing attack speeds.
      setTimeout(battleStart, 5000);
      setTimeout(() => {
        backgroundMusic = new Audio("./mp3/battle.mp3");
        backgroundMusic.volume = 0.7;
        backgroundMusic.loop = true;
        backgroundMusic.play();
      }, 1500);
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
    setTimeout(() => {
      displayAttacks(true);
    }, 2500);
  } else {
    battleLogMessage.textContent = "Your opponent will attack first!";
    setTimeout(opponentRandomAttack, 2500);
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

// Stops the battle music, displays the Reset Button and hides the .
function resetGame() {
  backgroundMusic.pause();
  resetButton.classList.remove("invisible");
}

/**
 * Showing or hiding the attacks in the battle log.
 * @param {string} show - Either true or false.
 */
function displayAttacks(show) {
  if (show) {
    attackButton.classList.remove("invisible");
    hyperAttackButton.classList.remove("invisible");
    defenseButton.classList.remove("invisible");
    document.querySelector(".battle-log-section").style.justifyContent =
      "space-evenly";
  } else {
    attackButton.classList.add("invisible");
    hyperAttackButton.classList.add("invisible");
    defenseButton.classList.add("invisible");
    document.querySelector(".battle-log-section").style.justifyContent =
      "center";
  }
}

const moves = {
  normal: {
    name: "Normal Attack",
    damage: 25,
    hitChance: 0.9, // 90% chance to hit
  },
  hyper: {
    name: "Hyper Attack",
    damage: 55,
    hitChance: 0.33, // 33%  chance to hit
  },
  heal: {
    name: "Heal",
    min: 10,
    max: 25,
    hitChance: 1.0, // always succeeds
  },
};

/**
 * Performing the battle moves. Here we take two variables, who and moveKey
 * - who -> choosing who is dealing the damage
 * - moveKey -> choosing which number of move will be applied
 * @param {string} who - Either "mine" or anything else.
 * @param {object} moveKey - Move key from the moves array
 */
function performMove(who, moveKey) {
  const move = moves[moveKey];
  const isPlayer = who === "mine";
  const attackerName = isPlayer ? "You" : "Opponent";

  if (moveKey === "heal") {
    // pick a random heal amount
    const amount =
      Math.floor(Math.random() * (move.max - move.min + 1)) + move.min;
    if (isPlayer) {
      playerCurrentHP = Math.min(playerTotalHP, playerCurrentHP + amount);
      updatePlayerHpBar();
    } else {
      opponentCurrentHP = Math.min(opponentTotalHP, opponentCurrentHP + amount);
      updateOpponentHpBar();
    }
    battleLogMessage.textContent = `${attackerName} healed for ${amount} HP!`;
    displayAttacks(false);

    // update the message after the move
    if (isPlayer) {
      displayAttacks(false);
      return setTimeout(opponentRandomAttack, 2500);
    } else {
      return setTimeout(() => {
        displayAttacks(true);
        battleLogMessage.textContent = "Your turn!";
      }, 2500);
    }
  }

  // Displaying message if the move missed
  if (Math.random() > move.hitChance) {
    battleLogMessage.textContent = `${attackerName} missed the ${move.name}!`;
    if (isPlayer) {
      displayAttacks(false);
      return setTimeout(opponentRandomAttack, 2500);
    } else {
      // after opponent miss, re‑enable buttons and update the log
      return setTimeout(() => {
        displayAttacks(true);
        battleLogMessage.textContent = "Your turn!";
      }, 2500);
    }
  }

  // start the visual attack
  attackAnimation(isPlayer);
  displayAttacks(false);

  setTimeout(() => {
    // apply damage
    if (isPlayer) {
      opponentCurrentHP = Math.max(0, opponentCurrentHP - move.damage);
      updateOpponentHpBar();
    } else {
      playerCurrentHP = Math.max(0, playerCurrentHP - move.damage);
      updatePlayerHpBar();
    }

    // check for ko
    if (opponentCurrentHP === 0) {
      pokemonSlayed(false);
      battleLogMessage.textContent = "You WON!";
      return resetGame();
    }
    if (playerCurrentHP === 0) {
      pokemonSlayed(true);
      battleLogMessage.textContent = "You LOST!";
      return resetGame();
    }
    // announce next turn
    battleLogMessage.textContent = isPlayer
      ? "Your opponent's turn!"
      : "Your turn!";

    // schedule the opponent or re‑enable buttons
    if (isPlayer) {
      setTimeout(opponentRandomAttack, 2500);
    } else {
      displayAttacks(true);
    }
  }, 1400);
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

// Starting the game button
document.getElementById("start-game").addEventListener("click", function () {
  startPageToSelectPageAnimation();
  backgroundMusic = new Audio("./mp3/selectPage.mp3");
  backgroundMusic.loop = true;
  backgroundMusic.volume = 0.2;
  backgroundMusic.play();

  fetchPokemons();
});

// Event listeners for the move buttons
attackButton.addEventListener("click", () => performMove("mine", "normal"));
hyperAttackButton.addEventListener("click", () => performMove("mine", "hyper"));
defenseButton.addEventListener("click", () => performMove("mine", "heal"));

// Reseting the game
resetButton.addEventListener("click", function () {
  combatPage.classList.add("invisible");
  combatPage.style.display = "none";
  numbersArray = [];
  pokemonSelectionContainer.innerHTML = "";
  selectPokemonText.style.visibility = "hidden";
  loadingText.classList.remove("invisible");
  pokemonSelectionContainer.classList.add("invisible");
  fetchPokemons();
  myPokemonImage.style.visibility = "visible";
  opponentPokemonImage.style.visibility = "visible";
  selectPokemonPage.classList.remove("invisible");
  selectPokemonPage.style.display = "block";
  resetButton.classList.add("invisible");
});

// GSAP ANIMATIONS----------------------------------------------

function startPageToSelectPageAnimation() {
  gsap.set(selectPokemonPage, {
    display: "block",
    xPercent: 100,
  });

  gsap
    .timeline({
      defaults: { duration: 0.7, ease: "power3.inOut" },
      onComplete: () => {
        gsap.set(startPage, {
          block: "none",
          xPercent: 0,
        });
      },
    })
    .to(startPage, { xPercent: -100 })
    .to(selectPokemonPage, { xPercent: 0 }, "<");
}
function battleUIAnimation() {
  const blackOv = document.getElementById("blackOverlay");
  gsap.set(blackOv, { display: "block", xPercent: 100 });
  gsap.set(combatPage, { display: "block", xPercent: 100 });

  gsap
    .timeline({
      defaults: { duration: 1.75, ease: "expo.out" },
      onComplete: () => {
        gsap.set(selectPokemonPage, { display: "none", xPercent: 0 });
      },
    })
    .to(blackOv, { xPercent: 100 })
    .to(
      selectPokemonPage,
      { xPercent: -100, duration: 1.7, ease: "expo.out" },
      "+=0"
    )
    .to(combatPage, { xPercent: 0, duration: 0.7, ease: "expo.out" }, "<")
    .to(blackOv, { xPercent: 100, duration: 0.5, ease: "power1.inOut" });
}

/**
 * Making the animation, depending who is attacking. True is for our pokimon, false for the other.
 * @param {string} who - Either true or false.
 */
function attackAnimation(who) {
  let attackerEl = who ? myPokemonImage : opponentPokemonImage;
  let defenderEl = who ? opponentPokemonImage : myPokemonImage;

  attackerEl.style.zIndex = 3;
  defenderEl.style.zIndex = 2;

  let a = attackerEl.getBoundingClientRect();
  let b = defenderEl.getBoundingClientRect();

  let dx = b.left + b.width * 0.5 - (a.left + a.width * 0.5);
  let dy = b.top + b.height * 0.5 - (a.top + a.height * 0.5);

  gsap
    .timeline()
    .to(attackerEl, {
      y: -30,
      duration: 0.1,
      yoyo: true,
      repeat: 3,
      ease: "power1.inOut",
    })

    .to(attackerEl, {
      x: dx,
      y: dy - 30,
      duration: 0.4,
      ease: "power2.out",
    })
    .to(attackerEl, {
      x: 0,
      y: 0,
      duration: 0.3,
      ease: "power2.in",
    })
    .to(
      defenderEl,
      {
        x: "-=10",
        duration: 0.1,
        yoyo: true,
        repeat: 5,
        ease: "power1.inOut",
      },
      "<"
    )
    .to(
      defenderEl,
      {
        y: "-=10",
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power1.inOut",
      },
      "<"
    )

    .to(
      defenderEl,
      {
        filter: "brightness(2)",
        duration: 0.1,
        yoyo: true,
        repeat: 1,
      },
      "<"
    );
}

function pokemonSlayed(who) {
  let defenderEl = who ? myPokemonImage : opponentPokemonImage;
  gsap.to(defenderEl, {
    y: 40,
    duration: 0.6,
    opacity: 0,
    ease: "expo.out",
    onComplete: () => {
      defenderEl.style.visibility = "hidden";
      gsap.set(defenderEl, { clearProps: "y,opacity" });
    },
  });
}

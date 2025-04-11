const startPage = document.querySelector("#start-page");
const selectPokemonPage = document.querySelector("#select-pokemon-page");
const combatPage = document.querySelector("#combat-page");
const resetTab = document.querySelector("#reset-tab");
const pokemonSelectionContainer = document.querySelector(".pokemons-to-select");
const loadingText = document.querySelector(".loading-container");

async function fetchPokemons() {
  const numbersArray = [];
  let randomNumber;
  for (let index = 1; index < 151; index++) {
    /**
     * Creating a random number between 1 and 500, while making sure that it is unique to previous numbers
     *
     * @type {number}
     */
    do {
      randomNumber = Math.floor(Math.random() * 500) + 1;
    } while (numbersArray.includes(randomNumber));

    numbersArray.push(randomNumber);

    try {
      let response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${randomNumber}`
      );

      /**
       * Checking if the given pokimon has been fetched sucessfully
       */
      if (!response.ok) {
        alert(
          `Currently loading  pokemon number ${randomNumber} from the API!`
        );
        continue;
      }
      let data = await response.json();
      let first = [...data.name];
      pokemonName =
        /**
         * Inserting a pokemon for each iteration from the API
         */
        pokemonSelectionContainer.insertAdjacentHTML(
          "beforeend",
          `<div onclick="selectPokemon()" id="${randomNumber}"class="pokemon-card" style="background-image: url('${
            data.sprites.front_shiny
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

// fetchPokemons();

function selectPokemon(event) {
  console.log("clciked!@");
  console.log(event.id);
}

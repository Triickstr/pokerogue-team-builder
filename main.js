
window.typeColors = {
  Normal: '#A8A77A',
  Fire: '#EE8130',
  Water: '#6390F0',
  Electric: '#F7D02C',
  Grass: '#7AC74C',
  Ice: '#96D9D6',
  Fighting: '#C22E28',
  Poison: '#A33EA1',
  Ground: '#E2BF65',
  Flying: '#A98FF3',
  Psychic: '#F95587',
  Bug: '#A6B91A',
  Rock: '#B6A136',
  Ghost: '#735797',
  Dragon: '#6F35FC',
  Dark: '#705746',
  Steel: '#B7B7CE',
  Fairy: '#D685AD'
};

document.addEventListener("DOMContentLoaded", () => {
  const pokemonData = typeof window.items !== 'undefined' ? window.items : (typeof items !== 'undefined' ? items : []);
  const teamGrid = document.getElementById("teamGrid");

  if (!pokemonData || !Array.isArray(pokemonData) || pokemonData.length === 0) {
    teamGrid.innerHTML = '<p>Failed to load Pokémon data.</p>';
    return;
  }

const getAllMoves = () => {
  const moveSet = new Set();
  pokemonData.forEach(p => {
    const exclude = [p.t1, p.t2, p.a1, p.a2, p.ha, p.pa];
    Object.keys(p).forEach(key => {
      const val = parseInt(key);
      if (!isNaN(val) && !exclude.includes(val)) {
        moveSet.add(val);
      }
    });
  });
  return Array.from(moveSet);
};

  const allMoves = getAllMoves();

  const createPokemonSelector = (onSelect) => {
    const select = document.createElement('select');
    setTimeout(() => new TomSelect(select, { maxOptions: null }), 0);
    select.innerHTML = '<option value="">Select a Pokémon</option>' +
      pokemonData.map((p, i) => {
        const name = window.speciesNames?.[p.row] || `#${p.row} - ${p.img}`;
        return `<option value="${i}">${name}</option>`;
      }).join('');
    select.onchange = () => onSelect(select.value);
    return select;
  };

  const createMoveDropdown = (pokemon) => {
    const sel = document.createElement('select');
    setTimeout(() => new TomSelect(sel, { maxOptions: null }), 0);
    sel.className = 'move-select';
    sel.innerHTML = '<option value="">Select a Move</option>' +
      allMoves.map(m => {
        const isCompatible = String(m) in pokemon;
        const name = window.fidToName?.[m] || `Move ${m}`;
        const opt = `<option value="${m}" class="${isCompatible ? 'move-compatible' : 'move-incompatible'}">${name}</option>`;
        return opt;
      }).join('');
    return sel;
  };

  const createAbilityDropdown = (pokemon) => {
    const abilities = [pokemon.a1, pokemon.a2, pokemon.ha].filter(Boolean);
    const sel = document.createElement('select');
    setTimeout(() => new TomSelect(sel, { maxOptions: null }), 0);
    sel.className = 'ability-select';
    sel.innerHTML = abilities.map(a => {
      const name = window.fidToName?.[a] || `Ability ${a}`;
      return `<option value="${a}">${name}</option>`;
    }).join('');
    return sel;
  };

  const renderPokemonBox = (slot, pokemon) => {
    slot.innerHTML = '';

    const img = document.createElement('img');
    img.src = `images/${pokemon.img}_0.png`;
    img.className = 'pokemon-img';
    img.onerror = () => img.style.display = 'none';
    img.onclick = () => slot.replaceWith(createTeamSlot());
    slot.appendChild(img);

  const typeContainer = document.createElement('div');
    typeContainer.className = 'type-container';

    pokemon.types?.forEach(type => {
    const typeName = window.fidToName?.[type] || `Type ${type}`;
    const typeBox = document.createElement('div');
    typeBox.className = 'type-box';
    typeBox.innerText = typeName;
    typeBox.style.backgroundColor = window.typeColors?.[typeName] || '#777';
    typeContainer.appendChild(typeBox);
  });

  slot.appendChild(typeContainer);

    const stats = document.createElement('div');
    stats.innerText = `HP: ${pokemon.hp}, Atk: ${pokemon.atk}, Def: ${pokemon.def}, SpA: ${pokemon.spa}, SpD: ${pokemon.spd}, Spe: ${pokemon.spe}`;
    slot.appendChild(stats);

    for (let i = 0; i < 4; i++) {
      slot.appendChild(createMoveDropdown(pokemon));
    }

    slot.appendChild(createAbilityDropdown(pokemon));

    const passive = document.createElement('div');
    const passiveName = window.fidToName?.[pokemon.pa] || `Passive ${pokemon.pa}`;
    passive.innerText = `Passive Ability: ${passiveName}`;
    slot.appendChild(passive);
  };

  const createTeamSlot = () => {
    const slot = document.createElement('div');
    slot.className = 'team-slot';
    slot.appendChild(createPokemonSelector((idx) => {
      const pokemon = {
      ...pokemonData[idx],
      types: [pokemonData[idx].t1, pokemonData[idx].t2].filter(Boolean)
    };
      renderPokemonBox(slot, pokemon);
    }));
    return slot;
  };

  for (let i = 0; i < 6; i++) {
    teamGrid.appendChild(createTeamSlot());
  }
});

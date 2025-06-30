

async function waitForTomSelect(selectElement, timeout = 1000) {
  return new Promise((resolve) => {
    const interval = 50;
    const maxTries = timeout / interval;
    let tries = 0;

    const check = () => {
      const ts = selectElement.tomselect;
      if (ts) return resolve(ts);
      tries++;
      if (tries >= maxTries) return resolve(null);
      setTimeout(check, interval);
    };

    check();
  });
}


let pokemonData = [];
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
const updateTeamSummary = () => {
  const summaryContainer = document.getElementById('teamSummary');
  summaryContainer.innerHTML = '';

  document.querySelectorAll('.team-slot').forEach((slot, i) => {
    const summaryBox = document.createElement('div');
    summaryBox.className = 'summary-box ' + (i % 2 === 0 ? 'summary-box-red' : 'summary-box-blue');

    const images = slot.querySelectorAll('img');
    const types = slot.querySelectorAll('.type-box');
    const statText = slot.querySelector('.stats')?.innerText || '';
    const moveNames = Array.from(slot.querySelectorAll('.move-select'))
      .map(s => {
        const ts = s.tomselect;
        const value = ts?.getValue?.();
        return ts?.options?.[value]?.text || null;
    })
    .filter(Boolean); // Remove nulls

    let ability = '—';

    const fusionAbilitySelect = slot.querySelector('.fusion-ability-select');
      if (fusionAbilitySelect?.tomselect) {
        const ts = fusionAbilitySelect.tomselect;
        ability = ts.getItem(ts.getValue())?.textContent || '—';
      } else {
          const baseAbilitySelect = slot.querySelector('.ability-select');
          const ts = baseAbilitySelect?.tomselect;
          ability = ts?.getItem(ts.getValue())?.textContent || '—';
      }
    const passiveText = Array.from(slot.childNodes).find(el => el?.innerText?.startsWith('Passive Ability:'))?.innerText.replace('Passive Ability: ', '') || '—';
    const nature = slot.querySelector('.nature-select')?.selectedOptions[0]?.textContent || '—';

    const imageRow = document.createElement('div');
    imageRow.className = 'summary-images';
    imageRow.appendChild(images[0]?.cloneNode(true) || document.createElement('div'));
    imageRow.appendChild(images[1]?.cloneNode(true) || document.createElement('div'));
    summaryBox.appendChild(imageRow);

    const primaryTypes = Array.from(types).slice(0, 2).map(t => t.textContent);
    const fusionTypes = Array.from(types).slice(2, 4).map(t => t.textContent);  // adjust if more types show

    
let resultTypes = [];

if (fusionTypes.length === 0) {
  resultTypes = primaryTypes;
} else {
  const [primaryFirst] = primaryTypes;
  let fusionPick = fusionTypes[1] || fusionTypes[0];

  if (fusionTypes.length === 1 && fusionTypes[0] === primaryFirst && primaryTypes.length === 1) {
    fusionPick = null;
  } else {
    if (fusionTypes.length === 2 && fusionTypes[1] === primaryFirst) {
      fusionPick = fusionTypes[0];
    } else if (fusionTypes.length === 1 && fusionTypes[0] === primaryFirst) {
      fusionPick = primaryTypes[1] || primaryFirst;
    }
  }

  if (fusionPick === null || fusionPick === primaryFirst) {
    resultTypes = [primaryFirst];
  } else {
    resultTypes = [primaryFirst, fusionPick];
  }
}

//  Remove duplicates explicitly before rendering
resultTypes = [...new Set(resultTypes)];

const typeRow = document.createElement('div');
typeRow.className = 'summary-types';
typeRow.innerHTML = '';

resultTypes.forEach(typeName => {
  if (typeName !== null) {
    const box = document.createElement('div');
    box.className = 'summary-type-box';
    box.style.backgroundColor = window.typeColors?.[typeName] || '#777';
    box.textContent = typeName;
    typeRow.appendChild(box);
  }
});
summaryBox.appendChild(typeRow);

    let statRow = document.createElement('div');
    statRow.className = 'summary-stats';

    const statRegex = /HP: (\d+), Atk: (\d+), Def: (\d+), SpA: (\d+), SpD: (\d+), Spe: (\d+)/;
    const statMatch = statText.match(statRegex);

    let fusionStatText = '';
    const fusionStatNode = slot.querySelector('.fusion-container .stats');
    if (fusionStatNode) fusionStatText = fusionStatNode.textContent;

    const fusionMatch = fusionStatText.match(statRegex);

    if (statMatch) {
    const baseStats = statMatch.slice(1).map(Number);
    const fusionStats = fusionMatch ? fusionMatch.slice(1).map(Number) : null;

    const finalStats = fusionStats
      ? baseStats.map((val, i) => Math.floor((val + fusionStats[i]) / 2))
      : baseStats;
    
    const baseRow = parseInt(slot.dataset.pokemonRow);
    const fusionRow = parseInt(slot.dataset.fusionRow);

    if (baseRow === 364 || fusionRow === 364) {
    finalStats[0] = 1; // HP is always the first stat
    }

    statRow.textContent = `HP: ${finalStats[0]}, Atk: ${finalStats[1]}, Def: ${finalStats[2]}, SpA: ${finalStats[3]}, SpD: ${finalStats[4]}, Spe: ${finalStats[5]}`;
    }

    summaryBox.appendChild(statRow);

const moveRow = document.createElement('div');
moveRow.className = 'summary-moves';

const baseRow = parseInt(slot.dataset.pokemonRow);
const fusionRow = parseInt(slot.dataset.fusionRow || -1);
const basePoke = pokemonData.find(p => p.row === baseRow);
const fusionPoke = pokemonData.find(p => p.row === fusionRow);

slot.querySelectorAll('.move-select').forEach(select => {
  const ts = select.tomselect;
  const value = ts?.getValue?.();
  const name = ts?.options?.[value]?.text;
  const moveId = parseInt(value);

  if (name && !isNaN(moveId)) {
    let color = '#ffeeba'; // default orange
    if (basePoke?.hasOwnProperty(moveId)) color = '#d4edda'; // green
    else if (fusionPoke?.hasOwnProperty(moveId)) color = '#cce5ff'; // blue

    const div = document.createElement('div');
    div.textContent = name;
    div.style.backgroundColor = color;
    div.style.color = '#222';
    div.style.padding = '2px 5px';
    div.style.margin = '2px 0';
    div.style.borderRadius = '4px';
    moveRow.appendChild(div);
  }
});

summaryBox.appendChild(moveRow);


    const infoRow = document.createElement('div');
    infoRow.className = 'summary-info';
    [ability, passiveText, nature].forEach(val => {
      const div = document.createElement('div');
      div.textContent = val;
      infoRow.appendChild(div);
    });
    summaryBox.appendChild(infoRow);
    summaryContainer.appendChild(summaryBox);
  });
};

const observeChanges = (element) => {
  if (!element) return;
  element.addEventListener('change', updateTeamSummary);
};

document.addEventListener("DOMContentLoaded", () => {
  const teamGrid = document.getElementById("teamGrid");
  teamGrid.innerHTML = '';

  // Load Pokémon data
  pokemonData = typeof window.items !== 'undefined' ? window.items : (typeof items !== 'undefined' ? items : []);
  if (!pokemonData || !Array.isArray(pokemonData) || pokemonData.length === 0) {
    teamGrid.innerHTML = '<p>Failed to load Pokémon data.</p>';
    return;
  }

  // Move generation after data is loaded
window.allMoves = (() => {
  const moveSet = new Set();

  pokemonData.forEach(p => {
    const exclude = [p.t1, p.t2, p.a1, p.a2, p.ha, p.pa];
    Object.keys(p).forEach(key => {
      const val = parseInt(key);
      if (!isNaN(val) && !exclude.includes(val)) {
        const category = window.catToName?.[val];
        if (category === 'Move') { // Dynamically confirm it's a move
          moveSet.add(val);
        }
      }
    });
  });

  return Array.from(moveSet);
})();

  // Create exactly 6 team slots
  for (let i = 0; i < 6; i++) {
    teamGrid.appendChild(createTeamSlot());
  }
});



  const createPokemonSelector = (onSelect) => {
    const select = document.createElement('select');
    select.innerHTML = '<option value="">Select a Pokémon</option>' +
      pokemonData.map((p, i) => {
        const name = window.speciesNames?.[p.row] || `#${p.row} - ${p.img}`;
        return `<option value="${i}">${name}</option>`;
      }).join('');
    select.className = 'base-pokemon-select';
    // Append it now so TomSelect can attach properly
    setTimeout(() => {
      if (!select.tomselect) {
        new TomSelect(select, { maxOptions: null });
      }
    }, 0);

    select.onchange = () => {
      const idx = select.value;
      const selected = pokemonData[idx];
      select.closest('.team-slot').dataset.pokemonRow = selected?.row ?? '';
      onSelect(idx);
    };

    select.addEventListener('change', () => {
    onSelect(select.value);
    updateTeamSummary();
  });
    return select;
  };

const getValidMoves = () => {
  const moves = [];
  let foundStart = false;
  for (const [fid, name] of Object.entries(window.fidToName || {})) {
    if (name === 'Tackle') foundStart = true;
    if (foundStart) moves.push({ id: parseInt(fid), name });
    if (name === 'Eternabeam') break;
  }
  return moves;
};

const createMoveDropdown = (basePokemon, slot) => {
  const sel = document.createElement('select');
  sel.className = 'move-select';

  const moves = getValidMoves();

  setTimeout(() => {
    new TomSelect(sel, {
      maxOptions: null,
      render: {
        option: function (data, escape) {
          const option = sel.querySelector(`option[value="${data.value}"]`);
          const color = option?.dataset.color || '#fff';
          return `<div style="background-color:${color}; padding:5px;">${escape(data.text)}</div>`;
        },
        item: function (data, escape) {
          const option = sel.querySelector(`option[value="${data.value}"]`);
          const color = option?.dataset.color || '#fff';
          return `<div style="background-color:${color}; padding:5px;">${escape(data.text)}</div>`;
        }
      }
    });
  }, 0);

  sel.innerHTML = '<option value="">Select a Move</option>' + moves.map(m => {
    const isBaseCompatible = basePokemon.hasOwnProperty(m.id);
    const baseRow = basePokemon.row;
    //const slot = document.querySelector(`.team-slot[data-pokemon-row="${baseRow}"]`);
    const fusionRow = parseInt(slot?.dataset.fusionRow || -1);
    const fusionPoke = isNaN(fusionRow) ? null : pokemonData.find(p => p.row === fusionRow);
    const isFusionCompatible = fusionPoke?.hasOwnProperty(m.id);

    let color = '#ffeeba'; // orange by default
    if (isBaseCompatible) color = '#d4edda'; // green
    else if (isFusionCompatible) color = '#cce5ff'; // blue

    return `<option value="${m.id}">${m.name}</option>`;
  }).join('');

  return sel;
};


  const createAbilityDropdown = (pokemon) => {
    const abilities = [pokemon.a1, pokemon.a2, pokemon.ha].filter(type => type != null);
    const sel = document.createElement('select');
    setTimeout(() => new TomSelect(sel, { maxOptions: null }), 0);
    sel.className = 'ability-select';
    sel.innerHTML = `<option value="">Select an Ability</option>` +
      abilities.map(a => {
        const name = window.fidToName?.[a] || `Ability ${a}`;
        return `<option value="${a}">${name}</option>`;
      }).join('');
    return sel;
  };
  const renderPokemonBox = (slot, pokemon) => {
    slot.dataset.pokemonRow = pokemon.row;
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
    stats.className = 'stats';
    stats.innerText = `HP: ${pokemon.hp}, Atk: ${pokemon.atk}, Def: ${pokemon.def}, SpA: ${pokemon.spa}, SpD: ${pokemon.spd}, Spe: ${pokemon.spe}`;
    slot.appendChild(stats);

for (let i = 0; i < 4; i++) {
  const moveWrapper = document.createElement('div');
  moveWrapper.className = 'move-wrapper';

  const moveDropdown = createMoveDropdown(pokemon, slot);
  ['mousedown', 'focus'].forEach(event =>
    moveDropdown.addEventListener(event, () => updateMoveDropdownColors(slot))
  );
  observeChanges(moveDropdown);

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'move-checkbox';

  moveWrapper.appendChild(moveDropdown);
  moveWrapper.appendChild(checkbox);
  slot.appendChild(moveWrapper);
}

// Add this AFTER the for loop
setTimeout(() => updateMoveDropdownColors(slot), 10);



    const abilityDropdown = createAbilityDropdown(pokemon);
    observeChanges(abilityDropdown);
    slot.appendChild(abilityDropdown);


    const passive = document.createElement('div');
    const passiveName = window.fidToName?.[pokemon.pa] || `Passive ${pokemon.pa}`;
    passive.innerText = `Passive Ability: ${passiveName}`;
    slot.appendChild(passive);

      const natureWrapper = document.createElement('div');
    natureWrapper.className = 'nature-wrapper';

    const natureSelect = document.createElement('select');
    observeChanges(natureSelect);
    natureSelect.className = 'nature-select';

    const natures = [
      "Adamant", "Bashful", "Bold", "Brave", "Calm", "Careful", "Docile", "Gentle",
      "Hardy", "Hasty", "Impish", "Jolly", "Lax", "Lonely", "Mild", "Modest", "Naive",
      "Naughty", "Quiet", "Quirky", "Rash", "Relaxed", "Sassy", "Serious", "Timid"
    ];

    natureSelect.innerHTML = `<option value="">Select Nature</option>` +
      natures.map(n => `<option value="${n}">${n}</option>`).join('');

    const natureCheckbox = document.createElement('input');
    natureCheckbox.type = 'checkbox';
    natureCheckbox.className = 'nature-checkbox';

    natureWrapper.appendChild(natureSelect);
    natureWrapper.appendChild(natureCheckbox);
    slot.appendChild(natureWrapper);

    setTimeout(() => new TomSelect(natureSelect, { maxOptions: null }), 0);

    // Fusion Pokémon container
const fusionContainer = document.createElement('div');
fusionContainer.className = 'fusion-container';

const renderFusionInfo = (fusionPoke, slot) => {
  slot.dataset.fusionRow = fusionPoke.row;
  fusionContainer.innerHTML = ''; // Clear before rendering

  // Image
  const img = document.createElement('img');
  img.src = `images/${fusionPoke.img}_0.png`;
  img.className = 'pokemon-img';
  img.onerror = () => img.style.display = 'none';
  img.onclick = () => {
    renderFusionSelector(slot);
    setTimeout(updateTeamSummary, 10);
  };
  fusionContainer.appendChild(img);

  // Types
  const typeContainer = document.createElement('div');
  typeContainer.className = 'type-container';
  [fusionPoke.t1, fusionPoke.t2].filter(type => type != null).forEach(type => {
    const typeName = window.fidToName?.[type] || `Type ${type}`;
    const typeBox = document.createElement('div');
    typeBox.className = 'type-box';
    typeBox.innerText = typeName;
    typeBox.style.backgroundColor = window.typeColors?.[typeName] || '#777';
    typeContainer.appendChild(typeBox);
  });
  fusionContainer.appendChild(typeContainer);

  // Stats
  const stats = document.createElement('div');
  stats.className = 'stats';
  stats.innerText = `HP: ${fusionPoke.hp}, Atk: ${fusionPoke.atk}, Def: ${fusionPoke.def}, SpA: ${fusionPoke.spa}, SpD: ${fusionPoke.spd}, Spe: ${fusionPoke.spe}`;
  fusionContainer.appendChild(stats);

  // Fusion Ability wrapper
  const fusionAbilityWrapper = document.createElement('div');
  fusionAbilityWrapper.className = 'fusion-ability-wrapper';

  const fusionAbilitySelect = document.createElement('select');
  observeChanges(fusionAbilitySelect);
  fusionAbilitySelect.className = 'fusion-ability-select';
  const abilities = [fusionPoke.a1, fusionPoke.a2, fusionPoke.ha].filter(type => type != null);
  fusionAbilitySelect.innerHTML = abilities.map(a => {
    const name = window.fidToName?.[a] || `Ability ${a}`;
    return `<option value="${a}">${name}</option>`;
  }).join('');

  const fusionAbilityCheckbox = document.createElement('input');
  fusionAbilityCheckbox.type = 'checkbox';
  fusionAbilityCheckbox.className = 'fusion-ability-checkbox';

  fusionAbilityWrapper.appendChild(fusionAbilitySelect);
  fusionAbilityWrapper.appendChild(fusionAbilityCheckbox);
  fusionContainer.appendChild(fusionAbilityWrapper);

  slot.appendChild(fusionContainer);

  setTimeout(() => {
    new TomSelect(fusionAbilitySelect, { maxOptions: null });
    updateMoveDropdownColors(slot); // Now safe to call after dropdown is attached
  }, 0);
};


const renderFusionSelector = (slot) => {
  fusionContainer.innerHTML = '';
  const select = document.createElement('select');
  select.innerHTML = `<option value="">Select Fusion Pokémon</option>` +
    pokemonData.map((p, i) => {
      const name = window.speciesNames?.[p.row] || `#${p.row} - ${p.img}`;
      return `<option value="${i}">${name}</option>`;
    }).join('');
  setTimeout(() => new TomSelect(select, { maxOptions: null }), 0);
  select.onchange = () => {
  const selected = pokemonData[select.value];

  if (selected) {
    renderFusionInfo(selected, slot);
  } else {
    //  Clear fusion state completely
    delete slot.dataset.fusionRow;

    //  Clear fusion container content
    const fusionContainer = slot.querySelector('.fusion-container');
    if (fusionContainer) fusionContainer.innerHTML = '';

    updateMoveDropdownColors(slot);  // 🔄 Reset colors properly
  }

  setTimeout(updateTeamSummary, 10);
};
  fusionContainer.appendChild(select);
};

renderFusionSelector(slot);
slot.appendChild(fusionContainer);
setTimeout(updateTeamSummary, 10);
  };

  const createTeamSlot = () => {
    const slot = document.createElement('div');
    slot.className = 'team-slot ' + (teamGrid.children.length % 2 === 0 ? 'team-slot-red' : 'team-slot-blue');
    slot.appendChild(createPokemonSelector((idx) => {
      const pokemon = {
      ...pokemonData[idx],
      types: [pokemonData[idx].t1, pokemonData[idx].t2].filter(type => type != null)
    };
      renderPokemonBox(slot, pokemon);
    }));
    return slot;
  };

  for (let i = 0; i < 6; i++) {
    teamGrid.appendChild(createTeamSlot());
  }

const exportTeamToJson = () => {
  const teamData = [];

  document.querySelectorAll('.team-slot').forEach(slot => {
    const baseSelect = slot.querySelector('select');
    const selectedPokemon = pokemonData[baseSelect?.value];
    let pokemonRow = parseInt(slot.dataset.pokemonRow);
    pokemonRow = isNaN(pokemonRow) ? null : pokemonRow;

    const moveSelects = slot.querySelectorAll('.move-select');
    const moveCheckboxes = slot.querySelectorAll('.move-checkbox');
    const moves = Array.from(moveSelects).map((s) => {
      const ts = s.tomselect;
      const val = ts?.getValue();
      return val !== '' ? parseInt(val) : null;
    });

    const baseAbility = slot.querySelector('.ability-select')?.tomselect?.getValue();
    const baseAbilityParsed = baseAbility ? parseInt(baseAbility) : null;

    const nature = slot.querySelector('.nature-select')?.tomselect?.getValue() || null;

    // Bulbasaur fallback logic
    const hasAnyMoves = moves.some(m => m !== null && !isNaN(m));
    const hasBaseAbility = baseAbilityParsed !== null;
    const hasNature = !!nature;

    if (pokemonRow === null && (hasAnyMoves || hasBaseAbility || hasNature)) {
      pokemonRow = 0; // fallback to Bulbasaur
    }

    const fusionSelect = slot.querySelector('.fusion-container select');
    const selectedFusion = pokemonData[fusionSelect?.value];
    let fusionRow = parseInt(slot.dataset.fusionRow);
    fusionRow = isNaN(fusionRow) ? null : fusionRow;

    const fusionAbility = slot.querySelector('.fusion-ability-select')?.tomselect?.getValue();
    const fusionAbilityParsed = fusionAbility ? parseInt(fusionAbility) : null;

    // Fusion fallback logic
    if (fusionRow === null && fusionAbilityParsed !== null) {
      fusionRow = 0;
    }

    teamData.push({
      pokemon: pokemonRow,
      fusion: fusionRow,
      moves: moves,
      ability: baseAbilityParsed,
      fusionAbility: fusionAbilityParsed,
      nature
    });
  });

  const blob = new Blob([JSON.stringify(teamData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "poke_team.json";
  a.click();
  URL.revokeObjectURL(url);
};

function clearAllCheckboxes() {
  document.querySelectorAll('.move-checkbox, .nature-checkbox, .fusion-ability-checkbox').forEach(cb => {
    cb.checked = false;
  });
}


//  Basic import logic using .row field matching
async function waitForTomSelect(select, timeout = 1000) {
  return new Promise(resolve => {
    const interval = 50;
    const maxTries = timeout / interval;
    let tries = 0;

    const check = () => {
      if (select?.tomselect) return resolve(select.tomselect);
      if (++tries >= maxTries) return resolve(null);
      setTimeout(check, interval);
    };

    check();
  });
}

async function importTeamData(data) {
  const slots = document.querySelectorAll('.team-slot');
  console.log("Starting import of team data:", data);

  for (let i = 0; i < data.length; i++) {
    const entry = data[i];
    const slot = slots[i];
    console.log(`\n--- Processing slot ${i + 1} ---`);
    console.log("Entry:", entry);

    if (!slot) {
      console.warn(`Slot ${i} does not exist. Skipping.`);
      continue;
    }
    if (entry.pokemon === undefined || entry.pokemon === null) {
      console.warn(`Slot ${i} has no base Pokémon. Skipping.`);
      continue;
    }

    // Step 1: Set base Pokémon
    const baseIndex = pokemonData.findIndex(p => p.row === entry.pokemon);
    console.log("Base Pokémon Row:", entry.pokemon, " -> Index:", baseIndex);

    if (baseIndex !== -1) {
      const baseSelect = slot.querySelector('select');
      baseSelect.value = baseIndex;

    const selectedPokemon = {
      ...pokemonData[baseIndex],
      types: [pokemonData[baseIndex].t1, pokemonData[baseIndex].t2].filter(type => type != null)
    };

    renderPokemonBox(slot, selectedPokemon);
    console.log("Rendered base Pokémon:", selectedPokemon);

    await new Promise(res => setTimeout(res, 300));
  } else {
    console.warn("Base Pokémon not found in data.");
  }


    // Step 2: Set fusion Pokémon
    if (entry.fusion !== null && entry.fusion !== undefined) {
      const fusionIndex = pokemonData.findIndex(p => p.row === entry.fusion);
      console.log("Fusion Pokémon Row:", entry.fusion, " -> Index:", fusionIndex);

      if (fusionIndex !== -1) {
        const fusionSelect = slot.querySelector('.fusion-container select');
        fusionSelect.value = fusionIndex;
        fusionSelect.dispatchEvent(new Event('change'));
        await new Promise(res => setTimeout(res, 300));
        console.log("Fusion Pokémon selected:", pokemonData[fusionIndex]);
      } else {
        console.warn("Fusion Pokémon not found.");
      }

      const fusionAbilitySelect = slot.querySelector('.fusion-ability-select')?.tomselect;
      if (fusionAbilitySelect && entry.fusionAbility !== null) {
        fusionAbilitySelect.setValue(String(entry.fusionAbility));
        console.log("Set fusion ability to:", entry.fusionAbility);
      }
    }

    // Step 3: Set moves (with checkboxes)
const moveDropdowns = slot.querySelectorAll('.move-select');
const moveCheckboxes = slot.querySelectorAll('.move-checkbox');

// Uncheck all move checkboxes before assigning values
moveCheckboxes.forEach(cb => cb.checked = false);

await Promise.all(
  (entry.moves || []).map(async (moveId, idx) => {
    const dropdown = moveDropdowns[idx];
    const checkbox = moveCheckboxes[idx];

    if (dropdown && moveId !== null) {
      const ts = await waitForTomSelect(dropdown);
      if (ts) {
        ts.setValue(String(moveId));
        if (checkbox) checkbox.checked = true;
        console.log(`Set move ${idx + 1} to ID ${moveId}`);
      }
    }
  })
);

    // Step 4: Set ability
    const abilitySelect = slot.querySelector('.ability-select')?.tomselect;
    if (entry.ability !== undefined && entry.ability !== null && abilitySelect) {
      abilitySelect.setValue(String(entry.ability));
      console.log("Set base ability to:", entry.ability);
    }

    // Step 5: Set nature
    const natureSelect = slot.querySelector('.nature-select')?.tomselect;
    const natureCheckbox = slot.querySelector('.nature-checkbox');

    // Always uncheck before applying imported value
    if (natureCheckbox) natureCheckbox.checked = false;

    if (entry.nature && natureSelect && natureCheckbox) {
      natureCheckbox.checked = true;
      natureSelect.setValue(entry.nature);
      console.log("Set nature to:", entry.nature);
    }


    updateTeamSummary();
    await new Promise(res => setTimeout(res, 150));
  }

  console.log("Import finished.");

  
}


document.getElementById('exportBtn').addEventListener('click', exportTeamToJson);
document.getElementById('importFile').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const text = await file.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    alert("Invalid JSON file.");
    return;
  }

  await importTeamData(data);

  //  Reset checkboxes after everything is imported
  clearAllCheckboxes();
});


function updateMoveDropdownColors(slot) {
  const baseRow = parseInt(slot.dataset.pokemonRow);
  const fusionRow = parseInt(slot.dataset.fusionRow || -1);

  const basePoke = pokemonData.find(p => p.row === baseRow);
  const fusionPoke = pokemonData.find(p => p.row === fusionRow);

  slot.querySelectorAll('.move-select').forEach(select => {
    const ts = select.tomselect;

    for (const option of select.options) {
      if (!option.value) continue;
      const moveId = parseInt(option.value);

      const isBase = basePoke?.hasOwnProperty(moveId);
      const isFusion = fusionPoke?.hasOwnProperty(moveId);

      let color;
      if (isBase && isFusion) color = '#d4edda'; // still prioritize green
      else if (isBase) color = '#d4edda';        // green
      else if (isFusion) color = '#cce5ff';      // blue
      else color = '#ffeeba';                    // default orange

      option.dataset.color = color;

      // Update rendered dropdown if already open
    const optEl = ts.getOption(option.value);
    const itemEl = ts.getItem(option.value);
    if (optEl) optEl.style.backgroundColor = color;
    if (itemEl) itemEl.style.backgroundColor = color;
    }
    ts.refreshOptions(false);
  });
}


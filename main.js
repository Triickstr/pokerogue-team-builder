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
    summaryBox.className = 'summary-box';

    const images = slot.querySelectorAll('img');
    const types = slot.querySelectorAll('.type-box');
    const statText = slot.querySelector('.stats')?.innerText || '';
    const moveNames = Array.from(slot.querySelectorAll('.move-select')).map(s => {
      const ts = s.tomselect;
      const value = ts?.getValue?.();
      return ts?.getItem?.(value)?.textContent || '—';
    });
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

      if (fusionTypes.length === 2 && fusionTypes[1] === primaryFirst) {
        fusionPick = fusionTypes[0];
    } else if (fusionTypes.length === 1 && fusionTypes[0] === primaryFirst) {
      fusionPick = primaryTypes[1] || primaryFirst;
    }

      resultTypes = [primaryFirst, fusionPick];
    }

    const typeRow = document.createElement('div');
    typeRow.className = 'summary-types';
    typeRow.innerHTML = '';
    resultTypes.forEach(typeName => {
    const box = document.createElement('div');
    box.className = 'summary-type-box';
    box.style.backgroundColor = window.typeColors?.[typeName] || '#777';
    box.textContent = typeName;
    typeRow.appendChild(box);
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

    statRow.textContent = `HP: ${finalStats[0]}, Atk: ${finalStats[1]}, Def: ${finalStats[2]}, SpA: ${finalStats[3]}, SpD: ${finalStats[4]}, Spe: ${finalStats[5]}`;
    }
    summaryBox.appendChild(statRow);

    const moveRow = document.createElement('div');
    moveRow.className = 'summary-moves';
    moveNames.forEach(m => {
      const div = document.createElement('div');
      div.textContent = m;
      moveRow.appendChild(div);
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
  pokemonData = typeof window.items !== 'undefined' ? window.items : (typeof items !== 'undefined' ? items : []);
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
        return `<option value="${i}" data-row="${p.row}">${name}</option>`; // ✅ Add data-row here
      }).join('');
    select.onchange = () => {
      const selected = pokemonData[select.value];
      select.dataset.row = selected?.row ?? '';
      onSelect(select.value);
    };
    select.addEventListener('change', updateTeamSummary);
    return select;
  };

  const createMoveDropdown = (pokemon) => {
    const sel = document.createElement('select');
    setTimeout(() => new TomSelect(sel, {
      maxOptions: null,
      render: {
        option: function(data, escape) {
          const isCompatible = pokemon.hasOwnProperty(data.value);
          const color = isCompatible ? '#d4edda' : '#ffeeba';
          return `<div style="background-color:${color}; padding:5px;">${escape(data.text)}</div>`;
          },
        item: function(data, escape) {
          const isCompatible = pokemon.hasOwnProperty(data.value);
          const color = isCompatible ? '#d4edda' : '#ffeeba';
          return `<div style="background-color:${color}; padding:5px;">${escape(data.text)}</div>`;
        }
      }
    }), 0);
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

      const moveDropdown = createMoveDropdown(pokemon);
      observeChanges(moveDropdown);
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'move-checkbox';

      moveWrapper.appendChild(moveDropdown);
      moveWrapper.appendChild(checkbox);
      slot.appendChild(moveWrapper);
    }

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

const renderFusionInfo = (fusionPoke) => {
  slot.dataset.fusionRow = fusionPoke.row;
  fusionContainer.innerHTML = ''; // Clear before rendering
  
  // Image
  const img = document.createElement('img');
  img.src = `images/${fusionPoke.img}_0.png`;
  img.className = 'pokemon-img';
  img.onerror = () => img.style.display = 'none';
  img.onclick = () => {
   renderFusionSelector(slot);
    setTimeout(updateTeamSummary, 10);  // force re-check
  };
  fusionContainer.appendChild(img);

  // Types
  const typeContainer = document.createElement('div');
  typeContainer.className = 'type-container';
  [fusionPoke.t1, fusionPoke.t2].filter(Boolean).forEach(type => {
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
  const abilities = [fusionPoke.a1, fusionPoke.a2, fusionPoke.ha].filter(Boolean);
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

  setTimeout(() => new TomSelect(fusionAbilitySelect, { maxOptions: null }), 0);
};

const renderFusionSelector = (slot) => {
  fusionContainer.innerHTML = '';
  const select = document.createElement('select');
  select.innerHTML = `<option value="">Select Fusion Pokémon</option>` +
  pokemonData.map((p, i) => {
    const name = window.speciesNames?.[p.row] || `#${p.row} - ${p.img}`;
    return `<option value="${i}" data-row="${p.row}">${name}</option>`; // ✅ Add data-row here
  }).join('');
  setTimeout(() => new TomSelect(select, { maxOptions: null }), 0);
  select.onchange = () => {
    const selected = pokemonData[select.value];
    select.dataset.row = selected?.row ?? '';
    renderFusionInfo(selected);
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

const exportTeamToJson = () => {
  const teamData = [];

  document.querySelectorAll('.team-slot').forEach(slot => {
    const baseSelect = slot.querySelector('select');
    const selectedPokemonIndex = parseInt(baseSelect?.value);
    const selectedPokemon = isNaN(selectedPokemonIndex) ? null : pokemonData[selectedPokemonIndex];
    const selectedOption = baseSelect?.selectedOptions?.[0];
    const pokemonRow = selectedOption?.dataset?.row !== undefined ? parseInt(selectedOption.dataset.row) : null;




    const moveSelects = slot.querySelectorAll('.move-select');
    const moveCheckboxes = slot.querySelectorAll('.move-checkbox');
    const moves = Array.from(moveSelects).map((s) => {
      const ts = s.tomselect;
      const val = ts?.getValue();
      return val !== '' ? parseInt(val) : null;
    });

    const baseAbility = slot.querySelector('.ability-select')?.tomselect?.getValue();
    const natureSelect = slot.querySelector('.nature-select');
    const natureCheckbox = slot.querySelector('.nature-checkbox');
    const nature = natureCheckbox?.checked ? natureSelect?.tomselect?.getValue() : null;

    const fusionSelect = slot.querySelector('.fusion-container select');
    const selectedFusionIndex = parseInt(fusionSelect?.value);
    const selectedFusion = isNaN(selectedFusionIndex) ? null : pokemonData[selectedFusionIndex];
    const fusionOption = fusionSelect?.selectedOptions?.[0];
    const fusionRow = fusionOption?.dataset?.row !== undefined ? parseInt(fusionOption.dataset.row) : null;




    const fusionAbility = slot.querySelector('.fusion-ability-select')?.tomselect?.getValue() || null;
    
    console.log({
      pokemonRow,
      fusionRow,
      moves,
      baseAbility,
      fusionAbility,
      nature
    });
    teamData.push({
      pokemon: pokemonRow,
      fusion: fusionRow,
      moves: moves,
      ability: baseAbility ? parseInt(baseAbility) : null,
      fusionAbility: fusionAbility ? parseInt(fusionAbility) : null,
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

// ✅ Basic import logic using .row field matching
async function importTeamData(data) {
  const slots = document.querySelectorAll('.team-slot');

  for (let i = 0; i < data.length; i++) {
    const entry = data[i];
    const slot = slots[i];
    if (!slot || !entry.pokemon) continue;

    const baseIndex = pokemonData.findIndex(p => p.row === entry.pokemon);
    if (baseIndex !== -1) {
      const baseSelect = slot.querySelector('select');
      baseSelect.value = baseIndex;
      baseSelect.dispatchEvent(new Event('change'));
      await new Promise(res => setTimeout(res, 300));
    }

    if (entry.fusion !== null && entry.fusion !== undefined) {
      const fusionIndex = pokemonData.findIndex(p => p.row === entry.fusion);
      if (fusionIndex !== -1) {
        const fusionSelect = slot.querySelector('.fusion-container select');
        fusionSelect.value = fusionIndex;
        fusionSelect.dispatchEvent(new Event('change'));
        await new Promise(res => setTimeout(res, 300));
        const fusionAbilitySelect = slot.querySelector('.fusion-ability-select')?.tomselect;
        if (fusionAbilitySelect && entry.fusionAbility !== null) {
          fusionAbilitySelect.setValue(String(entry.fusionAbility));
        }
      }
    }

    const moveDropdowns = slot.querySelectorAll('.move-select');
    const moveCheckboxes = slot.querySelectorAll('.move-checkbox');
    (entry.moves || []).slice(0, 4).forEach((moveId, idx) => {
      if (moveId !== null) {
        const ts = moveDropdowns[idx]?.tomselect;
        const cb = moveCheckboxes[idx];
        if (ts && cb) {
          ts.setValue(String(moveId));
          cb.checked = true;
        }
      }
    });

    const abilitySelect = slot.querySelector('.ability-select')?.tomselect;
    if (abilitySelect && entry.ability !== null) {
      abilitySelect.setValue(String(entry.ability));
    }

    const natureSelect = slot.querySelector('.nature-select')?.tomselect;
    const natureCheckbox = slot.querySelector('.nature-checkbox');
    if (natureSelect && natureCheckbox && entry.nature) {
      natureCheckbox.checked = true;
      natureSelect.setValue(entry.nature);
    }

    updateTeamSummary();
    await new Promise(res => setTimeout(res, 150));
  }
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
});


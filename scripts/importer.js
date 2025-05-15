// scripts/importer.js
Hooks.once('init', () => {
  console.log('Whale Importer | Initializing module for Foundry V11');
});

// Map raw JSON into CPR system schema
function mapItemData(type, raw) {
  const sys = {};
  // Universal fields
  if (raw.description) sys.description = { value: raw.description, chat: '', unidentified: '' };
  if (raw.price != null) sys.price = { market: raw.price };
  if (raw.category) sys.category = raw.category;
  if (raw.quality) sys.quality = raw.quality;
  if (raw.revealed != null) sys.revealed = !!raw.revealed;
  if (raw.favorite != null) sys.favorite = !!raw.favorite;

  switch (type) {
    case 'weapon': {
      const skillMap = { SMG: 'Handgun', MediumPistol: 'Handgun', HeavyPistol: 'Handgun', AssaultRifle: 'Handgun', SniperRifle: 'Handgun', Shotgun: 'Handgun', Bow: 'Archery', ThrownWeapon: 'Archery', RocketLauncher: 'Heavy Weapon', GrenadeLauncher: 'Heavy Weapon', CombatKnife: 'Melee Weapon', BaseballBat: 'Melee Weapon', Tomahawk: 'Melee Weapon' };
      const ammoMap = { paintball: 'paintball', rifle: 'rifle', arrow: 'arrow', shotgunShell: 'shotgunShell', shotgunSlug: 'shotgunSlug', grenade: 'grenade', heavyPistol: 'heavyPistol', vHeavyPistol: 'vHeavyPistol', medPistol: 'medPistol', battery: 'battery', rocket: 'rocket', customAmmo: 'customAmmo' };
      sys.weapon = {
        attackmod: raw.attackmod || 0,
        rof: raw.rof,
        damage: raw.damage,
        ammoVariety: raw.ammoType ? [ammoMap[raw.ammoType.replace(/\s+/g, '')] || raw.ammoType] : [],
        brand: raw.brand || '',
        concealable: { concealable: !!raw.conceal, isConcealed: false },
        critFailEffect: raw.special || '',
        dvTable: raw.dvTable || '',
        equipped: raw.equipped || 'owned',
        favorite: raw.favorite || false,
        fireModes: { autoFire: raw.autofire || 0, suppressiveFire: !!raw.suppressive },
        handsReq: raw.handsRequired || 1,
        installedItems: { allowed: true, allowedTypes: ['itemUpgrade', 'ammo'], list: [], slots: raw.slots || 0, usedSlots: 0 },
        isRanged: !!raw.isRanged,
        magazine: { max: raw.magazine || 0, value: raw.loadedAmmo || 0 },
        price: { market: raw.price || 0 },
        quality: raw.quality || raw.rarity || 'standard',
        source: raw.source || { book: 'Core', page: 0 },
        unarmedAutomaticCalculation: raw.unarmedAutomaticCalculation ?? true,
        usage: raw.usage || '',
        usesType: raw.usesType || '',
        weaponSkill: skillMap[raw.weaponSkill] || raw.weaponSkill,
        weaponType: raw.weaponType || '',
        description: sys.description
      };
      break;
    }
    case 'armor': {
      sys.armor = {
        bodyLocation: { sp: raw.spBody ?? raw.sp ?? 0, ablation: raw.ablationBody || 0 },
        headLocation: { sp: raw.spHead || 0, ablation: raw.ablationHead || 0 },
        brand: raw.brand || '',
        concealable: { concealable: !!raw.conceal, isConcealed: false },
        equipped: raw.equipped || 'owned',
        favorite: raw.favorite || false,
        installedItems: { allowed: true, allowedTypes: ['itemUpgrade'], list: [], slots: raw.slots || 0, usedSlots: 0 },
        isShield: raw.isShield ?? false,
        shieldHitPoints: { max: raw.shieldMax || 0, value: raw.shieldValue || 0 },
        penalty: raw.penalty || 0,
        price: { market: raw.price || 0 },
        quality: raw.quality || 'standard',
        revealed: raw.revealed ?? true,
        source: raw.source || { book: 'Core', page: 0 },
        usage: raw.usage || ''
      };
      break;
    }
    case 'clothing': {
      sys.clothing = {
        amount: raw.amount || 1,
        brand: raw.brand || '',
        concealable: { concealable: !!raw.conceal, isConcealed: false },
        description: sys.description,
        isElectronic: !!raw.electronic,
        providesHardening: !!raw.providesHardening
      };
      sys.equipped = raw.equipped || 'owned';
      sys.favorite = raw.favorite || false;
      sys.installedItems = { allowed: true, allowedTypes: ['itemUpgrade'], list: [], slots: raw.slots || 0, usedSlots: 0 };
      sys.price = { market: raw.price || 0 };
      sys.quality = raw.quality || 'standard';
      sys.revealed = raw.revealed ?? true;
      sys.source = raw.source || { book: 'Core', page: 0 };
      sys.style = raw.style || raw.category || '';
      sys.type = raw.type || '';
      sys.usage = raw.usage || '';
      break;
    }
    case 'cyberware': {
      sys.cyberware = {
        attackmod: raw.attackmod || 0,
        rof: raw.rof || 0,
        damage: raw.damage || '',
        ammoVariety: raw.ammoType ? [raw.ammoType] : [],
        brand: raw.brand || '',
        concealable: { concealable: !!raw.conceal, isConcealed: false },
        critFailEffect: raw.special || '',
        dvTable: raw.dvTable || '',
        equipped: raw.equipped || 'owned',
        favorite: raw.favorite || false,
        fireModes: { autoFire: raw.autofire || 0, suppressiveFire: !!raw.suppressive },
        handsReq: raw.handsRequired || 1,
        installedItems: { allowed: true, allowedTypes: ['itemUpgrade', 'program'], list: [], slots: raw.slots || 0, usedSlots: 0 },
        isElectronic: !!raw.electronic,
        isRanged: !!raw.isRanged,
        isWeapon: !!raw.isWeapon,
        magazine: { max: raw.magazine || 0, value: raw.loadedAmmo || 0 },
        price: { market: raw.price || 0 },
        providesHardening: !!raw.providesHardening,
        quality: raw.quality || 'standard',
        revealed: raw.revealed ?? true,
        size: raw.size || 0,
        source: raw.source || { book: 'Core', page: 0 },
        usage: raw.usage || '',
        usesType: raw.usesType || '',
        weaponSkill: raw.weaponSkill || '',
        weaponType: raw.weaponType || '',
        description: sys.description
      };
      break;
    }
    case 'upgrade': {
      sys.upgrade = {
        attackmod: raw.attackmod || 0,
        damage: raw.damage || '',
        dvTable: raw.dvTable || '',
        ammoVariety: raw.ammoVariety || [],
        brand: raw.brand || '',
        concealable: { concealable: !!raw.conceal, isConcealed: false },
        description: sys.description,
        equipped: raw.equipped || 'owned',
        favorite: raw.favorite || false,
        fireModes: { autoFire: raw.autofire || 0, suppressiveFire: !!raw.suppressive },
        handsReq: raw.handsRequired || 0,
        installLocation: raw.installLocation || '',
        installedItems: { allowed: true, allowedTypes: ['itemUpgrade'], list: [], slots: raw.slots || 0, usedSlots: 0 },
        isElectronic: !!raw.electronic,
        magazine: { max: raw.magazine || 0, value: raw.loadedAmmo || 0 },
        modifiers: raw.modifiers || {},
        price: { market: raw.price || 0 },
        providesHardening: !!raw.providesHardening,
        quality: raw.quality || 'standard',
        revealed: raw.revealed ?? true,
        rof: raw.rof || 0,
        size: raw.size || 0,
        source: raw.source || { book: 'Core', page: 0 },
        usage: raw.usage || '',
        usesType: raw.usesType || '',
        weaponSkill: raw.weaponSkill || '',
        weaponType: raw.weaponType || ''
      };
      break;
    }
    case 'gear': {
      sys.gear = {
        brand: raw.brand || '',
        concealable: { concealable: !!raw.conceal, isConcealed: false },
        description: sys.description,
        equipped: raw.equipped || 'owned',
        favorite: raw.favorite || false,
        installLocation: raw.installLocation || '',
        installedItems: { allowed: true, allowedTypes: ['itemUpgrade', 'program'], list: [], slots: raw.slots || 0, usedSlots: 0 },
        isElectronic: !!raw.electronic,
        price: { market: raw.price || 0 },
        providesHardening: !!raw.providesHardening,
        quality: raw.quality || 'standard',
        revealed: raw.revealed ?? true,
        size: raw.size || 0,
        source: raw.source || { book: 'Core', page: 0 }
      };
      break;
    }
    case 'drug': {
      sys.drug = { price: { market: raw.price || 0 }, quality: raw.quality || '', duration: raw.duration || '', primaryEffect: raw.primaryEffect || '', secondaryEffect: raw.secondaryEffect || '', addictionDV: raw.addictionDV || 0 }; 
      break;
    }
    case 'program': {
      sys.program = { class: raw.class, attack: raw.attack, effect: raw.effect, muCost: raw.muCost, source: raw.source || { book:'Core', page:0 } };
      break;
    }
    case 'architecture': {
      sys.architecture = { floors: raw.floors || 0, defenses: raw.defenses || [], accessPoints: raw.accessPoints || 0, source: raw.source || { book:'Core', page:0 } };
      break;
    }
    case 'critical': {
      sys.critical = { effect: raw.effect, location: raw.location, source: raw.source || { book:'Core', page:0 } };
      break;
    }
    case 'ammo': {
      sys.ammo = { ammoType: raw.ammoType || '', damageMod: raw.damageMod || '', autofireMod: raw.autofireMod || 0, price: { market: raw.price || 0 }, quantity: raw.quantity || raw.amount || 1 }; 
      break;
    }
    case 'vehicle': {
      sys.vehicle = { sp: raw.sp, hp: raw.hp, crew: raw.crew, passengers: raw.passengers, speed: raw.speed, range: raw.range, source: raw.source || { book:'Core', page:0 } };
      break;
    }
    case 'skill': {
      sys.skill = { stat: raw.stat, description: raw.description, source: raw.source || { book:'Core', page:0 } };
      break;
    }
    case 'role': {
      sys.role = { ability: raw.ability, description: raw.description, source: raw.source || { book:'Core', page:0 } };
      break;
    }
    case 'cyberdeck': {
      sys.cyberdeck = { atk: raw.atk || raw.ATK, def: raw.def || raw.DEF, rez: raw.rezz || raw.REZ, mu: raw.mu, slots: raw.slots, source: raw.source || { book:'Core', page:0 } };
      break;
    }
    default: sys.raw = raw; break;
  }

  return sys;
}

// Add Import button
Hooks.on('renderItemDirectory', (app, html) => {
  const btn = $(`<button class="whale-importer-button" title="Import Whale JSON"><i class="fas fa-file-import"></i> Import Whale JSON</button>`)
    .css({ marginLeft: '8px' })
    .on('click', () => {
      new FilePicker({ type:'data',current:'',title:'Select Whale JSON File',button:'Import',filters:[{label:'JSON Files',extensions:['json']}],callback: async path => {
        if (!path) return;
        try {
          const data = await (await fetch(path)).json();
          await processWhaleJSON(data);
        } catch(e) { ui.notifications.error(`Whale Importer | ${e}`); }
      }}).render(true);
    });
  html.find('.directory-footer').append(btn);
});

// Process and create items
async function processWhaleJSON(data) {
  if (!Array.isArray(data)) return ui.notifications.error('Whale Importer | JSON must be an array.');
  for (const entry of data) {
    if (entry.entityType !== 'Item') continue;
    const { type, name, data: raw } = entry;
    try {
      const sys = mapItemData(type, raw);
      await Item.create({ name, type, system: sys });
      ui.notifications.info(`Whale Importer | Imported ${name}`);
    } catch(err) {
      console.error(err);
      ui.notifications.error(`Whale Importer | Failed ${name}: ${err.message}`);
    }
  }
}

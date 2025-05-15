Hooks.once('init', () => {
  console.log('Whale Importer | Initializing module for Foundry V11');
});

// Utility function mapping raw JSON to system schema
function mapItemData(type, raw) {
  const sys = {};
  // Universal fields
  if (raw.description)       sys.description        = { value: raw.description, chat: '', unidentified: '' };
  if (raw.price != null)     sys.price              = { market: raw.price };
  if (raw.quality)           sys.quality            = raw.quality;
  if (raw.revealed != null)  sys.revealed           = !!raw.revealed;
  if (raw.favorite != null)  sys.favorite           = !!raw.favorite;

  switch (type) {
    case 'weapon': {
      const skillMap = {
        SMG: 'Handgun', MediumPistol: 'Handgun', HeavyPistol: 'Handgun',
        AssaultRifle: 'Handgun', SniperRifle: 'Handgun', Shotgun: 'Handgun',
        Bow: 'Archery', ThrownWeapon: 'Archery',
        RocketLauncher: 'Heavy Weapon', GrenadeLauncher: 'Heavy Weapon',
        CombatKnife: 'Melee Weapon', BaseballBat: 'Melee Weapon', Tomahawk: 'Melee Weapon'
      };
      const ammoMap = {
        paintball: 'paintball', rifle: 'rifle', arrow: 'arrow', shotgunShell: 'shotgunShell',
        shotgunSlug: 'shotgunSlug', grenade: 'grenade', heavyPistol: 'heavyPistol',
        vHeavyPistol: 'vHeavyPistol', medPistol: 'medPistol', battery: 'battery',
        rocket: 'rocket', customAmmo: 'customAmmo'
      };
      sys.brand      = raw.brand || '';
      sys.weaponType = raw.weaponType;
      sys.weaponSkill= skillMap[raw.weaponSkill] || raw.weaponSkill;
      sys.isRanged   = !!raw.isRanged;
      sys.handsReq   = raw.handsRequired ?? 1;
      sys.rof        = raw.rof;
      sys.damage     = raw.damage;
      sys.magazine   = { max: raw.magazine || 0, value: raw.loadedAmmo || 0 };
      sys.ammoVariety= raw.ammoType ? [ammoMap[raw.ammoType] || raw.ammoType] : [];
      sys.attackmod  = raw.attackmod || 0;
      sys.concealable= { concealable: !!raw.conceal, isConcealed: false };
      sys.fireModes  = { autoFire: raw.autofire || 0, suppressiveFire: !!raw.suppressive };
      sys.dvTable    = raw.dvTable || '';
      sys.attachments= raw.attachments || [];
      sys.usage      = raw.usage || '';
      sys.special    = raw.special || '';
      sys.slots      = raw.slots || 0;
      sys.source     = raw.source || { book: '', page: 0 };
      break;
    }
    // Additional cases (armor, clothing, etc.) would mirror this pattern
    default: {
      // Fallback: assign all raw properties into sys for non-weapon
      Object.assign(sys, raw);
      break;
    }
  }
  return sys;
}

// Add Import button in Items directory
Hooks.on('renderItemDirectory', (app, html) => {
  const importBtn = $(
    `<button class="whale-importer-button" title="Import Whale JSON">
       <i class="fas fa-file-import"></i> Import Whale JSON
     </button>`
  ).css({ marginLeft: '8px' });

  importBtn.on('click', () => {
    new FilePicker({
      type: 'data', current: '', title: 'Select Whale JSON File', button: 'Import',
      filters: [{ label: 'JSON Files', extensions: ['json'] }],
      callback: async (path) => {
        if (!path) return;
        try {
          const json = await (await fetch(path)).json();
          await processWhaleJSON(json);
        } catch (err) {
          console.error(err);
          ui.notifications.error(`Whale Importer | ${err.message}`);
        }
      }
    }).render(true);
  });

  html.find('.directory-footer').append(importBtn);
});

/**
 * Process raw JSON array and create items
 * @param {Array} data
 */
async function processWhaleJSON(data) {
  if (!Array.isArray(data)) return ui.notifications.error('Whale Importer | JSON must be an array.');

  for (const entry of data) {
    if (entry.entityType !== 'Item') continue;
    const { type, name, data: raw } = entry;
    try {
      const sysData = mapItemData(type, raw);
      await Item.create({ name, type, system: sysData });
      ui.notifications.info(`Whale Importer | Imported ${name}`);
    } catch (err) {
      console.error(err);
      ui.notifications.error(`Whale Importer | Failed ${name}: ${err.message}`);
    }
  }
}
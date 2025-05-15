Hooks.once('init', () => {
  console.log('Whale Importer | Initializing module for Foundry V11');
});

Hooks.on('renderItemDirectory', (app, html) => {
  const btn = $(
    `<button class="whale-importer-button" title="Import Whale JSON">
       <i class="fas fa-file-import"></i> Import JSON
     </button>`
  );
  btn.css({ marginLeft: '8px' });
  btn.on('click', () => {
    new FilePicker({
      type: 'data',
      current: '',
      title: 'Select Whale JSON File',
      button: 'Import',
      filters: [{ label: 'JSON Files', extensions: ['json'] }],
      callback: (path) => {
        if (!path) return;
        fetch(path)
          .then(r => r.json())
          .then(json => processWhaleJSON(json))
          .catch(err => ui.notifications.error(`Whale Importer | ${err}`));
      }
    }).render(true);
  });
  html.find('.directory-footer').append(btn);
});

async function processWhaleJSON(data) {
  if (!Array.isArray(data)) return ui.notifications.error('Whale Importer | JSON must be an array.');

  for (const entry of data) {
    if (entry.entityType !== 'Item') continue;
    const { type, name, data: d } = entry;
    if (!type || !name || !d) continue;
    try {
      // Create item with minimal system payload
      const created = await Item.create({ name, type, system: {} });

      // Prepare update object for nested fields
      const u = {};
      // Copy all flat properties
      for (const [k, v] of Object.entries(d)) {
        // Map common simple Text and boolean fields directly
        const direct = ['brand','special','quality','weaponType','weaponSkill','dvTable','usage','source','slots','attachments'];
        if (direct.includes(k) && v !== undefined) u[`system.${k}`] = v;
      }
      if (type === 'weapon') {
        // Numeric fields with .value
        const numFields = ['price','magazine','loadedAmmo','handsRequired','rof','attackmod'];
        numFields.forEach(f => {
          if (d[f] !== undefined) u[`system.${f}.value`] = d[f];
        });
        // Concealment
        if (d.conceal !== undefined) u['system.concealable.concealable'] = d.conceal;
        // Fire modes
        if (d.autofire !== undefined) u['system.fireModes.autoFire'] = d.autofire;
        if (d.suppressive !== undefined) u['system.fireModes.suppressiveFire'] = d.suppressive;
        // Ammo type
        if (d.ammoType) u['system.ammoType'] = d.ammoType;
      }

      // Apply patch
      await created.update(u);
      ui.notifications.info(`Whale Importer | Imported ${name}`);
    } catch (err) {
      console.error(err);
      ui.notifications.error(`Whale Importer | Failed ${name}: ${err.message}`);
    }
  }
}

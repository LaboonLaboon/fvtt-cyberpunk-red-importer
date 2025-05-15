Hooks.once('init', () => {
  console.log('Whale Importer | Initializing module for Foundry V11');
});

Hooks.on('renderItemDirectory', (app, html) => {
  // Add Import button to the Items Directory
  const importButton = $(
    `<button class="whale-importer-button" title="Import items from Whale JSON">
       <i class="fas fa-file-import"></i> Import Whale JSON
     </button>`
  );
  importButton.css({ marginLeft: '8px' });
  importButton.on('click', () => {
    new FilePicker({
      type: 'data',
      current: '',
      title: 'Select Whale JSON File',
      button: 'Import',
      filters: [{ label: 'JSON Files', extensions: ['json'] }],
      callback: async (path) => {
        if (!path) return;
        try {
          const response = await fetch(path);
          const jsonData = await response.json();
          await processWhaleJSON(jsonData);
        } catch (err) {
          console.error(err);
          ui.notifications.error(`Whale Importer | ${err.message}`);
        }
      }
    }).render(true);
  });
  html.find('.directory-footer').append(importButton);
});

/**
 * Iterate over Whale JSON entries and create Foundry items using both `system` and `data` keys for maximum compatibility.
 * @param {Array} data - Parsed JSON array from The Whale Importer GPT
 */
async function processWhaleJSON(data) {
  if (!Array.isArray(data)) {
    return ui.notifications.error('Whale Importer | JSON must be an array.');
  }
  for (const entry of data) {
    if (entry.entityType !== 'Item') continue;
    const { type, name, data: itemData } = entry;
    if (!type || !name || !itemData) continue;
    try {
      // Build a payload that sets both `system` and `data` to the imported values
      const payload = { name, type };
      payload.system = duplicate(itemData);
      payload.data   = duplicate(itemData);

      // Create the item
      const created = await Item.create(payload);
      console.log('Whale Importer | Created item system data:', created.system);

      ui.notifications.info(`Whale Importer | Imported ${name}`);
    } catch (err) {
      console.error(err);
      ui.notifications.error(`Whale Importer | Failed to import ${name}: ${err.message}`);
    }
  }
}

/**
 * Utility to deep-clone an object (to avoid sharing references)
 */
function duplicate(obj) {
  return JSON.parse(JSON.stringify(obj));
}

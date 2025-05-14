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
  importButton.on('click', async () => {
    try {
      const fp = await FilePicker.prompt({
        type: 'data',
        current: '',
        label: 'Select Whale JSON File',
        button: 'Import',
        wildcards: ['*.json']
      });
      if (!fp) return;
      const response = await fetch(fp);
      const jsonData = await response.json();
      await processWhaleJSON(jsonData);
    } catch (err) {
      console.error(err);
      ui.notifications.error(`Whale Importer | ${err.message}`);
    }
  });
  html.find('.directory-footer').append(importButton);
});

/**
 * Iterate over Whale JSON entries and create Foundry items using the system data model
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
      // Build item payload compatible with Foundry V11 (system property)
      const itemPayload = {
        name,
        type,
        system: itemData
      };
      await Item.create(itemPayload);
      ui.notifications.info(`Whale Importer | Imported ${name}`);
    } catch (err) {
      console.error(err);
      ui.notifications.error(`Whale Importer | Failed to import ${name}: ${err.message}`);
    }
  }
}

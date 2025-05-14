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
      },
      title: 'Select Whale JSON File',
      button: 'Import',
      filters: {
        json: ['json']
      }
    }).render(true);
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

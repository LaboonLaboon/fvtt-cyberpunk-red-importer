// scripts/importer.js
Hooks.once('init', () => {
  console.log('Whale Importer | Initializing module for Foundry V11');
});

/**
 * Deep clone an object to avoid mutating the original
 */
function duplicate(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Map raw JSON into the CPR V11 system schema
 * Assumes raw data keys exactly match the schema definitions in json-instructions.yml
 */
function mapItemData(type, raw) {
  return duplicate(raw);
}

/**
 * Handle JSON import (array or single object)
 */
async function importJSON(data) {
  const entries = Array.isArray(data) ? data : [data];
  for (const entry of entries) {
    if (entry.entityType !== 'Item') continue;
    const { type, name, img, data: raw } = entry;
    try {
      const sys = mapItemData(type, raw);
      await Item.create({ name, type, img: img || undefined, system: sys });
      ui.notifications.info(`Whale Importer | Imported ${name}`);
    } catch (err) {
      console.error(err);
      ui.notifications.error(`Whale Importer | Failed ${name}: ${err.message}`);
    }
  }
}

// Add Import button to the Item Directory
Hooks.on('renderItemDirectory', (app, html) => {
  const btn = $(
    `<button class="whale-importer-button" title="Import Whale JSON">
       <i class="fas fa-file-import"></i> Import Whale JSON
     </button>`
  ).css({ marginLeft: '8px' });

  btn.on('click', () => {
    new Dialog({
      title: 'Import Whale JSON',
      content: `
        <div>
          <p>Paste JSON below or <button type="button" id="filepick-btn">Select .json File</button>:</p>
          <textarea id="whale-json-input" style="width:100%;height:200px;"></textarea>
        </div>
      `,
      buttons: {
        upload: {
          icon: '<i class="fas fa-file-import"></i>',
          label: 'Import Paste',
          callback: html => {
            const text = html.find('#whale-json-input').val();
            try {
              const data = JSON.parse(text);
              importJSON(data);
            } catch (e) {
              ui.notifications.error(`Invalid JSON: ${e.message}`);
            }
          }
        },
        cancel: { label: 'Cancel' }
      },
      render: dlg => {
        // File pick handler
        dlg.find('#filepick-btn').on('click', () => {
          new FilePicker({
            type: 'data', current: '', title: 'Select Whale JSON File', button: 'Select',
            filters: [{ label: 'JSON Files', extensions: ['json'] }],
            callback: async path => {
              if (!path) return;
              try {
                const data = await (await fetch(path)).json();
                importJSON(data);
                dlg.close();
              } catch (e) {
                ui.notifications.error(`Whale Importer | ${e.message}`);
              }
            }
          }).render(true);
        });
      },
      default: 'upload'
    }).render(true);
  });

  html.find('.directory-footer').append(btn);
});

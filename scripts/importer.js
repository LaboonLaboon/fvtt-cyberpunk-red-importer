export function registerImporter() {
  // Add a button to the Actors directory header
  const dir = ui.actors;
  const header = dir.element.find('.directory-header')[0];
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.innerHTML = '<i class="fas fa-file-import"></i> JSON Import';
  btn.addEventListener('click', () => new ImportDialog().render(true));
  header.append(btn);
}

class ImportDialog extends Dialog {
  constructor() {
    super({
      title: 'Import Cyberpunk RED Statblocks',
      content: `<form>
        <div class="form-group">
          <label>Paste JSON:</label>
          <textarea name="json" style="width:100%;height:200px"></textarea>
        </div>
      </form>`,
      buttons: {
        import: { label: 'Import', callback: html => this._onImport(html) },
        cancel: { label: 'Cancel' }
      }
    });
  }

  async _onImport(html) {
    const raw = html.find('[name=json]').val();
    let data;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      return ui.notifications.error('Invalid JSON');
    }
    if (!Array.isArray(data)) data = [data];

    for (const entry of data) {
      const { entityType, type, name, img, data: payload } = entry;
      const createData = { name, type, img, data: payload };
      switch (entityType) {
        case 'Item':
          await Item.create(createData, { temporary: false });
          break;
        case 'Actor':
          await Actor.create(createData, { temporary: false });
          break;
        case 'RollTable':
          await RollTable.create(createData, { temporary: false });
          break;
        default:
          console.warn('Unknown entityType:', entityType);
      }
    }
    ui.notifications.info(`Imported ${data.length} entries`);
  }
}
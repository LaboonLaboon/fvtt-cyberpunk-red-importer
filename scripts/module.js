import { registerImporter } from './importer.js';

Hooks.once('init', () => {
  console.log('Cyberpunk RED Importer | Initializing');
});

Hooks.once('ready', () => {
  if (game.system.id !== 'cyberpunk-red-core') return;
  registerImporter();
});
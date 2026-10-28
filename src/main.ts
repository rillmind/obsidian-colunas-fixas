import { Notice, Plugin } from 'obsidian';
import { renderizarTudo, restaurar } from './renderizador';

// column-height/column-wrap chegaram no Chromium 145; o Electron vem do
// instalador do Obsidian, não do app, então minAppVersion não garante isso.
const CLASSE = 'colunas-fixas';

export default class ColunasFixas extends Plugin {
	onload() {
		if (!CSS.supports('column-wrap', 'wrap')) {
			new Notice('Colunas fixas: this Obsidian installation does not support CSS column wrapping. Update the Obsidian installer to use this plugin.');
			return;
		}

		document.body.addClass(CLASSE);
		this.register(() => {
			document.body.removeClass(CLASSE);
			restaurar(this.app.workspace);
		});

		this.app.workspace.onLayoutReady(() => renderizarTudo(this.app.workspace));
		this.registerEvent(this.app.workspace.on('layout-change', () => renderizarTudo(this.app.workspace)));
	}
}

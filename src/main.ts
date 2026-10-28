import { Notice, Plugin } from 'obsidian';
import { AbaConfiguracoes, Configuracoes, PADRAO } from './configuracoes';
import { renderizarTudo, restaurar } from './renderizador';

// column-height/column-wrap chegaram no Chromium 145; o Electron vem do
// instalador do Obsidian, não do app, então minAppVersion não garante isso.
const CLASSE = 'colunas-fixas';

export default class ColunasFixas extends Plugin {
	configuracoes: Configuracoes = { ...PADRAO };

	async onload() {
		if (!CSS.supports('column-wrap', 'wrap')) {
			new Notice('Colunas fixas: this Obsidian installation does not support CSS column wrapping. Update the Obsidian installer to use this plugin.');
			return;
		}

		this.configuracoes = { ...PADRAO, ...(await this.loadData() as Partial<Configuracoes> | null) };
		this.addSettingTab(new AbaConfiguracoes(this.app, this));

		this.addCommand({
			id: 'toggle-columns',
			name: 'Toggle columns in reading view',
			callback: () => this.definirAtivo(!this.configuracoes.ativo),
		});

		this.register(() => this.desligar());
		this.app.workspace.onLayoutReady(() => this.aplicar());
		this.registerEvent(this.app.workspace.on('layout-change', () => {
			if (this.configuracoes.ativo) renderizarTudo(this.app.workspace);
		}));
	}

	async definirAtivo(ativo: boolean) {
		this.configuracoes.ativo = ativo;
		await this.salvar();
	}

	async salvar() {
		await this.saveData(this.configuracoes);
		this.aplicar();
	}

	private aplicar() {
		if (!this.configuracoes.ativo) {
			this.desligar();
			return;
		}
		const c = this.configuracoes;
		document.body.setCssProps({
			'--colunas-fixas-quantidade': String(c.colunas),
			'--colunas-fixas-espaco': `${c.espaco}rem`,
			'--colunas-fixas-margem': `${c.margem}rem`,
		});
		document.body.addClass(CLASSE);
		renderizarTudo(this.app.workspace);
	}

	private desligar() {
		document.body.removeClass(CLASSE);
		document.body.setCssProps({
			'--colunas-fixas-quantidade': '',
			'--colunas-fixas-espaco': '',
			'--colunas-fixas-margem': '',
		});
		restaurar(this.app.workspace);
	}
}

import { App, PluginSettingTab, Setting } from 'obsidian';
import type ColunasFixas from './main';

export interface Configuracoes {
	ativo: boolean;
	colunas: number;
	// em rem
	espaco: number;
	margem: number;
}

export const PADRAO: Configuracoes = {
	ativo: true,
	colunas: 2,
	espaco: 3,
	margem: 2,
};

export class AbaConfiguracoes extends PluginSettingTab {
	constructor(app: App, private plugin: ColunasFixas) {
		super(app, plugin);
	}

	display(): void {
		const { containerEl } = this;
		const c = this.plugin.configuracoes;
		containerEl.empty();

		new Setting(containerEl)
			.setName('Enable columns')
			.setDesc('Lay out reading view in columns. Also available as a command.')
			.addToggle((t) => t.setValue(c.ativo).onChange(async (v) => {
				await this.plugin.definirAtivo(v);
			}));

		new Setting(containerEl)
			.setName('Number of columns')
			.addSlider((s) => s.setLimits(1, 4, 1).setValue(c.colunas).onChange(async (v) => {
				c.colunas = v;
				await this.plugin.salvar();
			}));

		new Setting(containerEl)
			.setName('Column gap')
			.setDesc('Space between columns, in rem.')
			.addSlider((s) => s.setLimits(0, 6, 0.5).setValue(c.espaco).onChange(async (v) => {
				c.espaco = v;
				await this.plugin.salvar();
			}));

		new Setting(containerEl)
			.setName('Vertical margin')
			.setDesc('Space above and below each screen of columns, in rem.')
			.addSlider((s) => s.setLimits(0, 6, 0.5).setValue(c.margem).onChange(async (v) => {
				c.margem = v;
				await this.plugin.salvar();
			}));
	}
}

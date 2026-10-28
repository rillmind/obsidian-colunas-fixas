import { MarkdownView, Workspace } from 'obsidian';

// O modo de leitura só desenha os trechos perto da tela e vai trocando-os ao
// rolar; com colunas, cada troca reorganiza a página inteira. Ampliando a
// margem de pré-renderização do renderizador, a nota é desenhada toda de uma
// vez e o layout fica fixo.
//
// Esses campos são da API interna do Obsidian (não constam em obsidian.d.ts),
// por isso todo acesso confere se eles existem antes de mexer.
interface RenderizadorInterno {
	renderExtra: number;
	renderExtraMinPx: number;
	updateVirtualDisplay?: () => void;
}

interface Margens {
	renderExtra: number;
	renderExtraMinPx: number;
}

const TUDO: Margens = { renderExtra: 1e9, renderExtraMinPx: 1e9 };

// valores de cada renderizador antes da alteração, para restaurar depois
const originais = new WeakMap<RenderizadorInterno, Margens>();

function renderizador(view: MarkdownView): RenderizadorInterno | null {
	const r = (view.previewMode as unknown as { renderer?: Partial<RenderizadorInterno> }).renderer;
	if (!r || typeof r.renderExtra !== 'number' || typeof r.renderExtraMinPx !== 'number') return null;
	return r as RenderizadorInterno;
}

function definir(r: RenderizadorInterno, m: Margens): void {
	r.renderExtra = m.renderExtra;
	r.renderExtraMinPx = m.renderExtraMinPx;
	r.updateVirtualDisplay?.();
}

function paraCadaRenderizador(workspace: Workspace, fn: (r: RenderizadorInterno) => void): void {
	for (const leaf of workspace.getLeavesOfType('markdown')) {
		if (!(leaf.view instanceof MarkdownView)) continue;
		const r = renderizador(leaf.view);
		if (r) fn(r);
	}
}

export function renderizarTudo(workspace: Workspace): void {
	paraCadaRenderizador(workspace, (r) => {
		if (originais.has(r)) return;
		originais.set(r, { renderExtra: r.renderExtra, renderExtraMinPx: r.renderExtraMinPx });
		definir(r, TUDO);
	});
}

export function restaurar(workspace: Workspace): void {
	paraCadaRenderizador(workspace, (r) => {
		const m = originais.get(r);
		if (!m) return;
		originais.delete(r);
		definir(r, m);
	});
}

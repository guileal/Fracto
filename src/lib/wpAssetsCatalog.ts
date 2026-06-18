import type { ShowcaseKind } from './showcaseKinds'

export type { ShowcaseKind } from './showcaseKinds'

export type WpAssetCategory = '3d-background' | '3d-object' | 'ui-transition'

export interface WpAssetCatalogEntry {
  assetId: string
  kind: ShowcaseKind
  badge: string
  title: string
  description: string
  previewTo: string
  theme: 'dark' | 'light'
  category: WpAssetCategory
  shortcode: string
  vcName: string
  rowClass?: string
  bundlePath: string
  whenToUse: string
  placement: string
  wpbakerySteps: string[]
  supportsRowBackground: boolean
}

const rowBgHint =
  'Ou, na row: aba Background → Fracto — Fundo da marca, ou classe CSS em Advanced → Extra Class Name.'

export const WP_ASSETS_CATALOG: WpAssetCatalogEntry[] = [
  {
    assetId: 'background-grid-black',
    kind: 'grid-dark',
    badge: 'Fundo 3D',
    title: 'Grid preto',
    description:
      'Grade interactiva em fundo preto — os cubos reagem à luz do cursor. Ideal para heroes e secções de destaque.',
    previewTo: '/grid-background-black',
    theme: 'dark',
    category: '3d-background',
    shortcode: '[fracto3d_grid]',
    vcName: 'Background 3D (Fracto)',
    rowClass: 'fracto-background-grid-black',
    bundlePath: 'assets/3d/background-grid-black/',
    whenToUse: 'Hero ou row a preto com movimento subtil e sensação tecnológica.',
    placement: 'Fundo de uma row WPBakery (texto e botões por cima).',
    wpbakerySteps: [
      'Add Element → Fracto Widgets → Background 3D (Fracto)',
      'Ou shortcode num bloco Raw HTML / Text Block',
      rowBgHint,
    ],
    supportsRowBackground: true,
  },
  {
    assetId: 'logo-01-black',
    kind: 'logo-black',
    badge: 'Isotipo 3D',
    title: 'Logo Fracto',
    description:
      'Isotipo 3D animado — cubos pretos com accent coral. A assinatura visual da marca em movimento.',
    previewTo: '/logo-fracto',
    theme: 'light',
    category: '3d-object',
    shortcode: '[fracto3d_logo]',
    vcName: 'Objeto 3D (Logo)',
    rowClass: 'fracto-logo-01-black',
    bundlePath: 'assets/3d/logo-01-black/',
    whenToUse: 'Secção Sobre nós, manifesto ou bloco institucional em fundo claro.',
    placement: 'Coluna ao lado do texto ou centrado numa row dedicada.',
    wpbakerySteps: [
      'Add Element → Fracto Widgets → Objeto 3D (Logo)',
      'Use numa row de duas colunas: texto + logo',
      rowBgHint,
    ],
    supportsRowBackground: true,
  },
  {
    assetId: 'logo-01-light',
    kind: 'logo-light',
    badge: 'Isotipo 3D',
    title: 'Logo Fracto (claro)',
    description:
      'Mesma animação com cubos cinza claro — pensado para fundos escuros e alto contraste.',
    previewTo: '/logo-fracto-light',
    theme: 'dark',
    category: '3d-object',
    shortcode: '[fracto3d_logo_light]',
    vcName: 'Objeto 3D (Logo claro)',
    rowClass: 'fracto-logo-01-light',
    bundlePath: 'assets/3d/logo-01-light/',
    whenToUse: 'Blocos pretos ou escuros onde o isotipo preto não se lê.',
    placement: 'Ao lado de copy em rows escuras.',
    wpbakerySteps: [
      'Add Element → Fracto Widgets → Objeto 3D (Logo claro)',
      rowBgHint,
    ],
    supportsRowBackground: true,
  },
  {
    assetId: 'magic-cube-v8',
    kind: 'cube-v1',
    badge: 'Cubo mágico',
    title: 'Cubo mágico v1',
    description:
      'Metáfora da desconstrução — o isotipo fragmenta-se e recomõe. Narrativa de estratégia e clareza.',
    previewTo: '/cubo-magico',
    theme: 'light',
    category: '3d-object',
    shortcode: '[fracto3d_magic_cube]',
    vcName: 'Cubo Mágico 3D (Fracto)',
    rowClass: 'fracto-magic-cube-v8',
    bundlePath: 'assets/3d/magic-cube-v8/',
    whenToUse: 'Hero editorial ou Sobre nós com storytelling forte em fundo claro.',
    placement: 'Metade da row (canvas 3D) com texto na outra metade.',
    wpbakerySteps: [
      'Add Element → Fracto Widgets → Cubo Mágico 3D (Fracto)',
      'Combine com título e parágrafo na coluna adjacente',
      rowBgHint,
    ],
    supportsRowBackground: true,
  },
  {
    assetId: 'magic-cube-v2',
    kind: 'cube-v2',
    badge: 'Cubo mágico',
    title: 'Cubo mágico v2',
    description:
      'Versão mais dinâmica — giros, fragmentos e pausa até a essência voltar ao centro.',
    previewTo: '/cubo-magico-2',
    theme: 'light',
    category: '3d-object',
    shortcode: '[fracto3d_magic_cube_v2]',
    vcName: 'Cubo Mágico 3D v2 (Fracto)',
    rowClass: 'fracto-magic-cube-v2',
    bundlePath: 'assets/3d/magic-cube-v2/',
    whenToUse: 'Quando quiser mais movimento e ritmo que a v1.',
    placement: 'Igual à v1 — row split com copy.',
    wpbakerySteps: [
      'Add Element → Fracto Widgets → Cubo Mágico 3D v2 (Fracto)',
      rowBgHint,
    ],
    supportsRowBackground: true,
  },
  {
    assetId: 'magic-cube-v8-light',
    kind: 'cube-v1-light',
    badge: 'Cubo mágico',
    title: 'Cubo mágico v1 (claro)',
    description: 'Mesma narrativa da v1 para fundos escuros — cubos #cfcfcf.',
    previewTo: '/cubo-magico-light',
    theme: 'dark',
    category: '3d-object',
    shortcode: '[fracto3d_magic_cube_v8_light]',
    vcName: 'Cubo Mágico 3D claro (Fracto)',
    rowClass: 'fracto-magic-cube-v8-light',
    bundlePath: 'assets/3d/magic-cube-v8-light/',
    whenToUse: 'Sobre nós ou manifesto em row preta.',
    placement: 'Split row em fundo escuro.',
    wpbakerySteps: [
      'Add Element → Fracto Widgets → Cubo Mágico 3D claro (Fracto)',
      rowBgHint,
    ],
    supportsRowBackground: true,
  },
  {
    assetId: 'magic-cube-v2-light',
    kind: 'cube-v2-light',
    badge: 'Cubo mágico',
    title: 'Cubo mágico v2 (claro)',
    description: 'v2 com cubos claros — Inteligência Criativa em contraste invertido.',
    previewTo: '/cubo-magico-light-2',
    theme: 'dark',
    category: '3d-object',
    shortcode: '[fracto3d_magic_cube_v2_light]',
    vcName: 'Cubo Mágico 3D v2 claro (Fracto)',
    rowClass: 'fracto-magic-cube-v2-light',
    bundlePath: 'assets/3d/magic-cube-v2-light/',
    whenToUse: 'Variante escura da narrativa v2.',
    placement: 'Row escura, layout split.',
    wpbakerySteps: [
      'Add Element → Fracto Widgets → Cubo Mágico 3D v2 claro (Fracto)',
      rowBgHint,
    ],
    supportsRowBackground: true,
  },
  {
    assetId: 'block-divider',
    kind: 'block-divider',
    badge: 'Transição',
    title: 'Divisor de blocos',
    description:
      'Faixa pixelada entre hero preto e conteúdo branco — os blocos formam com piscar tech ao fazer scroll.',
    previewTo: '/block-divider',
    theme: 'light',
    category: 'ui-transition',
    shortcode: '[fracto_block_divider variant="default"]',
    vcName: 'Divisor de blocos (Fracto)',
    bundlePath: 'assets/ui/block-divider/',
    whenToUse: 'Transição visual entre hero escuro e secção clara — como no site fracto.com.br.',
    placement: 'Entre a row do hero (preto) e a primeira row de conteúdo (branco).',
    wpbakerySteps: [
      'Add Element → Fracto Widgets → Divisor de blocos (Fracto)',
      'Escolha a variante: Padrão, Invertido, Esparso ou Denso',
      'Não precisa de fundo 3D — é um elemento próprio entre duas rows',
    ],
    supportsRowBackground: false,
  },
]

export const WP_ASSET_COUNT = WP_ASSETS_CATALOG.length

export function getWpAssetById(id: string): WpAssetCatalogEntry | undefined {
  return WP_ASSETS_CATALOG.find((a) => a.assetId === id)
}

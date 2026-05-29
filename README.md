# Fracto

Projeto Vue 3 + Three.js.

## Rotas

- `/` — **Índice** com links para todas as páginas
- `/landing` — **Landing** fracto.br (hero 3D em cubos + seções Sobre / Trabalho / Serviços)
- `/v2` — Landing transparente (sem grade/caixa no 3D + background customizável no header)
- `/v3` — Landing com parede de quadrados (`InstancedMesh`, mouse + onda senoidal, fundo preto)
- `/viewer` — Scroll **scruba** timeline **Summary** (todas as keyframes do GLB)
- `/iridescent` — Demo de material iridescente

## Desenvolvimento

```bash
npm install
npm run dev
```

## Deploy na Vercel

O projeto é uma SPA Vue 3 + Vite. A Vercel detecta o framework automaticamente; o `vercel.json` na raiz garante rewrites para o `vue-router` (modo history) e cache longo para assets estáticos e modelos GLB.

1. Faça push do repositório para o GitHub, GitLab ou Bitbucket.
2. Em [vercel.com/new](https://vercel.com/new), importe o repositório.
3. Confirme as configurações (já definidas no `vercel.json`):
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
4. Clique em **Deploy**.

Para deploy via CLI:

```bash
npm i -g vercel
vercel
```

Preview local do build de produção:

```bash
npm run build
npm run preview
```

## Blender → scroll

1. Suas keyframes na timeline do Blender (action **`Summary`** ou export completo).
2. Exporte **glTF 2.0 (.glb)** com **Animation** ativo.
3. O viewer usa: clip `Summary` → ou um único clip → ou **união de todos os clips** do arquivo.
4. Em `HomePage.vue`, ajuste `keyframe` (0–1) de cada seção para alinhar com o Summary.

```ts
{ id: 'step-2', keyframe: 0.45 } // 45% da timeline
```

O scroll interpola entre esses pontos — uma timeline só, sem trocar animation por animation.

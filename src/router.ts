import { createRouter, createWebHistory } from 'vue-router'
import IndexPage from './pages/IndexPage.vue'
import GridBackgroundBlackPage from './pages/GridBackgroundBlackPage.vue'
import GridBackgroundWhitePage from './pages/GridBackgroundWhitePage.vue'
import LogoFractoPage from './pages/LogoFractoPage.vue'
import LogoFractoLightPage from './pages/LogoFractoLightPage.vue'
import CuboMagicoPage from './pages/CuboMagicoPage.vue'
import CuboMagico2Page from './pages/CuboMagico2Page.vue'
import LandingPage from './pages/backup/LandingPage.vue'
import LandingPageV2 from './pages/backup/LandingPageV2.vue'
import LandingPageV3 from './pages/backup/LandingPageV3.vue'
import LandingPageV4 from './pages/backup/LandingPageV4.vue'
import LandingPageV6 from './pages/backup/LandingPageV6.vue'
import HomePage from './pages/backup/HomePage.vue'
import IridescentPage from './pages/backup/IridescentPage.vue'

const bare = { bare: true } as const

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'index', component: IndexPage, meta: bare },

    // Preview dos widgets WordPress (fonte activa)
    { path: '/grid-background-black', name: 'grid-background-black', component: GridBackgroundBlackPage, meta: bare },
    { path: '/grid-background-white', name: 'grid-background-white', component: GridBackgroundWhitePage, meta: bare },
    { path: '/logo-fracto', name: 'logo-fracto', component: LogoFractoPage, meta: bare },
    { path: '/logo-fracto-light', name: 'logo-fracto-light', component: LogoFractoLightPage, meta: bare },
    { path: '/cubo-magico', name: 'cubo-magico', component: CuboMagicoPage, meta: bare },
    { path: '/cubo-magico-2', name: 'cubo-magico-2', component: CuboMagico2Page, meta: bare },

    // Redirecionamentos das rotas antigas
    { path: '/v5', redirect: '/grid-background-black' },
    { path: '/background-grid-light', redirect: '/grid-background-white' },
    { path: '/v7', redirect: '/logo-fracto' },
    { path: '/v8', redirect: '/cubo-magico' },

    // Backup — protótipos e ferramentas
    { path: '/backup/landing', name: 'backup-landing', component: LandingPage, meta: bare },
    { path: '/backup/v2', name: 'backup-v2', component: LandingPageV2, meta: bare },
    { path: '/backup/v3', name: 'backup-v3', component: LandingPageV3, meta: bare },
    { path: '/backup/v4', name: 'backup-v4', component: LandingPageV4, meta: bare },
    { path: '/backup/v6', name: 'backup-v6', component: LandingPageV6, meta: bare },
    { path: '/backup/viewer', name: 'backup-viewer', component: HomePage, meta: bare },
    { path: '/backup/iridescent', name: 'backup-iridescent', component: IridescentPage, meta: bare },

    { path: '/landing', redirect: '/backup/landing' },
    { path: '/v2', redirect: '/backup/v2' },
    { path: '/v3', redirect: '/backup/v3' },
    { path: '/v4', redirect: '/backup/v4' },
    { path: '/v6', redirect: '/backup/v6' },
    { path: '/viewer', redirect: '/backup/viewer' },
    { path: '/iridescent', redirect: '/backup/iridescent' },
  ],
})

export default router

import { createRouter, createWebHistory } from 'vue-router'
import IndexPage from './pages/IndexPage.vue'
import LandingPage from './pages/LandingPage.vue'
import LandingPageV2 from './pages/LandingPageV2.vue'
import LandingPageV3 from './pages/LandingPageV3.vue'
import LandingPageV4 from './pages/LandingPageV4.vue'
import LandingPageV5 from './pages/LandingPageV5.vue'
import LandingPageV6 from './pages/LandingPageV6.vue'
import HomePage from './pages/HomePage.vue'
import IridescentPage from './pages/IridescentPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'index', component: IndexPage, meta: { bare: true } },
    { path: '/landing', name: 'landing', component: LandingPage, meta: { bare: true } },
    { path: '/v2', name: 'landing-v2', component: LandingPageV2, meta: { bare: true } },
    { path: '/v3', name: 'landing-v3', component: LandingPageV3, meta: { bare: true } },
    { path: '/v4', name: 'landing-v4', component: LandingPageV4, meta: { bare: true } },
    { path: '/v5', name: 'landing-v5', component: LandingPageV5, meta: { bare: true } },
    { path: '/v6', name: 'landing-v6', component: LandingPageV6, meta: { bare: true } },
    { path: '/viewer', name: 'viewer', component: HomePage },
    { path: '/iridescent', name: 'iridescent', component: IridescentPage },
  ],
})

export default router

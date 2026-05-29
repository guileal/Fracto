import { createRouter, createWebHistory } from 'vue-router'
import IndexPage from './pages/IndexPage.vue'
import LandingPage from './pages/LandingPage.vue'
import LandingPageV2 from './pages/LandingPageV2.vue'
import LandingPageV3 from './pages/LandingPageV3.vue'
import HomePage from './pages/HomePage.vue'
import IridescentPage from './pages/IridescentPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'index', component: IndexPage, meta: { bare: true } },
    { path: '/landing', name: 'landing', component: LandingPage, meta: { bare: true } },
    { path: '/v2', name: 'landing-v2', component: LandingPageV2, meta: { bare: true } },
    { path: '/v3', name: 'landing-v3', component: LandingPageV3, meta: { bare: true } },
    { path: '/viewer', name: 'viewer', component: HomePage },
    { path: '/iridescent', name: 'iridescent', component: IridescentPage },
  ],
})

export default router

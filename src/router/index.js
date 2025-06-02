import Router from 'vue-router';
import store from '@/store';
import Login from '@/views/login-view.vue';
import Citas from '@/views/appointments-view.vue';
import Pacientes from '@/views/patients-view.vue';
import Tratamientos from '@/views/treatments-view.vue';
import MainLayout from '@/layouts/main-layout.vue';
import Vue from 'vue';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  routes: [
    { path: '/', redirect: '/citas' },
    { path: '/login', component: Login },
    {
      path: '/',
      component: MainLayout,
      children: [
        { path: '/citas', component: Citas },
        { path: '/pacientes', component: Pacientes },
        { path: '/tratamientos', component: Tratamientos },
      ],
    },
  ],
});

router.beforeEach((to, from, next) => {
  // eslint-disable-next-line
  const isAuthenticated = store.getters.isAuthenticated;

  if (to.path !== '/login' && !isAuthenticated) {
    next('/login');
  } else if (to.path === '/login' && isAuthenticated) {
    next('/citas');
  } else {
    next();
  }
});

export default router;

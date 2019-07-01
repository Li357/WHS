import Vue from 'vue';
import Router from 'vue-router';

import Dashboard from '../views/Dashboard.vue';
import DateList from '../components/DateList.vue';
import Login from '../views/Login.vue';
import NotFound from '../views/NotFound.vue';
import { getCookie } from '../utils';

Vue.use(Router);

const routes = [
  {
    path: '/dashboard/:startYear',
    name: 'dashboard',
    component: Dashboard,
    meta: { admin: true },
    props: true,
    children: [{
      path: ':dateType',
      component: DateList,
      props: true,
    }],
  },
  { path: '/login', name: 'login', component: Login },
  { path: '*', name: 'not-found', component: NotFound },
];

const router = new Router({
  mode: 'history',
  routes,
});

router.beforeEach(async (to, from, next) => {
  if (to.fullPath === '/') {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const currentYearStart = currentMonth < 5 ? currentYear - 1 : currentYear;
    return next(`/dashboard/${currentYearStart}/assembly`);
  }

  if (to.matched.some(({ meta }) => meta.admin)) {
    const payload = getCookie('payload');
    if (!payload) {
      return next('/login');
    }

    const [, decoded] = payload.split('.');
    const user = JSON.parse(atob(decoded));
    if (user.admin) {
      return next();
    }
    return next('/login');
  }

  next();
});

export default router;

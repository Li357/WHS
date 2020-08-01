import Vue from 'vue';
import Router from 'vue-router';

import Dashboard from '../views/Dashboard.vue';
import DateList from '../components/DateList.vue';
import YearSetting from '../components/YearSetting.vue';
import ELearningSettings from '../components/ELearningSettings.vue';
import Login from '../views/Login.vue';
import NotFound from '../views/NotFound.vue';
import { getCookie } from '../utils';
import { UserSchema } from '../../shared/types/api';

Vue.use(Router);

const routes = [
  {
    path: '/dashboard/:startYear([0-9]{4})',
    name: 'dashboard',
    component: Dashboard,
    meta: { admin: true },
    props: true,
    children: [
      {
        path: ':dateType(assembly|no-school|early-dismissal|late-start)',
        component: DateList,
        props: true,
      },
      {
        // https://github.com/pillarjs/path-to-regexp/issues/95
        path: ':settingType(semester-one-start|semester-one-end|semester-two-start|semester-two-end)',
        component: YearSetting,
        props: true,
      },
      {
        path: 'elearning',
        component: ELearningSettings,
        props: true,
      },
    ],
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

  const payload = getCookie('payload');
  if (to.fullPath === '/login') {
    if (payload) {
      return next('/');
    }
    next();
  }

  if (to.matched.some(({ meta }) => meta.admin)) {
    if (!payload) {
      return next('/login');
    }

    const [, decoded] = payload.split('.');
    const user: UserSchema = JSON.parse(atob(decoded));
    if (user.admin) {
      return next();
    }
    return next('/login');
  }

  next();
});

export default router;

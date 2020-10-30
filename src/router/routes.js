const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {path: '', redirect: 'home'},
      {path: 'home', component: () => import('pages/PageHome')},
      {path: 'error', component: () => import('pages/Error404')},
      {path: 'error', component: () => import('pages/Error404')},
      {path: 'profile', component: () => import('pages/Profile'), meta: {requiresAuth: true}},
    ]
  },
  {
    path: '/auth',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {path: 'login', name: 'Login', component: () => import('pages/Auth')},
      {path: 'register', name: 'Register', component: () => import('pages/Auth')},
      {path: 'forgotPassword', name: 'ForgotPassword', component: () => import('pages/ForgotPassword.vue')
      },
    ]
  }
]

// Always leave this as last one
routes.push({
  path: '*',
  component: () => import('pages/Error404.vue')
})

export default routes

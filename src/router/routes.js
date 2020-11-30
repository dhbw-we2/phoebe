const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {path: '', component: () => import('pages/Home.vue')},
      {path: 'forum', name: 'forum',  component: () => import('pages/Forum.vue')},
      {path: 'error', name: 'error',  component: () => import('pages/Error404')},
      {path: 'profile', name: 'profile', component: () => import('pages/UserProfile'), meta: {requiresAuth: true}},
      {path: 'feed', name: 'feed', component: () => import('pages/MyFeed'), meta: {requiresAuth: true}},
    ]
  },
  {
    path: '/post', meta: {requiresAuth: true},
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {path: 'new', name: 'newPost', component: () => import('pages/PostEditor')},
      {path: 'edit', name: 'editPost', component: () => import('pages/PostEditor')},
      {path: 'my', name: 'myPosts', component: () => import('pages/MyPosts.vue')},
    ]
  },
  {
    path: '/auth',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {path: 'login', name: 'Login', component: () => import('pages/Auth')},
      {path: 'register', name: 'Register', component: () => import('pages/Auth')},
      {
        path: 'forgotPassword', name: 'ForgotPassword', component: () => import('pages/ForgotPassword.vue')
      },
    ]
  },
  {path: '/spotifyAuthCallback', component: () => import('pages/SpotifyAuthCallback'), meta: {requiresAuth: true}},
]

// Always leave this as last one
routes.push({
  path: '*',
  component: () => import('pages/Error404.vue')
})

export default routes

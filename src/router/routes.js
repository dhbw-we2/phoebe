
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', redirect: 'home' },
      { path: 'home', component: () => import('pages/PageHome.vue') },
      { path: 'addPost', component: () => import('pages/AddPost.vue') },
      { path: 'myPosts', component: () => import('pages/MyPosts.vue') },
      { path: 'error', component: () => import('pages/Error404') },
    ]
  }
]

// Always leave this as last one
routes.push({
  path: '*',
  component: () => import('pages/Error404.vue')
})

export default routes

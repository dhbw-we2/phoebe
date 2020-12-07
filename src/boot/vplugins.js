import Vue from 'vue'
import BackgroundGradient from '../plugins/BackgroundGradient'
import checkView from 'vue-check-view'

BackgroundGradient.install(Vue, {
  backgroundBaseClass: 'background',
  gradientDivID: 'background-gradient',
  customGradientClass: 'gradient-color',
  transitionClass: 'transition'
})

Vue.use(checkView)

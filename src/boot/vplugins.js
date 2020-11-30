import Vue from 'vue'
import BackgroundGradient from '../plugins/BackgroundGradient'

BackgroundGradient.install(Vue, {
  backgroundBaseClass: 'background',
  gradientDivID: 'background-gradient',
  customGradientClass: 'gradient-color',
  transitionClass: 'transition'
})

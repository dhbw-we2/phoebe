const BackgroundGradient = {
  install(Vue, options) {
    let transitionTimer

    Vue.prototype.$changeBackgroundColor = function (className) {
      Vue.nextTick(function () {
        // Reset Timer //
        clearTimeout(transitionTimer)

        const gradientDiv = document.getElementById(options.gradientDivID)

        // Create new transition div //
        const newTransition = document.createElement('div')
        newTransition.classList = `${options.backgroundBaseClass} ${options.customGradientClass} ${className} ${options.transitionClass}`
        newTransition.style.zIndex = (parseInt(getComputedStyle(gradientDiv).zIndex) + gradientDiv.children.length + 1).toString()

        // Append new div //
        gradientDiv.appendChild(newTransition)

        // Set timer delete all transition divs when animation finishes //
        const animDuration = parseInt(getComputedStyle(newTransition).animationDuration) * 1000
        transitionTimer = setTimeout(removeTransitions, animDuration)
      })

      function removeTransitions() {
        const gradientDiv = document.getElementById(options.gradientDivID)

        // Set background gradient to new color //
        gradientDiv.classList = `${options.backgroundBaseClass} ${options.customGradientClass} ${className}`

        // Restart background animation //
        gradientDiv.style.animation = 'none'
        setTimeout(() => gradientDiv.style.animation = '', 100)

        // Remove transition divs //
        while (gradientDiv.firstChild) {
          gradientDiv.removeChild(gradientDiv.firstChild);
        }
      }
    }
  }
}

export default BackgroundGradient

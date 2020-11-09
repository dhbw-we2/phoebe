import User from "src/models/User";

export const currentUser = ({currentUser}) => {
  if (currentUser) {
    const userModel = new User({})
    const keys = Object.keys(userModel)
    keys.forEach(key => {
      if (!currentUser.hasOwnProperty(key)) {
        currentUser[key] = userModel[key]
      }
    })
  }
  return currentUser
}

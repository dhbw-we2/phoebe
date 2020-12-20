import User from "src/models/User";
import {userRef} from "src/services/firebase/db";

/**
 * This function returns the valid current user
 * @param currentUser
 * @returns {currentUser}
 */
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

/**
 * This function returns the user reference to a specific user
 * @param currentUser
 * @returns {userRef(currentUser.uid)}
 */
export const currentUserRef = ({currentUser}) => {
  return userRef(currentUser.uid)
}

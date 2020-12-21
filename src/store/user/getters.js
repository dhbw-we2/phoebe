import User from "src/models/User";
import {userRef} from "src/services/firebase/db";

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

export const currentUserRef = ({currentUser}) => {
  return userRef(currentUser.uid)
}

export const spotifyAuth = ({spotifyAuth}) => {
  return spotifyAuth
}

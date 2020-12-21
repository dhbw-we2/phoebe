import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/storage'

/**
 * Firestore
 * https: //firebase.google.com/docs/reference/js/firebase.firestore.Firestore.html
 *
 * @return {firebase.firestore.Firestore} returns Firestore
 */
export const firestore = () => {
  return firebase.firestore()
}

export const userCollection = () => {
  return firestore().collection('users')
}
export const userRef = (id) => {
  return firestore().collection('users').doc(id)
}

export const postCollection = () => {
  return firestore().collection('posts')
}
export const postRef = (id) => {
  return postCollection().doc(id)
}

export const commentCollection = () => {
  return firestore().collection('comments')
}
export const commentRef = (id) => {
  return commentCollection().doc(id)
}

export const postRatingCollection = () => {
  return firestore().collection('ratings-posts')
}
export const postRatingRef = (id) => {
  return postRatingCollection().doc(id)
}

export const commentRatingCollection = () => {
  return firestore().collection('ratings-comments')
}
export const commentRatingRef = (id) => {
  return commentRatingCollection().doc(id)
}

export const spotifyAuthRef = (id) => {
  return firestore().collection('spotify-auth').doc(id)
}

/**
 * @param  {String} storageLocation - Location on Firebase Storage
 */
export const storageRef = (storageLocation) => {
  return firebase.storage().ref(storageLocation)
}

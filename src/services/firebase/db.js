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

/**
 * Implements firebase function to return collection of users
 * @returns collection('users')
 */
export const userCollection = () => {
  return firestore().collection('users')
}

/**
 * Implements firebase function to return user with specific id
 * @param id
 * @returns User with id
 */
export const userRef = (id) => {
  return firestore().collection('users').doc(id)
}

/**
 * Implements firebase function to return collection of posts
 * @returns collection('posts')
 */
export const postCollection = () => {
  return firestore().collection('posts')
}

/**
 * Implements firebase function to return post with specific id
 * @param id
 * @returns Post with id
 */
export const postRef = (id) => {
  return postCollection().doc(id)
}

/**
 * Implements firebase function to return collection of comments
 * @returns collection('comments')
 */
export const commentCollection = () => {
  return firestore().collection('comments')
}

/**
 * Implements firebase function to return comment with specific id
 * @param id
 * @returns Comment with id
 */
export const commentRef = (id) => {
  return commentCollection().doc(id)
}

/**
 * Implements firebase function to return collection of post ratings
 * @returns collection('rating-posts')
 */
export const postRatingCollection = () => {
  return firestore().collection('ratings-posts')
}

/**
 * Implements firebase function to return ratings from a specific post
 * @returns Rating from Post with id
 */
export const postRatingRef = (id) => {
  return postRatingCollection().doc(id)
}

/**
 * Implements firebase function to return collection of comment ratings
 * @returns collection('rating-comments')
 */
export const commentRatingCollection = () => {
  return firestore().collection('ratings-comments')
}

/**
 * Implements firebase function to return ratings from a specific comment
 * @returns Rating from comment with id
 */
export const commentRatingRef = (id) => {
  return commentRatingCollection().doc(id)
}

/**
 * This function returns a storage reference to a specific object
 * @param  {String} storageLocation - Location on Firebase Storage
 */
export const storageRef = (storageLocation) => {
  return firebase.storage().ref(storageLocation)
}

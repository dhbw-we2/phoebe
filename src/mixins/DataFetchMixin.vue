<script>
import {postRatingCollection, userCollection} from "src/services/firebase/db";
import {firestore} from "firebase/app";
import {mapMutations} from "vuex";

export default {
  name: 'DataFetchMixin',
  data () {
    return {}
  },
  methods: {
    ...mapMutations('cache', ['setUserDataCache', 'setSpotifyDataCache']),

    /**
     * Fetch spotify information and save to spotifyData array
     * @param spotifyItems
     */
    fetchSpotifyData(spotifyItems) {
      const trackIDs = [], albumIDs = []
      spotifyItems.forEach(item => {
        switch (item.type) {
          case 'track':
            trackIDs.push(item.id)
            break;
          case 'album':
            albumIDs.push(item.id)
            break;
        }
      })
      while (trackIDs.length > 0) {
        const trackIDsPart = trackIDs.splice(0, 50)
        this.$spotify.getTracks(trackIDsPart).then(trackItems => {
          trackItems.forEach(trackItem => {
            this.setSpotifyDataCache({index: `track_${trackItem.id}`, item: trackItem})
          })
        })
      }
      while (albumIDs.length > 0) {
        const albumIDsPart = albumIDs.splice(0, 50)
        this.$spotify.getAlbums(albumIDsPart).then(albumItems => {
          albumItems.forEach(albumItem => {
            this.setSpotifyDataCache({index: `album_${albumItem.id}`, item: albumItem})
          })
        })
      }
    },
    /**
     * Fetches all up/downvotes of a user of all given posts and stores them in cache
     */
    fetchCurrentUserRating(postRefs) {
      while (postRefs.length > 0) {
        const postRefsPart = postRefs.splice(0, 10)
        postRatingCollection().where('user', "==", this.currentUserRef)
          .where('post', 'in', postRefsPart).get().then(snapshot => {
          snapshot.forEach(doc => {
            // Set rating according to database //
            this.$set(this.ratingData, doc.data().post.id, doc.data())
            // Remove this post from the temporary list //
            postRefsPart.splice(postRefsPart.findIndex(post => post.id === doc.data().post.id), 1)
          })
          // Set all post that don't have a user rating to neutral to get them out of loading state//
          postRefsPart.forEach(post => {
            this.$set(this.ratingData, post.id, {neutral: true})
          })
        })
      }
    },
    /**
     * Fetches all user data of all given users and stores them in cache
     */
    fetchUserData(userIDs){
      while (userIDs.length > 0) {
        const userIDsPart = userIDs.splice(0, 10)
        userCollection().where(firestore.FieldPath.documentId(), "in", userIDsPart).get().then(snapshot => {
          snapshot.forEach(doc => {
            this.setUserDataCache({index: doc.id, item: doc.data()})
          })
        })
      }
    },
  }
}
</script>

<template>
  <div>
    <q-input
      filled dark
      type="search"
      placeholder="Search"
      v-model="searchInput"
      v-on:keypress.enter.prevent="spotifySearch">

      <template v-slot:append>
        <q-btn
          unelevated
          rounded
          icon="eva-search-outline"
          type="search"
          v-on:click="spotifySearch"
          :loading="searching"
        />
      </template>
    </q-input>
    <div v-if="showSearchResults">
      <q-tabs
        v-model="tab"
        indicator-color="primary"
        active-color="primary">
        <q-tab name="tracks" icon="eva-music-outline" label="Tracks" />
        <q-tab name="playlists" icon="eva-play-circle-outline" label="Playlists" />
        <q-tab name="artists" icon="eva-people-outline" label="Artists" />
        <q-tab name="podcast" icon="eva-mic-outline" label="Podcasts" />
      </q-tabs>
      <spotify-search-preview :tracks="searchData.body.tracks.items" />
    </div>
  </div>
</template>

<script>
import {mapGetters} from "vuex";
import SpotifySearchPreview from "components/forum/SpotifySearchPreview"


export default {
  name: "SpotifySearchBar",
  components: { SpotifySearchPreview },
  data () {
    return {
      tab: 'tracks',
      showSearchResults: false,
      searching: false,
      searchInput: '',
      searchData: null,
    }
  },
  computed: {
    ...mapGetters('user', ['currentUser']),
  },
  methods: {
    onFocus(e) {

    },
    onKeyUp(e) {

    },
    async spotifySearch () {
      this.searching = true
      try {
        this.$spotify.self().setAccessToken(this.currentUser.spotifyAccessToken)
        const result = await this.$spotify.searchTracks(this.searchInput, ['track', 'playlist', ], { limit : 5})
        this.searchData = result
        this.showSearchResults = true
      } catch (e) {
        if(e.message == "Invalid access token"){
          console.log("exception caught")
          if(!this.$spotify.fallback()){
            this.spotifySearch()
          }
        } else {
          console.log(e)
        }
      }
      this.searching = false
    },
  }
}
</script>

<style scoped>

</style>

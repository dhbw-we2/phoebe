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
        <q-tab name="track" icon="eva-music-outline" label="Tracks" />
        <q-tab name="album" icon="eva-play-circle-outline" label="Album" />
      </q-tabs>
      <spotify-search-preview v-if="tab == 'track'"     type="tracks"    :tracks="searchData.body.tracks.items" v-on="$listeners" />
      <spotify-search-preview v-if="tab == 'album'"     type="albums"    :albums="searchData.body.albums.items" v-on="$listeners"/>
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
      tab: 'album',
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
    async spotifySearch () {
      this.searching = true
      try {
        this.$spotify.self().setAccessToken(this.currentUser.spotifyAccessToken)
        const result = await this.$spotify.searchTracks(this.searchInput, ['track', 'album'], { limit : 5})
        this.searchData = result
        this.showSearchResults = true
        //console.log(this.searchData.body)
      } catch (e) {
        if(e.message == "Invalid access token"){
          console.log("exception caught")
          if(!this.$spotify.fallback()){
            await this.spotifySearch()
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

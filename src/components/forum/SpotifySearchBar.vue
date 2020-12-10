<template>
  <div>
    <q-input
      filled dark
      type="search"
      placeholder="Search Spotify"
      v-model="searchInput"
      v-on:keypress.enter.prevent="spotifySearch">
      <template v-slot:prepend>
        <img src="~assets/spotify-logo-white.svg" style="fill: white" width="30px" alt="Spotify"/>
      </template>
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
        <q-tab name="track" icon="eva-music-outline" label="Tracks">

        </q-tab>
        <q-tab name="album" icon="eva-play-circle-outline" label="Album"></q-tab>

      </q-tabs>
      <q-tab-panels v-model="tab"
                    animated
                    keep-alive
                    transition-prev="jump-up"
                    transition-next="jump-down">
        <q-tab-panel name="track" >
          <spotify-search-preview type="tracks" :tracks="searchDataTracks" v-on="$listeners" @add-item="itemClicked($event)"/>
        </q-tab-panel>
        <q-tab-panel name="album">
          <spotify-search-preview type="albums" :albums="searchDataAlbums" v-on="$listeners" @add-item="itemClicked($event)"/>
        </q-tab-panel>
      </q-tab-panels>

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
      tab: 'track',
      showSearchResults: false,
      searching: false,
      searchInput: '',
      searchDataTracks: null,
      searchDataAlbums: null,
    }
  },
  computed: {
    ...mapGetters('user', ['currentUser']),
  },
  methods: {
    /**
     * Creates event to toggle notification and update Item ID/type
     * Closes preview
     * @param item
     */
    itemClicked(item) {
      this.showSearchResults = false
      this.$emit('add-items', item)
    },
    /**
     * Searches for tracks and albums.
     * If an invalid access token exception is caught and it's the first time so, the function is called again
     *
     * @returns {Promise<void>}
     */
    async spotifySearch () {
      this.searching = true
      this.$spotify.self().setAccessToken(this.currentUser.spotifyAccessToken)
      const result = await this.$spotify.searchTracks(this.searchInput, ['track', 'album'], { limit : 5})
      this.searchDataAlbums = result.body.albums.items
      this.searchDataTracks = result.body.tracks.items
      this.showSearchResults = true
      this.searching = false
    },
  }
}
</script>

<style scoped>

</style>

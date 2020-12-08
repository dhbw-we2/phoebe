<template>
  <q-list dark bordered separator>
    <div v-if="showNothing">
      <q-item class="spotify-search-label">
        <q-item-label>No search results available</q-item-label>
      </q-item>
    </div>
    <div v-else v-for="item in tableType" >
      <q-item :key="item.id" clickable @click="addItem(item)">
        <q-item-section>
          <q-img :src="getImage(item)" style="max-width: 50px" class="" />
        </q-item-section>

        <q-item-section>
          <q-item-label>{{ item.name }}</q-item-label>
        </q-item-section>

        <q-item-section>
          <q-item-label> {{ getArtists(item) }}</q-item-label>
        </q-item-section>
      </q-item>
    </div>
  </q-list>
</template>

<script>

export default {
name: "SpotifySearchPreview",
  props: {
    type: String,

    tracks: Array,
    playlists: Array,
    albums: Array,
    podcasts: Array,
    },
data() {
  return{
    tableType: Array,
    showNothing: false,
  }
},
methods: {
  getArtists(item) {
    switch (this.type) {
      case 'tracks':
      case 'albums':
        let result = item.artists.map(a => a.name);
        return result.join(', ');
      case 'playlists':
        return item.owner.display_name
      case 'podcasts':
        return item.publisher
    }

  },
  getImage(item) {
    switch (this.type) {
      case 'tracks':
        return item.album.images[1].url;
      case 'playlists':
        return item.image[0].url
      case 'podcasts':
      case 'albums':
        console.log(item.image[2].url)
        return item.image[2].url
    }
  },
  /**
   * This function triggeres an event to update editor input
   * @param item
   */
  addItem(item){
    this.$emit('add-item', {name: item.name, url: item.external_urls.spotify})
  },
},
  created() {
    switch (this.type) {
      case 'tracks':
        if (this.tracks.length !== 0) {
          this.tableType = this.tracks
          return
        }
      case 'albums':
        if (this.albums.length !== 0) {
          this.tableType = this.albums
          return
        }
      case 'playlists':
        if (this.playlists.length !== 0) {
          this.tableType = this.playlists
          return
        }
      case 'podcasts':
        if (this.podcasts.length !== 0){
          this.tableType = this.podcasts
          return
        }
      default:
          this.showNothing = true
          break
    }
  },

}
</script>

<style scoped>

</style>

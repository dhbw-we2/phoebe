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
    albums: Array,
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
    }

  },
  getImage(item) {
    console.log(this.type)
    console.log(item)
    return item.album.images[1].url
    /*switch (this.type) {
      case 'tracks':
        return item.album.images[1].url;
      case 'albums':
        return item.album.images[1].url
    }*/
  },
  /**
   * This function triggeres an event to update editor input
   * @param item
   */
  addItem(item){
    this.$emit('add-item', {id: item.id, type: item.type, name: item.name})
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
      default:
          this.showNothing = true
          break
    }
  },

}
</script>

<style scoped>

</style>

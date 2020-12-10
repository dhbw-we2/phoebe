<template>
  <div v-if="isEmpty">
    <q-item class="spotify-search-label">
      <q-item-label>No search results available</q-item-label>
    </q-item>
  </div>
  <q-list v-else bordered separator>
    <q-item v-for="item in getItemArray" :key="item.id" clickable @click="addItem(item)" class="q-pa-none">
        <q-item-section avatar>
          <q-img :src="getImage(item)" width="70px" height="70px"/>
        </q-item-section>

        <q-item-section >
          <q-item-label>{{ item.name }}</q-item-label>
        </q-item-section>

        <q-item-section>
          <q-item-label> {{ getArtists(item) }}</q-item-label>
        </q-item-section>
      </q-item>
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
    return {}
  },
  computed: {
    getItemArray() {
      return (this.type === 'tracks') ? this.tracks : this.albums
    },
    isEmpty() {
      return (this.type === 'tracks') ? this.tracks.length === 0 : this.albums.length === 0
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
    /**
     *
     */
    getImage(item) {
      switch (this.type) {
        case 'tracks':
          return item.album.images[1].url;
        case 'albums':
          return item.images[1].url
      }
    },
    /**
     * This function triggeres an event to update editor input
     * @param item
     */
    addItem(item) {
      this.$emit('add-item', {id: item.id, type: item.type, name: item.name})
    },
  },
}
</script>

<style scoped>

</style>

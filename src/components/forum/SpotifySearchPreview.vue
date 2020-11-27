<template>
  <q-list dark bordered separator>
    <div v-if="tracks !== null" v-for="item in tracks" >
      <q-item :key="item.id" clickable>
        <q-item-section>
          <q-img :src="item.album.images[2].url" style="max-width: 50px" class="" />
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
    tracks: Array,
    playlists: Array,
  },
  data() {
    return{}
  },
  methods: {
    getArtists(item) {
      let result = item.artists.map(a => a.name);
      return result.join(', ')
    }
  }

}
</script>

<style scoped>

</style>

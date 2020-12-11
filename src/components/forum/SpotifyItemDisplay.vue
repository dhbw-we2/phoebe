<template>
  <q-card flat>
    <q-card-section :horizontal="!$q.screen.xs" class="q-pa-none">
      <q-card-section class="flex justify-center">
        <q-img v-if="spotifyItem"
               :width="getCoverWidthHeight"
               :height="getCoverWidthHeight"
               :src="getSpotifyItemCoverURL" v-ripple="{color: 'white'}"
               class="cursor-pointer"
               @click="openSpotifyLink"/>
        <q-skeleton v-else type="rect" :width="getCoverWidthHeight" :height="getCoverWidthHeight"/>
      </q-card-section>
      <q-separator :vertical="!$q.screen.xs" inset="true"/>
      <q-card-section class="column justify-between full-width">
        <q-list>
          <q-item>
            <q-item-section>
              <q-item-label overline>
                <span v-if="getSpotifyItemType">{{ getSpotifyItemType }}</span>
                <q-skeleton v-else type="text" width="50px"/>
              </q-item-label>
              <q-item-label>
                <span v-if="getSpotifyName">{{ getSpotifyName }}</span>
                <q-skeleton v-else type="text" width="90px"/>
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label overline>
                <span v-if="spotifyItem">Artist</span>
                <q-skeleton v-else type="text" width="50px"/>
              </q-item-label>
              <q-item-label>
                <span v-if="getSpotifyArtist">{{ getSpotifyArtist }}</span>
                <q-skeleton v-else type="text" width="90px"/>
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
        <div class="text-right">
          <q-btn rounded icon="eva-play-circle-outline" color="primary" class=""
                 @click="openSpotifyLink"
                :disable="!spotifyItem"/>
        </div>
      </q-card-section>
    </q-card-section>
  </q-card>
</template>

<script>
export default {
  name: 'SpotifyItemDisplay',
  data() {
    return {}
  },
  props: {
    spotifyItem: Object
  },
  computed: {
    getSpotifyItemType() {
      if (this.spotifyItem) {
        switch (this.spotifyItem.type) {
          case 'track':
            return 'Track'
          case 'album':
            return 'Album'
        }
      }
    },
    getSpotifyItemCoverURL() {
      if (this.spotifyItem) return this.spotifyItem.coverURL
    },
    getSpotifyName() {
      if (this.spotifyItem) return this.spotifyItem.name
    },
    getSpotifyArtist() {
      if (this.spotifyItem) return this.spotifyItem.artist
    },
    getCoverWidthHeight() {
      return this.$q.screen.width > 375 ? '175px' : '160px'
    }
  },
  methods: {
    openSpotifyLink() {
      window.open(this.spotifyItem.url, '_blank');
    },
  }
}
</script>

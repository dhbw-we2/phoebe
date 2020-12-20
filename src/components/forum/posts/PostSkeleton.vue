<template>
  <q-card class="card-post-text q-mb-md" flat>
    <q-card-section horizontal>
      <q-card-actions vertical class="q-ma-md-sm" style="min-width: 5em">
        <q-btn flat round icon="eva-arrow-ios-upward-outline" disable/>
        <q-skeleton type="text" class="text-h5" height="1.5em"/>
        <q-btn flat round icon="eva-arrow-ios-downward-outline" disable/>
      </q-card-actions>
      <div class="full-width">
        <q-card-section vertical class="q-pa-none q-pt-md">
          <q-item class="q-pl-none">
            <q-item-section avatar>
              <q-skeleton type="QAvatar" size="60px"/>
            </q-item-section>
            <q-item-section>
              <q-skeleton type="text" width="40%"/>
              <q-skeleton type="text" width="60%"/>
            </q-item-section>
          </q-item>
          <q-card-section :horizontal="!$q.screen.xs && !$q.screen.sm" class="q-pa-none">
            <q-card-section class="col-6 q-pl-none q-pb-none">
              <spotify-item-display :spotify-item="null"/>
            </q-card-section>
            <q-card-section class="q-pb-none full-width">
              <q-skeleton type="text" class="text-h5 q-pb-md" width="60%"/>
              <q-skeleton type="text"/>
              <q-skeleton type="text"/>
              <q-skeleton type="text"/>
            </q-card-section>
          </q-card-section>
        </q-card-section>
        <q-card-actions class="full-width">
          <q-space/>
          <q-btn flat round icon="eva-message-square-outline" disable/>
          <q-btn flat round icon="eva-bookmark-outline" disable/>
        </q-card-actions>
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
import SpotifyItemDisplay from "components/forum/SpotifyItemDisplay";

export default {
  name: "PostSkeleton",
  components: {SpotifyItemDisplay},
}
</script>

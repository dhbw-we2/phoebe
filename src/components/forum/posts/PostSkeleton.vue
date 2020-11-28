<template>
  <q-card class="card-post-text q-mb-md" flat>
    <q-card-section horizontal>
      <q-card-actions vertical class="justify-center q-pa-none q-ma-md" style="min-width: 5em">
        <q-btn flat round icon="eva-arrow-ios-upward-outline"/>
        <q-skeleton type="text" class="text-h5" height="1.5em"/>
        <q-btn flat round icon="eva-arrow-ios-downward-outline"/>
      </q-card-actions>

      <q-card-section vertical class="col-11 q-pa-none q-pb-sm q-pt-sm">
        <q-card-section vertical class="q-pa-sm">
          <q-item class="q-pa-sm q-pb-md">
            <q-item-section avatar>
              <q-skeleton type="QAvatar" size="50px"/>
            </q-item-section>

            <q-item-section>
              <q-skeleton type="text"/>
              <q-skeleton type="text" width="80%"/>
            </q-item-section>
          </q-item>
        </q-card-section>
        <q-skeleton height="110px" class="q-mb-sm"/>
      </q-card-section>
    </q-card-section>

    <q-card-actions align="stretch">
      <q-btn flat round icon="eva-heart-outline"/>
      <q-btn flat round icon="eva-message-square-outline"/>
      <q-btn flat round icon="eva-save-outline"/>
      <q-btn flat round icon="eva-more-horizontal-outline"/>
    </q-card-actions>
  </q-card>
</template>


<script>
export default {
  name: "PostSkeleton",
}
</script>

<style scoped>

</style>

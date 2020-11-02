<template>
  <q-card class="card-post-text q-mb-md" flat bordered>
    <q-card-section vertical>
      <q-card-section class="q-pt-xs">
        <q-item>
          <q-item-section avatar>
            <q-skeleton type="QAvatar" size="40px"/>
          </q-item-section>

          <q-item-section>
            <q-skeleton type="text"/>
            <q-skeleton type="text" width="80%"/>
          </q-item-section>
        </q-item>
      </q-card-section>
      <q-skeleton height="110px" class="q-mb-sm"/>
    </q-card-section>

    <q-separator/>

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

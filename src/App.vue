<template>
  <RouterView name="rootview">
  </RouterView>
</template>
  
<script lang='ts'>
export default {
  name: "App",
}
</script>
<script lang="ts" setup>
import Login1 from './components/Login1.vue'
import { RouterView } from 'vue-router'
components: {
  Login1
}
</script>
<style></style>
  
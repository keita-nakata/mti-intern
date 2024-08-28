<template>
  <div id="app">
    <Menu />
    <router-view/>
  </div>
</template>

<script>
  import { RouterView } from 'vue-router'
  import Menu from '@/components/Menu.vue'
  
  export default {
    name: 'App',
    components: {
      Menu
    },
  }
</script>

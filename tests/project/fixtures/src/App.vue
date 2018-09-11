<template>
  <div id="app">
    <side-menu/>
    <router-view/>
  </div>
</template>

<script>
import SideMenu from './components/SideMenu.vue';

export default {
  components: {
    SideMenu,
  },
};
</script>


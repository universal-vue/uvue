<template>
  <div id="app">
    <pre
      class="current-url"
      style="display: none;"
    >
      {{ $route.fullPath }}
    </pre>
    <side-menu/>
    <router-view/>
    <div
      v-if="mounted"
      id="mounted"
    />
  </div>
</template>

<script>
import SideMenu from './components/SideMenu.vue';

export default {
  components: {
    SideMenu,
  },

  data: () => ({
    mounted: false,
  }),

  mounted() {
    this.mounted = true;
  },
};
</script>


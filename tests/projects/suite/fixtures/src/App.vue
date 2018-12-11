<template>
  <div id="app">
    <pre
      class="current-url"
      style="display: none;"
    >
      {{ $route.fullPath }}
    </pre>
    <side-menu/>
    <router-view
      :key="$route.fullPath"
    />
    <div
      v-if="mounted"
      id="mounted"
    />
  </div>
</template>

<script>
import SideMenu from './components/SideMenu.vue';

export default {
  head: {
    title: 'UVue',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { vmid: 'desc', name: 'description', content: 'home' },
    ],
  },

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


<template>
  <div class="vue-webpack-dashboard">
    <div class="pane-toolbar">
      <VueIcon icon="dashboard"/>
      <div class="title">{{ $t('org.vue.vue-webpack.dashboard.title') }}</div>

      <template
        v-if="mode === 'ssr-serve'"
      >
        <VueButton
          icon-left="open_in_browser"
          :label="$t('org.vue.vue-webpack.dashboard.open-app')"
          :disabled="!serveUrl"
          :href="serveUrl"
          target="_blank"
        />
        <VueIcon
          icon="lens"
          class="separator"
        />
      </template>

      <VueSwitch
        v-if="mode !== 'serve' && modernMode"
        v-model="showModernBuild"
      >
        {{ $t('org.vue.vue-webpack.modern-mode') }}
      </VueSwitch>

      <VueSelect v-model="sizeField">
        <VueSelectButton value="stats" :label="`${$t('org.vue.vue-webpack.sizes.stats')}`"/>
        <VueSelectButton value="parsed" :label="`${$t('org.vue.vue-webpack.sizes.parsed')}`"/>
        <VueSelectButton value="gzip" :label="`${$t('org.vue.vue-webpack.sizes.gzip')}`"/>
      </VueSelect>

      <VueButton
        class="icon-button"
        icon-left="help"
        v-tooltip="$t('org.vue.vue-webpack.sizes.help')"
      />
    </div>

    <div class="content vue-ui-grid default-gap">
      <BuildStatus />
      <BuildProgress />
      <SpeedStats class="span-2"/>
      <AssetList />
      <ModuleList />
    </div>

    <div class="logo">
      <a href="https://webpack.js.org/" target="_blank">
        <img src="../assets/webpack.svg" class="webpack-logo">
      </a>
    </div>
  </div>
</template>

<script>
import VueWebpackDashboard from '@vue/cli-ui-addon-webpack/src/components/WebpackDashboard';
import Dashboard from '../mixins/Dashboard';

export default {
  extends: VueWebpackDashboard,
  mixins: [Dashboard],

  getters: {
    serveUrl() {
      return this.$sharedData.serveUrl;
    },
  },
};
</script>

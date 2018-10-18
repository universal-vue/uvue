<template>
  <div class="vue-webpack-analyzer">
    <div class="pane-toolbar">
      <VueIcon icon="donut_large"/>
      <div class="title">{{ $t('org.vue.vue-webpack.analyzer.title') }}</div>

      <VueSwitch
        v-if="mode !== 'serve' && modernMode"
        v-model="showModernBuild"
      >
        {{ $t('org.vue.vue-webpack.modern-mode') }}
      </VueSwitch>

      <template v-if="currentTree">
        <VueButton
          icon-left="arrow_upward"
          :label="$t('org.vue.vue-webpack.analyzer.go-up')"
          :disabled="currentTree === rootTree"
          @click="goToParent()"
        />
        <VueButton
          icon-left="home"
          :label="$t('org.vue.vue-webpack.analyzer.go-home')"
          :disabled="currentTree === rootTree"
          @click="goToHome()"
        />
        <VueIcon
          icon="lens"
          class="separator"
        />
      </template>

      <VueSelect
        v-model="selectedChunk"
        :disabled="Object.keys(modulesTrees).length === 0"
      >
        <VueSelectButton
          v-for="(chunk, key) of modulesTrees"
          :key="key"
          :value="key"
          :label="`${$t('org.vue.vue-webpack.analyzer.chunk')} ${getChunkName(key)}`"
        />
      </VueSelect>

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

    <div class="content">
      <template v-if="currentTree">
        <svg
          ref="svg"
          :key="sizeField"
          class="donut"
          :class="{
            hover: hoverModule
          }"
          viewBox="0 0 80 80"
          @mousemove="onMouseMove"
          @mouseout="onMouseOut"
          @click="onDonutClick"
        >
          <g transform="translate(40, 40)">
            <DonutModule
              v-for="(module, index) of currentTree.children"
              :key="module.id"
              :module="module"
              :parent-module="currentTree"
              :colors="getColors(index)"
              :depth="0"
              :parent-ratio="1"
            />
          </g>
        </svg>
      </template>

      <div v-if="describedModule" class="described-module">
        <div class="wrapper">
          <div class="path" v-html="modulePath"/>
          <div
            class="stats size"
            :class="{ selected: sizeField === 'stats' }"
          >
            {{ $t('org.vue.vue-webpack.sizes.stats') }}: {{ describedModule.size.stats | size('B')}}
          </div>
          <div
            class="parsed size"
            :class="{ selected: sizeField === 'parsed' }"
          >
            {{ $t('org.vue.vue-webpack.sizes.parsed') }}: {{ describedModule.size.parsed | size('B')}}
          </div>
          <div
            class="gzip size"
            :class="{ selected: sizeField === 'gzip' }"
          >
            {{ $t('org.vue.vue-webpack.sizes.gzip') }}: {{ describedModule.size.gzip | size('B')}}
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
<script>
import VueWebpackAnalyzer from '@vue/cli-ui-addon-webpack/src/components/WebpackAnalyzer';
import Dashboard from '../mixins/Dashboard';

export default {
  extends: VueWebpackAnalyzer,
  mixins: [Dashboard],
};
</script>

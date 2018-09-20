import path from 'path';
import fs from 'fs';
import ModernModePlugin from '@uvue/vue-cli-plugin-ssr/webpack/uvue/ModernModePlugin';

export default {
  async beforeStart(app) {
    // Check modern-legacy-assets.json exists
    const { outputDir } = app.options.paths;
    const legacyAssetsPath = path.join(outputDir, '.uvue/modern-legacy-assets.json');

    if (fs.existsSync(legacyAssetsPath)) {
      this.legacyAssets = JSON.parse(fs.readFileSync(legacyAssetsPath, 'utf-8'));
    }
  },

  async rendered(response) {
    // There are legacy assets, so consider current build as modern
    if (this.legacyAssets) {
      response.body = this.replacePreloadLink(response.body);
      response.body = this.replaceScripts(response.body);
      response.body = this.injectAssets(response.body);
    }
  },

  replacePreloadLink(html) {
    const regLinks = /<link\s.*as=("|')?script("|')?.*\/?>/gm;
    const items = [];

    // Get tags
    let result = regLinks.exec(html);
    while (result != null) {
      if (result[0].indexOf('preload') > 0) {
        items.push(result);
      }
      result = regLinks.exec(html);
    }

    // Replace them
    for (const item of items) {
      html = html.replace(item[0], item[0].replace('preload', 'modulepreload'));
    }

    return html;
  },

  replaceScripts(html) {
    const regScripts = /<script\s[^>]*\/?>/gm;
    const items = [];

    // Get tags
    let result = regScripts.exec(html);
    while (result != null) {
      items.push(result);
      result = regScripts.exec(html);
    }

    // Replace them
    for (const item of items) {
      html = html.replace(item[0], item[0].replace(/(\/?>)$/, ' type="module"$1'));
    }

    return html;
  },

  injectAssets(html) {
    let code = `<script>${ModernModePlugin.safariFix}</script>`;
    for (const asset of this.legacyAssets) {
      code += `<script src="${asset.attributes.src}" type="text/javascript" nomodule></script>`;
    }

    return html.replace('</body>', `${code}</body>`);
  },
};

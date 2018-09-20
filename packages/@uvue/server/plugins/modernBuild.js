import path from 'path';
import fs from 'fs';
import ModernModePlugin from '@uvue/vue-cli-plugin-ssr/webpack/uvue/ModernModePlugin';
import escapeStringRegexp from 'escape-string-regexp';

export default {
  beforeStart(app) {
    const { outputDir } = app.options.paths;

    const modernPath = path.join(outputDir, '.uvue/client-manifest.json');
    const legacyPath = path.join(outputDir, '.uvue/client-manifest-legacy.json');

    if (fs.existsSync(legacyPath)) {
      this.legacyManifest = JSON.parse(fs.readFileSync(legacyPath, 'utf-8'));
      this.modernManifest = JSON.parse(fs.readFileSync(modernPath, 'utf-8'));
    }
  },

  rendered(response) {
    if (this.legacyManifest) {
      response.body = this.replaceAssetsTags(response.body);
      response.body = this.injectLegacyAndFixes(response.body);
    }
  },

  replaceAssetsTags(html) {
    const assets = [...this.modernManifest.initial, ...this.modernManifest.async];

    for (const asset of assets) {
      if (path.extname(asset) !== '.js') continue;

      const regAsset = new RegExp(
        `<(link|script)\\s[^>]*${escapeStringRegexp(asset)}[^>]*\/?>`,
        'gm',
      );

      let result = regAsset.exec(html);
      while (result != null) {
        switch (result[1]) {
          case 'link':
            if (result[0].indexOf('preload') > 0) {
              const newTag = result[0].replace('preload', 'modulepreload');
              html = html.replace(result[0], newTag);
            }
            break;
          case 'script':
            const newTag = result[0].replace(/(\/?>)$/, ' type="module"$1');
            html = html.replace(result[0], newTag);
            break;
        }
        result = regAsset.exec(html);
      }
    }

    return html;
  },

  injectLegacyAndFixes(html) {
    let code = `<script>${ModernModePlugin.safariFix}</script>`;
    for (const asset of this.legacyManifest.initial) {
      code += `<script src="${asset}" type="text/javascript" nomodule></script>`;
    }
    return html.replace('</body>', `${code}</body>`);
  },
};

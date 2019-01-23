import path from 'path';
import fs from 'fs';
import escapeStringRegexp from 'escape-string-regexp';

// https://gist.github.com/samthor/64b114e4a4f539915a95b91ffd340acc
const safariFix = `!function(){var e=document,t=e.createElement("script");if(!("noModule"in t)&&"onbeforeload"in t){var n=!1;e.addEventListener("beforeload",function(e){if(e.target===t)n=!0;else if(!e.target.hasAttribute("nomodule")||!n)return;e.preventDefault()},!0),t.type="module",t.src=".",e.head.appendChild(t),t.remove()}}();`;

export default {
  /**
   * Check if there is a legacy bundle
   */
  install(server) {
    const { distPath, uvueDir } = server.options;

    if (distPath) {
      const modernPath = path.join(distPath, uvueDir, 'client-manifest.json');
      const legacyPath = path.join(distPath, uvueDir, 'legacy-manifest.json');

      if (fs.existsSync(legacyPath)) {
        this.legacyManifest = JSON.parse(fs.readFileSync(legacyPath, 'utf-8'));
        this.modernManifest = JSON.parse(fs.readFileSync(modernPath, 'utf-8'));
      }
    }
  },

  /**
   * Legacy bundle present: assume this is a modern mode
   */
  rendered(response) {
    if (this.legacyManifest) {
      response.body = this.replaceAssetsTags(response.body);
      response.body = this.injectLegacyAndFixes(response.body);
    }
  },

  /**
   * Replace scripts & links tags to insert appropriate attributes on them
   */
  replaceAssetsTags(html) {
    const assets = [...this.modernManifest.initial, ...this.modernManifest.async];

    for (const asset of assets) {
      if (path.extname(asset) !== '.js') continue;

      const regAsset = new RegExp(
        `<(link|script)\\s[^>]*${escapeStringRegexp(asset)}[^>]*\/?>`,
        'gm',
      );

      let result = regAsset.exec(html);
      while (result !== null) {
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

  /**
   * Inject legacy code for old browsers
   */
  injectLegacyAndFixes(html) {
    let code = `<script>${safariFix}</script>`;
    for (const asset of this.legacyManifest.initial) {
      code += `<script src="${asset}" type="text/javascript" nomodule></script>`;
    }
    return html.replace('</body>', `${code}</body>`);
  },
};

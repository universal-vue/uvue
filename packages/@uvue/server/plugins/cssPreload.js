import path from 'path';
import fs from 'fs';
import escapeStringRegexp from 'escape-string-regexp';

const loadCss =
  '!function(t){"use strict";t.loadCSS||(t.loadCSS=function(){});var e=loadCSS.relpreload={};if(e.support=function(){var e;try{e=t.document.createElement("link").relList.supports("preload")}catch(t){e=!1}return function(){return e}}(),e.bindMediaToggle=function(t){function e(){t.media=a}var a=t.media||"all";t.addEventListener?t.addEventListener("load",e):t.attachEvent&&t.attachEvent("onload",e),setTimeout(function(){t.rel="stylesheet",t.media="only x"}),setTimeout(e,3e3)},e.poly=function(){if(!e.support())for(var a=t.document.getElementsByTagName("link"),n=0;n<a.length;n++){var o=a[n];"preload"!==o.rel||"style"!==o.getAttribute("as")||o.getAttribute("data-loadcss")||(o.setAttribute("data-loadcss",!0),e.bindMediaToggle(o))}},!e.support()){e.poly();var a=t.setInterval(e.poly,500);t.addEventListener?t.addEventListener("load",function(){e.poly(),t.clearInterval(a)}):t.attachEvent&&t.attachEvent("onload",function(){e.poly(),t.clearInterval(a)})}"undefined"!=typeof exports?exports.loadCSS=loadCSS:t.loadCSS=loadCSS}("undefined"!=typeof global?global:this);';

export default {
  /**
   * Read clientManifest
   */
  beforeStart(server) {
    const { outputDir } = server.options.paths;
    const clientManifestPath = path.join(outputDir, '.uvue/client-manifest.json');
    if (fs.existsSync(clientManifestPath)) {
      this.clientManifest = JSON.parse(fs.readFileSync(clientManifestPath, 'utf-8'));
    }
  },

  /**
   * Rewrite link styles tags
   */
  rendered(response) {
    if (this.clientManifest) {
      const html = response.body;

      const replaces = [];
      const noscripts = [];

      for (const asset of this.clientManifest.all) {
        if (path.extname(asset) !== '.css') continue;

        const regAsset = new RegExp(`<link\\s[^>]*${escapeStringRegexp(asset)}[^>]*\/?>`, 'gm');

        let result = regAsset.exec(html);
        while (result !== null) {
          if (result[0].indexOf('preload') < 0 && result[0].indexOf('prefetch') < 0) {
            replaces.push({
              from: result[0],
              to: `<link rel="preload" href="/${asset}" as="style" onload="this.onload=null;this.rel='stylesheet'">`,
            });

            noscripts.push(`<link rel="stylesheet" href="/${asset}">`);
          }
          result = regAsset.exec(html);
        }
      }

      for (const index in replaces) {
        const replace = replaces[index];

        if (index < replaces.length - 1) {
          response.body = response.body.replace(replace.from, replace.to);
        } else {
          response.body = response.body.replace(
            replace.from,
            `${replace.to}<noscript>${noscripts.join('')}</noscript><script>${loadCss}</script>`,
          );
        }
      }
    }
  },
};

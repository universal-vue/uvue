const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = class SSRMiniCssExtractPlugin extends MiniCssExtractPlugin {
  getCssChunkObject() {
    return {};
  }
};

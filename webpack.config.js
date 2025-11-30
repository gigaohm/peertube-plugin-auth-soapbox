const path = require("path");

module.exports = {
  mode: "production",
  entry: {
    "common-client-plugin": "./src/client/common-client-plugin.ts",
  },
  output: {
    path: path.resolve(__dirname, "dist/client"),
    filename: "[name].js",
    library: {
      type: "commonjs2",
    },
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: "ts-loader",
          options: {
            compilerOptions: {
              lib: ["ES2020", "DOM"],
            },
          },
        },
        exclude: /node_modules/,
      },
    ],
  },
  externals: {
    // PeerTube client modules that should not be bundled
    "peertube-helpers": "peertube-helpers",
  },
  optimization: {
    minimize: false,
  },
};

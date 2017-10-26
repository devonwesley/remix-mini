module.exports = {
  entry: {
    app: ["./app/main.js"]
  },
  output: {
    path: __dirname + "/dist",
    filename: "bundle.js"
  },
  module: {
    loaders: [
      { test: /\.js$/, loader: "babel-loader", query: { presets: ['react', 'env'] } }
    ]
  }
}

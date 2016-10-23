module.exports = {
    entry: './3.3.5.js',
    output: {
        filename: 'bundle.js',
        path: './built'
    },
    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
        ]
    }
};
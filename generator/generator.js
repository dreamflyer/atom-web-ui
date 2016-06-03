var path = require('path');

var webpack = require("webpack");

var target = path.resolve(__dirname, '../browser');

var config = {
    context: path.resolve(__dirname, '../'),

    entry: './dist/index.js',

    output: {
        path: target,

        library: ['AtomWeb'],

        filename: 'atomWeb.js'
    },

    plugins: [],

    module: {
        loaders: [
            {test: /\.json$/, loader: "json"},
            {test: /\.css$/, loader: "css"},
            {test: /\.html$/, loader: "html"},
            {test: /\.woff$/, loader: "url"}
        ]
    },
    externals: [
        {remote: true}
    ],
    node: {
        console: false,
        global: true,
        process: true,
        Buffer: true,
        __filename: true,
        __dirname: true,
        setImmediate: true
    }
};

webpack(config, function(err, stats) {
    if(err) {
        console.log(err.message);

        return;
    }

    console.log("Webpack Building Browser Bundle:");

    console.log(stats.toString({reasons: true, errorDetails: true}));
});
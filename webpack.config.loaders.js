let ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = function() {
    return [
        {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader'
        },
        {
            test: /\.scss$/,
            loader: ExtractTextPlugin.extract({
                fallback: 'style-loader',
                use: ['css-loader', 'sass-loader']

            })
        },
        {
            test: /\.hbs/,
            loader: 'handlebars-loader',
            query: { inlineRequires: '\/images\/' }
        },
        {
            test: /\.(jpe?g|png|gif|svg|)$/i,
            loader: 'file-loader?name=images/[hash].[ext]'

        },
        {
            test: /\.(eot|svg|ttf|woff|woff2)$/,
            loader: 'file-loader?name=/fonts/[name].[ext]'
        }
    ];
};

const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const moment = require('moment');

// setting for webpack
process.traceDeprecation = true;
process.noDeprecation = true;

module.exports = {
    entry: {
        app_vendors: './src/app.vendors.webpack.js',
        app: './src/app.webpack.js',
        admin_vendors: './src/admin.vendors.webpack.js',
        admin: './src/admin.webpack.js',
        center_vendors: './src/center.vendors.webpack.js',
        center: './src/center.webpack.js',
        dashboard_vendors: './src/dashboard.vendors.webpack.js',
        dashboard: './src/dashboard.webpack.js',
        bleManager: './src/bleManager/bleManager.js',
        echarts: 'echarts',
        fullcalendar: ['fullcalendar/dist/fullcalendar.min.js', 'fullcalendar/dist/locale-all.js'],
        hammer: 'angular-hammer',
        ng_file_upload: 'ng-file-upload/dist/ng-file-upload.min.js',
        tableExport: 'static/tableExport.js'
    },
    output: {
        path: path.resolve(__dirname, 'cordova/www'),
        filename: '[name].js'
    },
    devServer: {
        contentBase: 'src',
        port: 8321
    },
    devtool: 'eval',
    module: {
        rules: [
            // {
            //   test: /\.js$/,
            //   enforce: 'pre',
            //   use: 'eslint-loader'
            // },
            // {
            //    test: require.resolve('jquery'),
            //    use: [{
            //        loader: 'expose-loader',
            //        options: 'jQuery'
            //    }, {
            //        loader: 'expose-loader',
            //        options: '$'
            //    }]
            // },
            // {
            //    test: require.resolve('moment'),
            //    use: [{
            //        loader: 'expose-loader',
            //        options: 'moment'
            //    }]
            // },
            // { test: require.resolve('jquery'), loader: 'expose-loader?$!expose-loader?jQuery' },
            // { test: require.resolve('moment'), loader: 'expose-loader?$!expose-loader?moment' },
            {
                test: /\.html$/,
                use: 'html-loader'
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: 'css-loader',
                    publicPath: '/'
                })
            },
            {
                test: /\.less$/,
                use: [
                    { loader: 'style-loader' }, // creates style nodes from JS strings
                    {
                        loader: 'css-loader',
                        options: {
                            url: false
                            // root: '.'
                        }
                    }, // translates CSS into CommonJS
                    { loader: 'resolve-url-loader' },
                    { loader: 'less-loader' } // compiles Less to CSS
                ]
            },
            {
                test: /\.scss$/,
                use: [
                    'style-loader', // creates style nodes from JS strings
                    'style-ext-html-webpack-plugin', // translates CSS into CommonJS
                    'resolve-url-loader',
                    'sass-loader' // compiles Sass to CSS
                ]
            },
            {
                test: /\.(woff|woff2)$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    mimetype: 'application/font-woff',
                    name: 'static/font/[name].[ext]'
                }
            },
            {
                test: /\.(ttf|eot)$/,
                loader: 'file-loader',
                options: {
                    limit: 1024,
                    name: 'static/font/[name].[ext]'
                }
            },
            {
                test: /\.svg$/,
                loader: 'file-loader',
                options: {
                    limit: 1024,
                    name: 'static/svg/[name].[ext]'
                }
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                loader: 'file-loader?name=/static/img/[name].[ext]'
            },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env']
                    }
                }
            },
            {
                test: /\.exec\.js$/,
                use: ['script-loader']
            }
        ]
    },
    resolve: {
        modules: [
            path.resolve(__dirname, 'src'),
            'node_modules',
        ]
    },
    externals: {
        jquery: 'jQuery',
        bleManager: 'bleManager'
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.ProvidePlugin({
            // $: 'jquery',
            // jQuery: 'jquery',
            _: 'lodash',
            moment: 'moment',
            Swiper: 'swiper',
            lang: 'static/SystemMessage-zh-TW.js',
            echarts: 'echarts'
        }),
        new ExtractTextPlugin({
            filename: 'static/css/[name].css',
            allChunks: true
        }),
        new webpack.DefinePlugin({
            VERSION: JSON.stringify(moment().format('YYYYMMDDHHmm') + ' (Development Mode)'),
            VERSIONTOCHECK: moment().format('"YYYYMMDDHHmm"'),
            DEVELOPMENT: JSON.stringify(true)
        }),
        new HtmlWebpackPlugin({
            title: 'Smart Dialysis v3',
            template: 'src/index.ejs',
            hash: true,
            inject: 'head',
            chunks: ['app_vendors', 'app'],
            chunksSortMode: (a, b) => {
                if (a.names[0] > b.names[0]) {
                    return -1;
                }
                if (a.names[0] < b.names[0]) {
                    return 1;
                }
                return 0;
            }
        }),
        new HtmlWebpackPlugin({
            title: 'Smart Dialysis v3 Console',
            chunks: ['admin_vendors', 'admin'],
            template: 'src/admin.ejs',
            filename: 'admin.html',
            chunksSortMode: (a, b) => {
                if (a.names[0] > b.names[0]) {
                    return -1;
                }
                if (a.names[0] < b.names[0]) {
                    return 1;
                }
                return 0;
            }
        }),
        new HtmlWebpackPlugin({
            title: 'Smart Dialysis v3 Center',
            chunks: ['center_vendors', 'center'],
            template: 'src/center.ejs',
            filename: 'center.html',
            chunksSortMode: (a, b) => {
                if (a.names[0] > b.names[0]) {
                    return -1;
                }
                if (a.names[0] < b.names[0]) {
                    return 1;
                }
                return 0;
            }
        }),
        new HtmlWebpackPlugin({
            title: 'Smart Dashboard',
            chunks: ['dashboard_vendors', 'dashboard'],
            template: 'src/dashboard.ejs',
            filename: 'dashboard.html',
            chunksSortMode: (a, b) => {
                if (a.names[0] > b.names[0]) {
                    return -1;
                }
                if (a.names[0] < b.names[0]) {
                    return 1;
                }
                return 0;
            }
        })
    ]
};

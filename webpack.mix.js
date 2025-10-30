const mix_ = require('laravel-mix');
// Load the full lodash build.
const _ = require('lodash');

mix_.webpackConfig({
    module: {
        rules: [
            {
                test: /.scss/,
                enforce: 'pre',
                loader: 'import-glob-loader'
            }
        ]
    },
    externals: {
        lodash: 'lodash'
    }
})

.setPublicPath('build/')
.sass('src/style.scss', 'style.min.css')

if (mix_.inProduction()) {
    mix_.version();
} else {
    mix_.sourceMaps();
}

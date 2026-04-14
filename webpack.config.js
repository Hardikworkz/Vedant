import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";
import HtmlWebpackPlugin from "html-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
import ImageMinimizerPlugin from "image-minimizer-webpack-plugin";
import CompressionPlugin from "compression-webpack-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcPath = path.resolve(__dirname, "src");
const publicPath = path.resolve(__dirname, "public");
const tailwindConfigPath = path.resolve(__dirname, "tailwind.config.js");

export default (_, argv = {}) => {
  const isProd = argv.mode === "production";

  return {
    mode: isProd ? "production" : "development",
    target: ["web", "es2020"],
    entry: path.resolve(srcPath, "main.jsx"),
    output: {
      path: path.resolve(__dirname, "dist"),
      publicPath: "/",
      filename: isProd ? "js/[name].[contenthash:8].js" : "js/[name].js",
      chunkFilename: isProd
        ? "js/[name].[contenthash:8].chunk.js"
        : "js/[name].chunk.js",
      assetModuleFilename: "assets/[name].[contenthash:8][ext][query]",
      clean: true,
    },
    devtool: isProd ? "source-map" : "eval-cheap-module-source-map",
    cache: {
      type: "filesystem",
      buildDependencies: {
        config: [__filename],
      },
    },
    stats: "errors-warnings",
    resolve: {
      extensions: [".js", ".jsx"],
      alias: {
        "@": srcPath,
      },
    },
    devServer: {
      port: 3000,
      hot: true,
      open: true,
      compress: true,
      historyApiFallback: true,
      static: {
        directory: publicPath,
        publicPath: "/",
        watch: true,
      },
      watchFiles: ["src/**/*", "public/**/*", "index.html"],
      client: {
        overlay: {
          errors: true,
          warnings: false,
        },
      },
    },
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              cacheDirectory: true,
              cacheCompression: false,
            },
          },
        },
        {
          test: /\.css$/i,
          use: [
            isProd ? MiniCssExtractPlugin.loader : "style-loader",
            {
              loader: "css-loader",
              options: {
                importLoaders: 1,
                sourceMap: !isProd,
              },
            },
            {
              loader: "postcss-loader",
              options: {
                sourceMap: !isProd,
                postcssOptions: {
                  plugins: [
                    tailwindcss({ config: tailwindConfigPath }),
                    autoprefixer(),
                  ],
                },
              },
            },
          ],
        },
        {
          test: /\.(png|jpe?g|gif|webp|avif)$/i,
          type: "asset",
          parser: {
            dataUrlCondition: {
              maxSize: 4 * 1024,
            },
          },
          generator: {
            filename: "images/[name].[contenthash:8][ext][query]",
          },
          use: isProd
            ? [
                {
                  loader: ImageMinimizerPlugin.loader,
                  options: {
                    minimizer: {
                      implementation: ImageMinimizerPlugin.sharpMinify,
                      options: {
                        encodeOptions: {
                          jpeg: { quality: 82 },
                          png: { quality: 80, compressionLevel: 9 },
                          webp: { quality: 82 },
                          avif: { quality: 55 },
                        },
                      },
                    },
                  },
                },
              ]
            : [],
        },
        {
          test: /\.svg$/i,
          type: "asset",
          parser: {
            dataUrlCondition: {
              maxSize: 4 * 1024,
            },
          },
          generator: {
            filename: "images/[name].[contenthash:8][ext][query]",
          },
          use: isProd
            ? [
                {
                  loader: ImageMinimizerPlugin.loader,
                  options: {
                    minimizer: {
                      implementation: ImageMinimizerPlugin.svgoMinify,
                      options: {
                        encodeOptions: {
                          multipass: true,
                          plugins: ["preset-default"],
                        },
                      },
                    },
                  },
                },
              ]
            : [],
        },
        {
          test: /\.(glb|gltf|bin)$/i,
          type: "asset/resource",
          generator: {
            filename: "models/[name].[contenthash:8][ext][query]",
          },
        },
        {
          test: /\.(woff2?|eot|ttf|otf)$/i,
          type: "asset/resource",
          generator: {
            filename: "fonts/[name].[contenthash:8][ext][query]",
          },
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "index.html"),
        inject: "body",
        scriptLoading: "defer",
        minify: isProd
          ? {
              collapseWhitespace: true,
              removeComments: true,
              removeRedundantAttributes: true,
              useShortDoctype: true,
            }
          : false,
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: publicPath,
            to: path.resolve(__dirname, "dist"),
            noErrorOnMissing: true,
            globOptions: {
              ignore: ["**/navbar-logo.jpg"],
            },
          },
        ],
      }),
      ...(isProd
        ? [
            new MiniCssExtractPlugin({
              filename: "css/[name].[contenthash:8].css",
              chunkFilename: "css/[name].[contenthash:8].chunk.css",
            }),
            new CompressionPlugin({
              filename: "[path][base].gz",
              algorithm: "gzip",
              test: /\.(js|css|html|svg)$/i,
              threshold: 10 * 1024,
              minRatio: 0.8,
            }),
            new CompressionPlugin({
              filename: "[path][base].br",
              algorithm: "brotliCompress",
              test: /\.(js|css|html|svg)$/i,
              compressionOptions: {
                params: {
                  [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
                },
              },
              threshold: 10 * 1024,
              minRatio: 0.8,
            }),
          ]
        : []),
    ],
    optimization: {
      minimize: isProd,
      concatenateModules: false,
      minimizer: isProd
        ? [
            new TerserPlugin({
              parallel: true,
              extractComments: false,
              terserOptions: {
                compress: {
                  passes: 2,
                  drop_console: true,
                  drop_debugger: true,
                },
                format: {
                  comments: false,
                },
              },
            }),
            new CssMinimizerPlugin({
              parallel: true,
            }),
          ]
        : [],
      runtimeChunk: "single",
      moduleIds: "deterministic",
      chunkIds: "deterministic",
      splitChunks: {
        chunks: "all",
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        minSize: 20 * 1024,
        cacheGroups: {
          reactVendor: {
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
            name: "react-vendor",
            priority: 50,
            enforce: true,
          },
          threeVendor: {
            test: /[\\/]node_modules[\\/](three|@react-three|three-stdlib|camera-controls|meshline|maath|suspend-react)[\\/]/,
            name: "three-vendor",
            priority: 40,
            enforce: true,
          },
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            priority: 20,
            reuseExistingChunk: true,
          },
          common: {
            minChunks: 2,
            name: "common",
            priority: 10,
            reuseExistingChunk: true,
          },
        },
      },
    },
  };
};

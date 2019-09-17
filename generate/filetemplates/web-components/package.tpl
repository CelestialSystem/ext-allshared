{
    "name": "@sencha/ext-web-components{bundle}",
    "version": "7.1.0",
    "main": "ext-web-components.module.js",
    "private": false,
    "bin": {
      "ext-web-components{bundle}": "./bin/ext-web-components{bundle}.js"
    },
    "peerDependencies": {},
    "scripts": {
      "watch": "npx babel ./lib --out-dir ./dist --watch",
      "build": "npx babel ./lib --out-dir ./dist",
      "prepare": "npm run build"
    },
    "homepage": "https://github.com/sencha/ext-web-components#readme",
    "dependencies": {
      "@babel/runtime": "^7.6.0",
      "script-loader": "^0.7.2",
      "comment-json": "^2.1.0"
    },
    "devDependencies": {
      "html-parsed-element": "^0.4.0",
      "@babel/cli": "^7.6.0",
      "@babel/core": "^7.6.0",
      "@babel/plugin-proposal-class-properties": "^7.5.5",
      "@babel/plugin-proposal-decorators": "^7.6.0",
      "@babel/plugin-proposal-export-namespace-from": "^7.5.2",
      "@babel/plugin-proposal-function-sent": "^7.5.0",
      "@babel/plugin-proposal-json-strings": "^7.2.0",
      "@babel/plugin-proposal-numeric-separator": "^7.2.0",
      "@babel/plugin-proposal-throw-expressions": "^7.2.0",
      "@babel/plugin-syntax-dynamic-import": "^7.2.0",
      "@babel/plugin-syntax-import-meta": "^7.2.0",
      "@babel/plugin-transform-runtime": "^7.6.0",
      "@babel/preset-env": "^7.6.0"
    },
    "repository": {
      "type": "git",
      "url": "git+https://github.com/sencha/ext-web-components{bundle}"
    },
    "keywords": [],
    "author": "Sencha",
    "license": "ISC"
  }
# package-require [![Build Status](https://travis-ci.org/JoshuaWise/package-require.svg?branch=master)](https://travis-ci.org/JoshuaWise/package-require)

## Installation

```bash
npm install --save package-require
```

## Usage

Require Node.js modules relative to the root of your project. Directories are scanned starting from the current module, towards the root directory, until the root of your project is found. The root of your project is considered to be the closest one with a `package.json` file. Files outside the root of your project cannot be loaded, even if you try loading them with `../../`.

```js
const pr = require('package-require');
pr(module, 'lib/my-js-module');
```

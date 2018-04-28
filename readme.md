# packument

**Fetch package metadata from the npm registry. Supports scopes and private registries. If you only need the metadata of a specific version, use [`packument-package`](https://www.npmjs.org/package/packument-package).**

[![npm status](http://img.shields.io/npm/v/packument.svg?style=flat-square)](https://www.npmjs.org/package/packument)
[![node](https://img.shields.io/node/v/packument.svg?style=flat-square)](https://www.npmjs.org/package/packument)
[![Travis build status](https://img.shields.io/travis/vweevers/packument.svg?style=flat-square&label=travis)](http://travis-ci.org/vweevers/packument)
[![AppVeyor build status](https://img.shields.io/appveyor/ci/vweevers/packument.svg?style=flat-square&label=appveyor)](https://ci.appveyor.com/project/vweevers/packument)
[![Dependency status](https://img.shields.io/david/vweevers/packument.svg?style=flat-square)](https://david-dm.org/vweevers/packument)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg?style=flat-square)](https://standardjs.com)

## example

```js
const packument = require('packument')

packument('levelup', (err, result) => {
  if (err) throw err
  console.log(result.versions['2.0.2'].dependencies)
})
```

## `packument(name[, opts], callback)`

Callback receives an error if any, a packument and response headers. Options:

- `headers`: custom headers (you can override any)
- `keepAlive`: shortcut for `headers: { connection: 'keep-alive' }`
- `full`: if true, fetch full metadata rather than an [abbreviated document](https://github.com/npm/registry/blob/master/docs/responses/package-metadata.md).

## `packument = packument.factory(opts)`

Preconfigure the function. For example, to always fetch full metadata:

```js
const packument = require('packument').factory({ full: true })

packument('levelup', (err, result) => {
  if (err)
  console.log(result._rev)
})
```

Combine it with an in-memory cache:

```js
const memoize = require('thunky-with-args')
const packument = memoize(require('packument').factory({ full: true }))

packument('levelup', (err, result) => {
  // It will make only one request
})

packument('levelup', (err, result) => {
  // Subsequent calls for the same package are cached
})
```

Reuse that cache in other modules:

```js
const memoize = require('thunky-with-args')
const packument = memoize(require('packument'))
const getPackage = require('packument-package').factory(packument)

getPackage('levelup', '~2.0.0', function (err, pkg) {
  if (err) throw err
  console.log(pkg.version)
})
```

## install

With [npm](https://npmjs.org) do:

```
npm install packument
```

## license

[MIT](http://opensource.org/licenses/MIT) © Vincent Weevers

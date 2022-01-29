'use strict'

const get = require('simple-get')
const registryUrl = require('registry-url')
const registryAuth = require('registry-auth-token')
const url = require('url')
const pkg = require('./package.json')

const UA = `packument/${pkg.version} (${pkg.homepage})`
const FULL = 'application/json'
const ABBREVIATED = 'application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*'

module.exports = factory()
module.exports.factory = factory

function factory (defaults) {
  return function (name, opts, callback) {
    if (typeof opts === 'function') {
      callback = opts
      opts = null
    }

    opts = Object.assign({}, defaults, opts)
    packument(name, opts, callback)
  }
}

function packument (name, opts, callback) {
  const scope = name.split('/')[0]
  const endpoint = registryUrl(scope)
  const auth = registryAuth(endpoint, { recursive: true })
  const path = encodeURIComponent(name).replace(/^%40/, '@')

  const headers = {
    'user-agent': UA,
    accept: opts.full ? FULL : ABBREVIATED
  }

  if (auth) headers.authorization = `${auth.type} ${auth.token}`
  if (opts.keepAlive) headers.connection = 'keep-alive'
  if (opts.headers) Object.assign(headers, opts.headers)

  // eslint-disable-next-line node/no-deprecated-api
  get.concat({ url: url.resolve(endpoint, path), headers }, function (err, res, buf) {
    if (err) return callback(err)
    if (res.statusCode === 404) return callback(new Error('package does not exist'))
    if (res.statusCode !== 200) return callback(new Error(`http ${res.statusCode}`))

    let packument

    try {
      packument = JSON.parse(buf)
    } catch (err) {
      return callback(err)
    }

    callback(null, packument, res.headers)
  })
}

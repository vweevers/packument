'use strict'

const test = require('tape')
const nock = require('nock')
const packument = require('.')
const version = require('./package.json').version

test('basic', function (t) {
  t.plan(3)

  nock('https://registry.npmjs.org')
    .get('/test')
    .reply(function (uri) {
      return [200, { foo: 'bar' }, { beep: 'boop' }]
    })

  packument('test', function (err, res, headers) {
    t.ifError(err, 'no error')
    t.same(res, { foo: 'bar' })
    t.same(headers.beep, 'boop')
  })
})

test('defaults to abbreviated metadata', function (t) {
  t.plan(2)

  nock('https://registry.npmjs.org')
    .get('/test')
    .reply(function (uri) {
      t.is(this.req.headers.accept, 'application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*')
      return [200]
    })

  packument('test', function (err) {
    t.ifError(err, 'no error')
  })
})

test('get full metadata', function (t) {
  t.plan(2)

  nock('https://registry.npmjs.org')
    .get('/test')
    .reply(function (uri) {
      t.is(this.req.headers.accept, 'application/json')
      return [200]
    })

  packument('test', { full: true }, function (err) {
    t.ifError(err, 'no error')
  })
})

test('keepAlive', function (t) {
  t.plan(2)

  nock('https://registry.npmjs.org')
    .get('/test')
    .reply(function (uri) {
      t.is(this.req.headers.connection, 'keep-alive')
      return [200]
    })

  packument('test', { keepAlive: true }, function (err) {
    t.ifError(err, 'no error')
  })
})

test('no keepAlive', function (t) {
  t.plan(2)

  nock('https://registry.npmjs.org')
    .get('/test')
    .reply(function (uri) {
      t.is(this.req.headers.connection, undefined)
      return [200]
    })

  packument('test', function (err) {
    t.ifError(err, 'no error')
  })
})

test('sets user agent', function (t) {
  t.plan(2)

  nock('https://registry.npmjs.org')
    .get('/test')
    .reply(function (uri) {
      t.is(this.req.headers['user-agent'], `packument/${version} (https://github.com/vweevers/packument)`)
      return [200]
    })

  packument('test', function (err) {
    t.ifError(err, 'no error')
  })
})

test('override user agent', function (t) {
  t.plan(2)

  nock('https://registry.npmjs.org')
    .get('/test')
    .reply(function (uri) {
      t.is(this.req.headers['user-agent'], 'beep')
      return [200]
    })

  packument('test', { headers: { 'user-agent': 'beep' } }, function (err) {
    t.ifError(err, 'no error')
  })
})

test('http 404', function (t) {
  t.plan(1)

  nock('https://registry.npmjs.org')
    .get('/test')
    .reply(404)

  packument('test', function (err) {
    t.is(err && err.message, 'package does not exist')
  })
})

test('http other than 200', function (t) {
  t.plan(1)

  nock('https://registry.npmjs.org')
    .get('/test')
    .reply(304)

  packument('test', function (err) {
    t.is(err && err.message, 'http 304')
  })
})

'use strict';

var should = require('chai').should(); // eslint-disable-line
var Promise = require('bluebird');

describe('english', function() {
  var Hexo = require('hexo');
  var hexo = new Hexo(__dirname);
  var Post = hexo.model('Post');
  var Category = hexo.model('Category');

  var ctx = {
    config: hexo.config
  };
  ctx.config.default = hexo.config;

  ctx.url_for = require('../../../node_modules/hexo/lib/plugins/helper/url_for').bind(ctx);

  var listCategories = require('../../../lib/helper/list_categories').bind(ctx);

  before(function() {
    return Post.insert([
      {source: 'one', slug: 'one', lang: 'en'},
      {source: 'two', slug: 'two', lang: 'en'},
      {source: 'number', slug: 'test', lang: 'en'},
      {source: 'three', slug: 'three', lang: 'en'},
      {source: 'uno', slug: 'uno', lang: 'es'},
      {source: 'dos', slug: 'dos', lang: 'es'},
      {source: 'test', slug: 'test', lang: 'es'},
      {source: 'tres', slug: 'tres', lang: 'es'}
    ]).then(function(posts) {
      return Promise.each([
        ['number'],
        ['number', 'even'],
        ['test'],
        ['number'],
        ['numero'],
        ['numero', 'par'],
        ['test'],
        ['numero']
      ], function(cats, i) {
        return posts[i].setCategories(cats);
      });
    }).then(function() {
      hexo.locals.invalidate();
      ctx.site = hexo.locals.toObject();
      ctx.page = ctx.site.posts.data[1];
    });
  });

  it('default', function() {
    var result = listCategories();

    result.should.eql([
      '<ul class="category-list">',
        '<li class="category-list-item">',
          '<a class="category-list-link" href="/en/categories/number/">number</a><span class="category-list-count">3</span>',
          '<ul class="category-list-child">',
            '<li class="category-list-item">',
              '<a class="category-list-link" href="/en/categories/number/even/">even</a><span class="category-list-count">1</span>',
            '</li>',
          '</ul>',
        '</li>',
        '<li class="category-list-item">',
          '<a class="category-list-link" href="/en/categories/test/">test</a><span class="category-list-count">1</span>',
        '</li>',
      '</ul>'
    ].join(''));
  });

  it('specified collection', function() {
    var result = listCategories(Category.find({
      parent: {$exists: false}
    }));

    result.should.eql([
      '<ul class="category-list">',
        '<li class="category-list-item">',
          '<a class="category-list-link" href="/en/categories/number/">number</a><span class="category-list-count">3</span>',
        '</li>',
        '<li class="category-list-item">',
          '<a class="category-list-link" href="/en/categories/test/">test</a><span class="category-list-count">1</span>',
        '</li>',
      '</ul>'
    ].join(''));
  });

  it('style: false', function() {
    var result = listCategories({
      style: false
    });

    result.should.eql([
      '<a class="category-link" href="/en/categories/number/">number<span class="category-count">3</span></a>',
      '<a class="category-link" href="/en/categories/number/even/">even<span class="category-count">1</span></a>',
      '<a class="category-link" href="/en/categories/test/">test<span class="category-count">1</span></a>'
    ].join(', '));
  });

  it('show_count: false', function() {
    var result = listCategories({
      show_count: false
    });

    result.should.eql([
      '<ul class="category-list">',
        '<li class="category-list-item">',
          '<a class="category-list-link" href="/en/categories/number/">number</a>',
          '<ul class="category-list-child">',
            '<li class="category-list-item">',
              '<a class="category-list-link" href="/en/categories/number/even/">even</a>',
            '</li>',
          '</ul>',
        '</li>',
        '<li class="category-list-item">',
          '<a class="category-list-link" href="/en/categories/test/">test</a>',
        '</li>',
      '</ul>'
    ].join(''));
  });

  it('class', function() {
    var result = listCategories({
      class: 'test'
    });

    result.should.eql([
      '<ul class="test-list">',
        '<li class="test-list-item">',
          '<a class="test-list-link" href="/en/categories/number/">number</a><span class="test-list-count">3</span>',
          '<ul class="test-list-child">',
            '<li class="test-list-item">',
              '<a class="test-list-link" href="/en/categories/number/even/">even</a><span class="test-list-count">1</span>',
            '</li>',
          '</ul>',
        '</li>',
        '<li class="test-list-item">',
          '<a class="test-list-link" href="/en/categories/test/">test</a><span class="test-list-count">1</span>',
        '</li>',
      '</ul>'
    ].join(''));
  });

  it('depth', function() {
    var result = listCategories({
      depth: 1
    });

    result.should.eql([
      '<ul class="category-list">',
        '<li class="category-list-item">',
          '<a class="category-list-link" href="/en/categories/number/">number</a><span class="category-list-count">3</span>',
        '</li>',
        '<li class="category-list-item">',
          '<a class="category-list-link" href="/en/categories/test/">test</a><span class="category-list-count">1</span>',
        '</li>',
      '</ul>'
    ].join(''));
  });

  it('orderby', function() {
    var result = listCategories({
      orderby: 'length'
    });

    result.should.eql([
      '<ul class="category-list">',
        '<li class="category-list-item">',
          '<a class="category-list-link" href="/en/categories/test/">test</a><span class="category-list-count">1</span>',
        '</li>',
        '<li class="category-list-item">',
          '<a class="category-list-link" href="/en/categories/number/">number</a><span class="category-list-count">3</span>',
          '<ul class="category-list-child">',
            '<li class="category-list-item">',
              '<a class="category-list-link" href="/en/categories/number/even/">even</a><span class="category-list-count">1</span>',
            '</li>',
          '</ul>',
        '</li>',
      '</ul>'
    ].join(''));
  });

  it('order', function() {
    var result = listCategories({
      order: -1
    });

    result.should.eql([
      '<ul class="category-list">',
        '<li class="category-list-item">',
          '<a class="category-list-link" href="/en/categories/test/">test</a><span class="category-list-count">1</span>',
        '</li>',
        '<li class="category-list-item">',
          '<a class="category-list-link" href="/en/categories/number/">number</a><span class="category-list-count">3</span>',
          '<ul class="category-list-child">',
            '<li class="category-list-item">',
              '<a class="category-list-link" href="/en/categories/number/even/">even</a><span class="category-list-count">1</span>',
            '</li>',
          '</ul>',
        '</li>',
      '</ul>'
    ].join(''));
  });

  it('transform', function() {
    var result = listCategories({
      transform: function(name) {
        return name.toUpperCase();
      }
    });

    result.should.eql([
      '<ul class="category-list">',
        '<li class="category-list-item">',
          '<a class="category-list-link" href="/en/categories/number/">NUMBER</a><span class="category-list-count">3</span>',
          '<ul class="category-list-child">',
            '<li class="category-list-item">',
              '<a class="category-list-link" href="/en/categories/number/even/">EVEN</a><span class="category-list-count">1</span>',
            '</li>',
          '</ul>',
        '</li>',
        '<li class="category-list-item">',
          '<a class="category-list-link" href="/en/categories/test/">TEST</a><span class="category-list-count">1</span>',
        '</li>',
      '</ul>'
    ].join(''));
  });

  it('separator', function() {
    var result = listCategories({
      style: false,
      separator: ''
    });

    result.should.eql([
      '<a class="category-link" href="/en/categories/number/">number<span class="category-count">3</span></a>',
      '<a class="category-link" href="/en/categories/number/even/">even<span class="category-count">1</span></a>',
      '<a class="category-link" href="/en/categories/test/">test<span class="category-count">1</span></a>'
    ].join(''));
  });

  it('children-indicator', function() {
    var result = listCategories({
      children_indicator: 'has-children'
    });

    result.should.eql([
      '<ul class="category-list">',
        '<li class="category-list-item has-children">',
          '<a class="category-list-link" href="/en/categories/number/">number</a><span class="category-list-count">3</span>',
          '<ul class="category-list-child">',
            '<li class="category-list-item">',
              '<a class="category-list-link" href="/en/categories/number/even/">even</a><span class="category-list-count">1</span>',
            '</li>',
          '</ul>',
        '</li>',
        '<li class="category-list-item">',
          '<a class="category-list-link" href="/en/categories/test/">test</a><span class="category-list-count">1</span>',
        '</li>',
      '</ul>'
    ].join(''));
  });

  it('show-current', function() {
    var result = listCategories({
      show_current: true
    });

    result.should.eql([
      '<ul class="category-list">',
        '<li class="category-list-item">',
          '<a class="category-list-link current" href="/en/categories/number/">number</a><span class="category-list-count">3</span>',
          '<ul class="category-list-child">',
            '<li class="category-list-item">',
              '<a class="category-list-link current" href="/en/categories/number/even/">even</a><span class="category-list-count">1</span>',
            '</li>',
          '</ul>',
        '</li>',
        '<li class="category-list-item">',
          '<a class="category-list-link" href="/en/categories/test/">test</a><span class="category-list-count">1</span>',
        '</li>',
      '</ul>'
    ].join(''));
  });
});

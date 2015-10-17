'use strict';

var should = require('chai').should();
var fs = require('hexo-fs');
var pathFn = require('path');
var Hexo = require('hexo');

describe('optimal', function() {
  var hexo = new Hexo(__dirname, {
    silent: true
  });
  var baseDir = pathFn.join(__dirname, 'data_test');
  var Post = hexo.model('Post');
  var generator = require('../lib/generator').bind(hexo);
  var posts;
  var locals;
  var processor = require('../node_modules/hexo/lib/plugins/processor/data');
  var process = processor.process.bind(hexo);
  var source = hexo.source;
  var File = source.File;
  var Data = hexo.model('Data');

  function newFile(options) {
    var path = options.path;
    options.params = {
      path: path
    };
    options.path = '_data/' + path;
    options.source = pathFn.join(source.base, options.path);
    return new File(options);
  }

  before(function() {
    return fs.mkdirs(baseDir).then(function() {
      hexo.init();
      process(newFile({
        path: 'config_en.yml',
        type: 'create',
        content: new Buffer('category_dir: categories')
      }));
      process(newFile({
        path: 'config_es.yml',
        type: 'create',
        content: new Buffer('category_dir: categories')
      }));
    });
  });

  after(function() {
    return fs.rmdir(baseDir);
  });

  // Default config
  hexo.config.language = ['en', 'es'];
  hexo.config.category_generator = {
    per_page: 10
  };

  before(function() {
    return Post.insert([{
      source: 'one',
      slug: 'one',
      date: 1e8,
      lang: 'en',
      label: 'post-one'
    }, {
      source: 'uno',
      slug: 'uno',
      date: 1e8,
      lang: 'es',
      label: 'post-one'
    }, {
      source: 'two',
      slug: 'two',
      date: 1e8 + 1,
      lang: 'en',
      label: 'post-two'
    }, {
      source: 'dos',
      slug: 'dos',
      date: 1e8 + 1,
      lang: 'es',
      label: 'post-two'
    }]).then(function(data) {
      posts = data;

      return posts[0].setCategories(['number']).then(function() {
        return posts[1].setCategories(['numero']);
      }).then(function() {
        return posts[2].setCategories(['number']);
      }).then(function() {
        return posts[3].setCategories(['numero']);
      });
    }).then(function() {
      locals = hexo.locals.toObject();
    });
  });

  it('pagination enabled', function() {
    hexo.config.category_generator.per_page = 1;

    var result = generator(locals);
    console.log(locals);

    result.length.should.eql(4);

    for (var i = 0, len = result.length; i < len; i++) {
      result[i].layout.should.eql(['category', 'archive', 'index']);
    }

    result[0].path.should.eql('en/categories/number/');
    result[0].data.base.should.eql('en/categories/number/');
    result[0].data.total.should.eql(2);
    result[0].data.current.should.eql(1);
    result[0].data.current_url.should.eql('en/categories/number/');
    result[0].data.posts.length.should.eql(1);
    result[0].data.posts.eq(0)._id.should.eql(posts[2]._id);
    result[0].data.prev.should.eql(0);
    result[0].data.prev_link.should.eql('');
    result[0].data.next.should.eql(2);
    result[0].data.next_link.should.eql('en/categories/number/page/2/');
    result[0].data.category.should.eql('number');
    result[0].data.alternates.length.should.eql(2);
    result[0].data.alternates[0].title.should.eql('number');
    result[0].data.alternates[0].lang.should.eql('en');
    result[0].data.alternates[0].path.should.eql('en/categories/number');
    result[0].data.alternates[1].title.should.eql('numero');
    result[0].data.alternates[1].lang.should.eql('es');
    result[0].data.alternates[1].path.should.eql('es/categories/numero');

    result[1].path.should.eql('en/categories/number/page/2/');
    result[1].data.base.should.eql('en/categories/number/');
    result[1].data.total.should.eql(2);
    result[1].data.current.should.eql(2);
    result[1].data.current_url.should.eql('en/categories/number/page/2/');
    result[1].data.posts.length.should.eql(1);
    result[1].data.posts.eq(0)._id.should.eql(posts[0]._id);
    result[1].data.prev.should.eql(1);
    result[1].data.prev_link.should.eql('en/categories/number/');
    result[1].data.next.should.eql(0);
    result[1].data.next_link.should.eql('');
    result[1].data.category.should.eql('number');
    result[1].data.alternates.length.should.eql(2);
    result[1].data.alternates[0].title.should.eql('number');
    result[1].data.alternates[0].lang.should.eql('en');
    result[1].data.alternates[0].path.should.eql('en/categories/number');
    result[1].data.alternates[1].title.should.eql('numero');
    result[1].data.alternates[1].lang.should.eql('es');
    result[1].data.alternates[1].path.should.eql('es/categories/numero');

    result[2].path.should.eql('es/categories/numero/');
    result[2].data.base.should.eql('es/categories/numero/');
    result[2].data.total.should.eql(2);
    result[2].data.current.should.eql(1);
    result[2].data.current_url.should.eql('es/categories/numero/');
    result[2].data.posts.length.should.eql(1);
    result[2].data.posts.eq(0)._id.should.eql(posts[3]._id);
    result[2].data.prev.should.eql(0);
    result[2].data.prev_link.should.eql('');
    result[2].data.next.should.eql(2);
    result[2].data.next_link.should.eql('es/categories/numero/page/2/');
    result[2].data.category.should.eql('numero');
    result[2].data.alternates.length.should.eql(2);
    result[2].data.alternates[0].title.should.eql('number');
    result[2].data.alternates[0].lang.should.eql('en');
    result[2].data.alternates[0].path.should.eql('en/categories/number');
    result[2].data.alternates[1].title.should.eql('numero');
    result[2].data.alternates[1].lang.should.eql('es');
    result[2].data.alternates[1].path.should.eql('es/categories/numero');

    result[3].path.should.eql('es/categories/numero/page/2/');
    result[3].data.base.should.eql('es/categories/numero/');
    result[3].data.total.should.eql(2);
    result[3].data.current.should.eql(2);
    result[3].data.current_url.should.eql('es/categories/numero/page/2/');
    result[3].data.posts.length.should.eql(1);
    result[3].data.posts.eq(0)._id.should.eql(posts[1]._id);
    result[3].data.prev.should.eql(1);
    result[3].data.prev_link.should.eql('es/categories/numero/');
    result[3].data.next.should.eql(0);
    result[3].data.next_link.should.eql('');
    result[3].data.category.should.eql('numero');
    result[3].data.alternates.length.should.eql(2);
    result[3].data.alternates[0].title.should.eql('number');
    result[3].data.alternates[0].lang.should.eql('en');
    result[3].data.alternates[0].path.should.eql('en/categories/number');
    result[3].data.alternates[1].title.should.eql('numero');
    result[3].data.alternates[1].lang.should.eql('es');
    result[3].data.alternates[1].path.should.eql('es/categories/numero');

    // Restore config
    hexo.config.category_generator.per_page = 10;
  });

  it('pagination disabled', function() {
    hexo.config.category_generator.per_page = 0;

    var result = generator(locals);

    result.length.should.eql(2);

    for (var i = 0, len = result.length; i < len; i++) {
      result[i].layout.should.eql(['category', 'archive', 'index']);
    }

    result[0].path.should.eql('en/categories/number/');
    result[0].data.base.should.eql('en/categories/number/');
    result[0].data.total.should.eql(1);
    result[0].data.current.should.eql(1);
    result[0].data.current_url.should.eql('en/categories/number/');
    result[0].data.posts.length.should.eql(2);
    result[0].data.posts.eq(0)._id.should.eql(posts[2]._id);
    result[0].data.posts.eq(1)._id.should.eql(posts[0]._id);
    result[0].data.prev.should.eql(0);
    result[0].data.prev_link.should.eql('');
    result[0].data.next.should.eql(0);
    result[0].data.next_link.should.eql('');
    result[0].data.category.should.eql('number');
    result[0].data.alternates.length.should.eql(2);
    result[0].data.alternates[0].title.should.eql('number');
    result[0].data.alternates[0].lang.should.eql('en');
    result[0].data.alternates[0].path.should.eql('en/categories/number');
    result[0].data.alternates[1].title.should.eql('numero');
    result[0].data.alternates[1].lang.should.eql('es');
    result[0].data.alternates[1].path.should.eql('es/categories/numero');

    result[1].path.should.eql('es/categories/numero/');
    result[1].data.base.should.eql('es/categories/numero/');
    result[1].data.total.should.eql(1);
    result[1].data.current.should.eql(1);
    result[1].data.current_url.should.eql('es/categories/numero/');
    result[1].data.posts.length.should.eql(2);
    result[1].data.posts.eq(0)._id.should.eql(posts[3]._id);
    result[1].data.posts.eq(1)._id.should.eql(posts[1]._id);
    result[1].data.prev.should.eql(0);
    result[1].data.prev_link.should.eql('');
    result[1].data.next.should.eql(0);
    result[1].data.next_link.should.eql('');
    result[1].data.category.should.eql('numero');
    result[1].data.alternates.length.should.eql(2);
    result[1].data.alternates[0].title.should.eql('number');
    result[1].data.alternates[0].lang.should.eql('en');
    result[1].data.alternates[0].path.should.eql('en/categories/number');
    result[1].data.alternates[1].title.should.eql('numero');
    result[1].data.alternates[1].lang.should.eql('es');
    result[1].data.alternates[1].path.should.eql('es/categories/numero');

    // Restore config
    hexo.config.category_generator.per_page = 10;
  });
});

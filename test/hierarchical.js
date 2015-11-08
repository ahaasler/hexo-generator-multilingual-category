'use strict';

var should = require('chai').should();
var fs = require('hexo-fs');
var pathFn = require('path');
var Hexo = require('hexo');

describe('hierarchical', function() {
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
        content: new Buffer('category_dir: categories\npagination_dir: page')
      }));
      process(newFile({
        path: 'config_es.yml',
        type: 'create',
        content: new Buffer('category_dir: categorias\npagination_dir: pagina')
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

      return posts[0].setCategories(['number', 'uneven']).then(function() {
        return posts[1].setCategories(['numero', 'impar']);
      }).then(function() {
        return posts[2].setCategories(['number', 'even']);
      }).then(function() {
        return posts[3].setCategories(['numero', 'par']);
      });
    }).then(function() {
      locals = hexo.locals.toObject();
    });
  });

  it('pagination enabled', function() {
    hexo.config.category_generator.per_page = 1;

    var result = generator(locals);

    result.length.should.eql(8);

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
    result[0].data.lang.should.eql('en');
    result[0].data.alternates.length.should.eql(2);
    result[0].data.alternates[0].title.should.eql('number');
    result[0].data.alternates[0].lang.should.eql('en');
    result[0].data.alternates[0].path.should.eql('en/categories/number/');
    result[0].data.alternates[1].title.should.eql('numero');
    result[0].data.alternates[1].lang.should.eql('es');
    result[0].data.alternates[1].path.should.eql('es/categorias/numero/');

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
    result[1].data.lang.should.eql('en');
    result[1].data.alternates.length.should.eql(2);
    result[1].data.alternates[0].title.should.eql('number');
    result[1].data.alternates[0].lang.should.eql('en');
    result[1].data.alternates[0].path.should.eql('en/categories/number/');
    result[1].data.alternates[1].title.should.eql('numero');
    result[1].data.alternates[1].lang.should.eql('es');
    result[1].data.alternates[1].path.should.eql('es/categorias/numero/');

    result[2].path.should.eql('en/categories/number/uneven/');
    result[2].data.base.should.eql('en/categories/number/uneven/');
    result[2].data.total.should.eql(1);
    result[2].data.current.should.eql(1);
    result[2].data.current_url.should.eql('en/categories/number/uneven/');
    result[2].data.posts.length.should.eql(1);
    result[2].data.posts.eq(0)._id.should.eql(posts[0]._id);
    result[2].data.prev.should.eql(0);
    result[2].data.prev_link.should.eql('');
    result[2].data.next.should.eql(0);
    result[2].data.next_link.should.eql('');
    result[2].data.category.should.eql('uneven');
    result[2].data.lang.should.eql('en');
    result[2].data.alternates.length.should.eql(2);
    result[2].data.alternates[0].title.should.eql('uneven');
    result[2].data.alternates[0].lang.should.eql('en');
    result[2].data.alternates[0].path.should.eql('en/categories/number/uneven/');
    result[2].data.alternates[1].title.should.eql('impar');
    result[2].data.alternates[1].lang.should.eql('es');
    result[2].data.alternates[1].path.should.eql('es/categorias/numero/impar/');

    result[3].path.should.eql('es/categorias/numero/');
    result[3].data.base.should.eql('es/categorias/numero/');
    result[3].data.total.should.eql(2);
    result[3].data.current.should.eql(1);
    result[3].data.current_url.should.eql('es/categorias/numero/');
    result[3].data.posts.length.should.eql(1);
    result[3].data.posts.eq(0)._id.should.eql(posts[3]._id);
    result[3].data.prev.should.eql(0);
    result[3].data.prev_link.should.eql('');
    result[3].data.next.should.eql(2);
    result[3].data.next_link.should.eql('es/categorias/numero/pagina/2/');
    result[3].data.category.should.eql('numero');
    result[3].data.lang.should.eql('es');
    result[3].data.alternates.length.should.eql(2);
    result[3].data.alternates[0].title.should.eql('number');
    result[3].data.alternates[0].lang.should.eql('en');
    result[3].data.alternates[0].path.should.eql('en/categories/number/');
    result[3].data.alternates[1].title.should.eql('numero');
    result[3].data.alternates[1].lang.should.eql('es');
    result[3].data.alternates[1].path.should.eql('es/categorias/numero/');

    result[4].path.should.eql('es/categorias/numero/pagina/2/');
    result[4].data.base.should.eql('es/categorias/numero/');
    result[4].data.total.should.eql(2);
    result[4].data.current.should.eql(2);
    result[4].data.current_url.should.eql('es/categorias/numero/pagina/2/');
    result[4].data.posts.length.should.eql(1);
    result[4].data.posts.eq(0)._id.should.eql(posts[1]._id);
    result[4].data.prev.should.eql(1);
    result[4].data.prev_link.should.eql('es/categorias/numero/');
    result[4].data.next.should.eql(0);
    result[4].data.next_link.should.eql('');
    result[4].data.category.should.eql('numero');
    result[4].data.lang.should.eql('es');
    result[4].data.alternates.length.should.eql(2);
    result[4].data.alternates[0].title.should.eql('number');
    result[4].data.alternates[0].lang.should.eql('en');
    result[4].data.alternates[0].path.should.eql('en/categories/number/');
    result[4].data.alternates[1].title.should.eql('numero');
    result[4].data.alternates[1].lang.should.eql('es');
    result[4].data.alternates[1].path.should.eql('es/categorias/numero/');

    result[5].path.should.eql('es/categorias/numero/impar/');
    result[5].data.base.should.eql('es/categorias/numero/impar/');
    result[5].data.total.should.eql(1);
    result[5].data.current.should.eql(1);
    result[5].data.current_url.should.eql('es/categorias/numero/impar/');
    result[5].data.posts.length.should.eql(1);
    result[5].data.posts.eq(0)._id.should.eql(posts[1]._id);
    result[5].data.prev.should.eql(0);
    result[5].data.prev_link.should.eql('');
    result[5].data.next.should.eql(0);
    result[5].data.next_link.should.eql('');
    result[5].data.category.should.eql('impar');
    result[5].data.lang.should.eql('es');
    result[5].data.alternates.length.should.eql(2);
    result[5].data.alternates[0].title.should.eql('uneven');
    result[5].data.alternates[0].lang.should.eql('en');
    result[5].data.alternates[0].path.should.eql('en/categories/number/uneven/');
    result[5].data.alternates[1].title.should.eql('impar');
    result[5].data.alternates[1].lang.should.eql('es');
    result[5].data.alternates[1].path.should.eql('es/categorias/numero/impar/');

    result[6].path.should.eql('en/categories/number/even/');
    result[6].data.base.should.eql('en/categories/number/even/');
    result[6].data.total.should.eql(1);
    result[6].data.current.should.eql(1);
    result[6].data.current_url.should.eql('en/categories/number/even/');
    result[6].data.posts.length.should.eql(1);
    result[6].data.posts.eq(0)._id.should.eql(posts[2]._id);
    result[6].data.prev.should.eql(0);
    result[6].data.prev_link.should.eql('');
    result[6].data.next.should.eql(0);
    result[6].data.next_link.should.eql('');
    result[6].data.category.should.eql('even');
    result[6].data.lang.should.eql('en');
    result[6].data.alternates.length.should.eql(2);
    result[6].data.alternates[0].title.should.eql('even');
    result[6].data.alternates[0].lang.should.eql('en');
    result[6].data.alternates[0].path.should.eql('en/categories/number/even/');
    result[6].data.alternates[1].title.should.eql('par');
    result[6].data.alternates[1].lang.should.eql('es');
    result[6].data.alternates[1].path.should.eql('es/categorias/numero/par/');

    result[7].path.should.eql('es/categorias/numero/par/');
    result[7].data.base.should.eql('es/categorias/numero/par/');
    result[7].data.total.should.eql(1);
    result[7].data.current.should.eql(1);
    result[7].data.current_url.should.eql('es/categorias/numero/par/');
    result[7].data.posts.length.should.eql(1);
    result[7].data.posts.eq(0)._id.should.eql(posts[3]._id);
    result[7].data.prev.should.eql(0);
    result[7].data.prev_link.should.eql('');
    result[7].data.next.should.eql(0);
    result[7].data.next_link.should.eql('');
    result[7].data.category.should.eql('par');
    result[7].data.lang.should.eql('es');
    result[7].data.alternates.length.should.eql(2);
    result[7].data.alternates[0].title.should.eql('even');
    result[7].data.alternates[0].lang.should.eql('en');
    result[7].data.alternates[0].path.should.eql('en/categories/number/even/');
    result[7].data.alternates[1].title.should.eql('par');
    result[7].data.alternates[1].lang.should.eql('es');
    result[7].data.alternates[1].path.should.eql('es/categorias/numero/par/');

    // Restore config
    hexo.config.category_generator.per_page = 10;
  });

  it('pagination disabled', function() {
    hexo.config.category_generator.per_page = 0;

    var result = generator(locals);

    result.length.should.eql(6);

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
    result[0].data.lang.should.eql('en');
    result[0].data.alternates.length.should.eql(2);
    result[0].data.alternates[0].title.should.eql('number');
    result[0].data.alternates[0].lang.should.eql('en');
    result[0].data.alternates[0].path.should.eql('en/categories/number/');
    result[0].data.alternates[1].title.should.eql('numero');
    result[0].data.alternates[1].lang.should.eql('es');
    result[0].data.alternates[1].path.should.eql('es/categorias/numero/');

    result[1].path.should.eql('en/categories/number/uneven/');
    result[1].data.base.should.eql('en/categories/number/uneven/');
    result[1].data.total.should.eql(1);
    result[1].data.current.should.eql(1);
    result[1].data.current_url.should.eql('en/categories/number/uneven/');
    result[1].data.posts.length.should.eql(1);
    result[1].data.posts.eq(0)._id.should.eql(posts[0]._id);
    result[1].data.prev.should.eql(0);
    result[1].data.prev_link.should.eql('');
    result[1].data.next.should.eql(0);
    result[1].data.next_link.should.eql('');
    result[1].data.category.should.eql('uneven');
    result[1].data.lang.should.eql('en');
    result[1].data.alternates.length.should.eql(2);
    result[1].data.alternates[0].title.should.eql('uneven');
    result[1].data.alternates[0].lang.should.eql('en');
    result[1].data.alternates[0].path.should.eql('en/categories/number/uneven/');
    result[1].data.alternates[1].title.should.eql('impar');
    result[1].data.alternates[1].lang.should.eql('es');
    result[1].data.alternates[1].path.should.eql('es/categorias/numero/impar/');

    result[2].path.should.eql('es/categorias/numero/');
    result[2].data.base.should.eql('es/categorias/numero/');
    result[2].data.total.should.eql(1);
    result[2].data.current.should.eql(1);
    result[2].data.current_url.should.eql('es/categorias/numero/');
    result[2].data.posts.length.should.eql(2);
    result[2].data.posts.eq(0)._id.should.eql(posts[3]._id);
    result[2].data.posts.eq(1)._id.should.eql(posts[1]._id);
    result[2].data.prev.should.eql(0);
    result[2].data.prev_link.should.eql('');
    result[2].data.next.should.eql(0);
    result[2].data.next_link.should.eql('');
    result[2].data.category.should.eql('numero');
    result[2].data.lang.should.eql('es');
    result[2].data.alternates.length.should.eql(2);
    result[2].data.alternates[0].title.should.eql('number');
    result[2].data.alternates[0].lang.should.eql('en');
    result[2].data.alternates[0].path.should.eql('en/categories/number/');
    result[2].data.alternates[1].title.should.eql('numero');
    result[2].data.alternates[1].lang.should.eql('es');
    result[2].data.alternates[1].path.should.eql('es/categorias/numero/');

    result[3].path.should.eql('es/categorias/numero/impar/');
    result[3].data.base.should.eql('es/categorias/numero/impar/');
    result[3].data.total.should.eql(1);
    result[3].data.current.should.eql(1);
    result[3].data.current_url.should.eql('es/categorias/numero/impar/');
    result[3].data.posts.length.should.eql(1);
    result[3].data.posts.eq(0)._id.should.eql(posts[1]._id);
    result[3].data.prev.should.eql(0);
    result[3].data.prev_link.should.eql('');
    result[3].data.next.should.eql(0);
    result[3].data.next_link.should.eql('');
    result[3].data.category.should.eql('impar');
    result[3].data.lang.should.eql('es');
    result[3].data.alternates.length.should.eql(2);
    result[3].data.alternates[0].title.should.eql('uneven');
    result[3].data.alternates[0].lang.should.eql('en');
    result[3].data.alternates[0].path.should.eql('en/categories/number/uneven/');
    result[3].data.alternates[1].title.should.eql('impar');
    result[3].data.alternates[1].lang.should.eql('es');
    result[3].data.alternates[1].path.should.eql('es/categorias/numero/impar/');

    result[4].path.should.eql('en/categories/number/even/');
    result[4].data.base.should.eql('en/categories/number/even/');
    result[4].data.total.should.eql(1);
    result[4].data.current.should.eql(1);
    result[4].data.current_url.should.eql('en/categories/number/even/');
    result[4].data.posts.length.should.eql(1);
    result[4].data.posts.eq(0)._id.should.eql(posts[2]._id);
    result[4].data.prev.should.eql(0);
    result[4].data.prev_link.should.eql('');
    result[4].data.next.should.eql(0);
    result[4].data.next_link.should.eql('');
    result[4].data.category.should.eql('even');
    result[4].data.lang.should.eql('en');
    result[4].data.alternates.length.should.eql(2);
    result[4].data.alternates[0].title.should.eql('even');
    result[4].data.alternates[0].lang.should.eql('en');
    result[4].data.alternates[0].path.should.eql('en/categories/number/even/');
    result[4].data.alternates[1].title.should.eql('par');
    result[4].data.alternates[1].lang.should.eql('es');
    result[4].data.alternates[1].path.should.eql('es/categorias/numero/par/');

    result[5].path.should.eql('es/categorias/numero/par/');
    result[5].data.base.should.eql('es/categorias/numero/par/');
    result[5].data.total.should.eql(1);
    result[5].data.current.should.eql(1);
    result[5].data.current_url.should.eql('es/categorias/numero/par/');
    result[5].data.posts.length.should.eql(1);
    result[5].data.posts.eq(0)._id.should.eql(posts[3]._id);
    result[5].data.prev.should.eql(0);
    result[5].data.prev_link.should.eql('');
    result[5].data.next.should.eql(0);
    result[5].data.next_link.should.eql('');
    result[5].data.category.should.eql('par');
    result[5].data.lang.should.eql('es');
    result[5].data.alternates.length.should.eql(2);
    result[5].data.alternates[0].title.should.eql('even');
    result[5].data.alternates[0].lang.should.eql('en');
    result[5].data.alternates[0].path.should.eql('en/categories/number/even/');
    result[5].data.alternates[1].title.should.eql('par');
    result[5].data.alternates[1].lang.should.eql('es');
    result[5].data.alternates[1].path.should.eql('es/categorias/numero/par/');

    // Restore config
    hexo.config.category_generator.per_page = 10;
  });
});

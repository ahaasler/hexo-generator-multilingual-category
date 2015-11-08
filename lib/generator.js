'use strict';

var pagination = require('hexo-pagination');
var _ = require('lodash');
var multilingual = require('hexo-multilingual');

module.exports = function(locals) {
  var config = this.config;
  function _c(value, lang) {
    return multilingual.util._c(value, lang, config, locals);
  }
  function getDepth(category) {
    return category.path.split('/').length - 2;
  }

  return locals.categories.reduce(function(result, category) {
    if (!category.length) return result;
    _.each(config.language, function(categoryLang) {
      var posts = category.posts.sort('-date').filter(function(post) {
        return post.lang == categoryLang;
      });
      // Check if category has posts
      if (!posts.length) {
        return;
      }
      // Get alternates for each language
      var alternates = [];
      _.each(config.language, function(altLang) {
        function getAlternateCategory() {
          var altCategory;
          _.each(posts.toArray(), function(post) {
            var altPost = locals.posts.filter(function(altPost) {
              return altPost.lang == altLang && altPost.label == post.label;
            }).toArray()[0];
            if (altPost !== undefined && altPost.categories !== undefined && altPost.categories.toArray().length > 0) {
              for (var i = 0; i < altPost.categories.toArray().length; i++) {
                if (getDepth(category) === getDepth(altPost.categories.toArray()[i])) {
                  altCategory = altPost.categories.toArray()[i];
                  // Break lodash each
                  return false;
                }
              }
            }
          });
          return altCategory;
        }
        var alternateCategory = getAlternateCategory();
        if (alternateCategory !== undefined) {
          alternates.push({
            title: alternateCategory.name,
            lang: altLang,
            path: altLang + '/' + alternateCategory.path.replace(config.category_dir, _c('category_dir', altLang))
          });
        }
      });
      // Generate category pages
      result = result.concat(pagination(categoryLang + '/' + category.path.replace(config.category_dir, _c('category_dir', categoryLang)), posts, {
        perPage: _c('category_generator.per_page', categoryLang),
        layout: ['category', 'archive', 'index'],
        format: _c('pagination_dir', categoryLang) + '/%d/',
        data: {
          category: category.name,
          lang: categoryLang,
          alternates: alternates
        }
      }));
    });

    return result;
  }, []);
};

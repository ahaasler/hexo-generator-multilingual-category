'use strict';

var pagination = require('hexo-pagination');
var _ = require('lodash');

module.exports = function(locals) {
  var config = this.config;
  var perPage = config.category_generator.per_page;
  var paginationDir = config.pagination_dir || 'page';

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
              altCategory = altPost.categories.toArray()[altPost.categories.toArray().length - 1];
              // Break lodash each
              return false;
            }
          });
          return altCategory;
        }
        var alternateCategory = getAlternateCategory();
        if (alternateCategory !== undefined) {
          alternates.push({
            title: alternateCategory.name,
            lang: altLang,
            path: altLang + '/' + alternateCategory.path
          });
        }
      });
      // Generate category pages
      result = result.concat(pagination(categoryLang + '/' + category.path, posts, {
        perPage: perPage,
        layout: ['category', 'archive', 'index'],
        format: paginationDir + '/%d/',
        data: {
          category: category.name,
          alternates: alternates
        }
      }));
    });

    return result;
  }, []);
};

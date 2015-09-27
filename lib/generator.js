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
      // Get alternates
      var alternates = [];
      _.each(config.language, function(altLang) {
        var categoryAppearances = {};

        function addAppearance(name) {
          if (categoryAppearances[name] !== undefined) {
            categoryAppearances[name] += 1;
          } else {
            categoryAppearances[name] = 1;
          }
        }
        _.each(posts.toArray(), function(post) {
          var altPost = locals.posts.filter(function(altPost) {
            return altPost.lang == altLang && altPost.label == post.label;
          }).toArray()[0];
          if (altPost !== undefined) {
            _.each(altPost.categories.toArray(), function(category) {
              addAppearance(category.name);
            });
          }
        });
        // Get the alternate category with more appearances
        var alternateCategory;
        var alternateCategoryAppearances = 0;
        for (var name in categoryAppearances) {
          if (categoryAppearances.hasOwnProperty(name)) {
            if (categoryAppearances[name] > alternateCategoryAppearances) {
              alternateCategory = name;
              alternateCategoryAppearances = categoryAppearances[name];
            }
          }
        }
        if (alternateCategoryAppearances > 0) {
          alternates.push({
            title: alternateCategory,
            lang: altLang,
            path: altLang + '/' + config.category_dir + '/' + alternateCategory
          });
        }
      });
      // Generate category pages
      result = result.concat(pagination(categoryLang + '/' + config.category_dir + '/' + category.name, posts, {
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

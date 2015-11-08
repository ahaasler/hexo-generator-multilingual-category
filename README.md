# hexo-generator-multilingual-category

[![Build Status](https://travis-ci.org/ahaasler/hexo-generator-multilingual-category.svg?branch=master)](https://travis-ci.org/ahaasler/hexo-generator-multilingual-category)
[![NPM version](https://badge.fury.io/js/hexo-generator-multilingual-category.svg)](http://badge.fury.io/js/hexo-generator-multilingual-category)
[![Coverage Status](https://img.shields.io/coveralls/ahaasler/hexo-generator-multilingual-category.svg)](https://coveralls.io/r/ahaasler/hexo-generator-multilingual-category?branch=master)
[![Dependency Status](https://gemnasium.com/ahaasler/hexo-generator-multilingual-category.svg)](https://gemnasium.com/ahaasler/hexo-generator-multilingual-category)
[![License](https://img.shields.io/badge/license-MIT%20License-blue.svg)](LICENSE)

Multilingual category generator for [Hexo](http://hexo.io/).

## Installation

``` bash
$ npm install hexo-generator-multilingual-category --save
```

## Options

You can configure this plugin in `_config.yml`.

``` yaml
category_generator:
  per_page: 10
```

- **per\_page**: Posts displayed per page (0 = disable pagination).

### Localizable configuration

These are the values that this generator uses and can be [localized](https://github.com/ahaasler/hexo-multilingual#_c-configuration-locales "Configuring locales"):

- category_generator
  - per_page
- category_dir
- pagination_dir

## License

MIT

# gulp-include-template
[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Build Status](https://travis-ci.org/appleboy/gulp-compass.png?branch=master)](https://travis-ci.org/appleboy/gulp-compass) [![Dependency Status](https://david-dm.org/appleboy/gulp-compass.svg)](https://david-dm.org/appleboy/gulp-compass) [![Coverage Status](https://coveralls.io/repos/appleboy/gulp-compass/badge.svg?branch=master)](https://coveralls.io/r/appleboy/gulp-compass?branch=master)
[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Build Status](https://travis-ci.org/FroadUED/gulp-include-template.png?branch=master)](https://travis-ci.org/FroadUED/gulp-include-template) [![Dependency Status](https://david-dm.org/FroadUED/gulp-include-template.svg)](https://david-dm.org/FroadUED/gulp-include-template) [![Coverage Status](https://coveralls.io/repos/FroadUED/gulp-include-template/badge.svg?branch=master)](https://coveralls.io/r/FroadUED/gulp-include-template?branch=master)

[![NPM](https://nodei.co/npm/gulp-include-template.png?downloads=true&stars=true)](https://nodei.co/npm/gulp-include-template/)

This is a gulp plugin to extend artTemplate include function replacing &lt;% include() %> with compiled functions.

## Usage

html/hello.html

```html
<!doctype html>
<body>
<% var data = { "hello": "world" }; %>
<% include('header.html', data); %>
<% include('footer.html', data); %>
</body>
</html>
```

html/header.html

```html
<header><%= hello %></header>
```

html/footer.html

```html
<footer><%= hello %></footer>
```

```javascript
var gulp = require("gulp"),
    gulpIncludeTemplate = require("gulp-include-template");


gulp.task("includeTemplate", function() {

    return gulp.src("../html/hello.html")
        // options is optional
        .pipe(gulpIncludeTemplate())
        .pipe(gulp.dest("./compiled"));
});
```
After running the includeTemplate task:

compiled/hello.html

```html
<!DOCTYPE html>
<html>
<body>
<% var data = { "hello": "world" }; %>
 <% (function($$data) {%>
 <% var hello=$$data.hello; %>
<header><%= hello %></header>
 <% })( data); %>
 <% (function($$data) {%>
 <% var hello=$$data.hello; %>
<footer><%= hello %></footer>
 <% })( data); %>
</body>
</html>
```
## Set the base

If we want to refer to the js/css with the absolute url starts with '/', you should set the base attribute
of gulp-include-template.

```javascript
var gulp = require("gulp"),
    gulpIncludeTemplate = require("gulp-include-template");

// if we set the base of gulp-include-template, we can access them the absolute url starts with '/'
gulpIncludeTemplate.config('base', 'path/to/html');
gulp.task("includeTemplate", function() {

    return gulp.src("../html/hello.html")
        // options is optional
        .pipe(gulpIncludeTemplate())
        .pipe(gulp.dest("./compiled"));
});
```
Html is like this.

```html
<!doctype html>
<body>
<% var data = { "hello": "world" }; %>
<% include('/dirUnderPathToHtml/header.html', data); %>
<% include('/dirUnderPathToHtml/footer.html', data); %>
</body>
</html>
```

The compiled hello.html can be directly used by the [artTemplate](https://github.com/aui/artTemplate) without loading the outer html in running time.


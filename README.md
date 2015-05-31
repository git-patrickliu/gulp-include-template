# gulp-include-template
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

// you can set the basic attributes of the gulpIncludeTemplate like the artTemplate
// gulpIncludeTemplate.config('base', 'path-to-html'); gulpIncludeTemplate.config('ext', 'your-default-file-extension');

gulp.task("includeTemplate", function() {

    return gulp.src("../html/hello.html")
        // options is optional
        .pipe(gulpIncludeTemplate)
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
<%  %>
 <% (function($$data) {%>
 <% var hello=$$data.hello; %>
<header><%= hello %></header>
 <% })( data); %>
 <%  %>
<%  %>
 <% (function($$data) {%>
 <% var hello=$$data.hello; %>
<footer><%= hello %></footer>
 <% })( data); %>
 <%  %>
</body>
</html>
```

The compiled hello.html can be directly used by the [artTemplate](https://github.com/aui/artTemplate) without loading the outer html in running time.


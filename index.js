var fs = require('fs'),
    path = require('path'),
    through = require('through2'),
    artTemplate = require('ued-art-template').getNative();


var defaults = {
    base: null
};

// 给artTemplate新增一个预处理include的方法
// 并且做成一个gulp stream
var preInclude = function(file, encoding, callback) {

    // is null doesn't supported
    if (file.isNull()) {

        // 传给下一个through对象
        this.push(file);
        return callback();
    }
    // stream doesn't supported
    if (file.isStream()) {
        return callback(new Error('Streaming not supported'));
    }

    var readFile = function (includeFilePath, basePath) {

        if (path.isAbsolute(includeFilePath)) {

            // 如果includeFilePath是以 '/'开头的，则认为是相对于base进行定位的
            if (includeFilePath[0] === '/') {
                includeFilePath = (defaults.base ? defaults.base : '') + includeFilePath;
            }

            return {
                content: fs.readFileSync(includeFilePath, 'utf-8'),
                basePath: path.dirname(includeFilePath)
            }
        } else {
            // 否则resolve一下，再返回
            // todo
            return {
                content: fs.readFileSync(path.resolve(basePath, includeFilePath), 'utf-8'),
                basePath: path.dirname(path.resolve(basePath, includeFilePath))
            }
        }
    };

    var html = String(file.contents),
        basePath = path.dirname(file.path);

    function include(html, basePath) {
        var self = arguments.callee;

        // 对html当中的文件include进行正则匹配
        var REGEXP = /(include[^\(]*?\([^\)]*?\);?)(?=[\s\S]*?%>)/g;

        return html.replace(REGEXP, function($1) {
            // 如果匹配成功，即有include方法存在

            // parse data , include('hello.html', data) -> get 'data';
            var getDataREGEXP = /.*?(include[^\(]*?\([^,]*?),([\s\S]*?)\)/,
                resultData = getDataREGEXP.exec($1),
                evalFun = $1,
                dataParam = '';

            // 如果用户有传入 data, 即 include('hello.html', data)
            if(resultData) {

                // include('hello.html', data) -> include('hello.html') -> evalFun
                evalFun = $1.replace(getDataREGEXP, function($0, $1) { return $1 + ',"' + basePath + '")'});

                // 将 include('hello.html', data), 的data -> dataParam
                dataParam = resultData[2];
            }

            var headerCode = ' %> \n <% (function($$data) {%>\n';

            // hello.html -> contentCode
            var contentCode = (new Function('include', 'return ' + evalFun ))(readFile);

            // 从hello.html当中获取其中的变量
            var variables = getVariables(contentCode.content);

            // 将变量加到headerCode后面
            headerCode += (variables.length > 0 ? (' <% var ' + variables.join(',') + '; %> \n') : '');

            // 递归获取
            contentCode = self(contentCode.content, contentCode.basePath);

            var footerCode = ' \n <% })(' + dataParam + '); %> \n <% ';
            return headerCode + contentCode + footerCode;
        });
    };

    file.contents = new Buffer(include(html, basePath));
    this.push(file);
    callback();

};

// from artTemplate, 用来获取模板中的变量
// 静态分析模板变量
var KEYWORDS =
    // 关键字
    'break,case,catch,continue,debugger,default,delete,do,else,false'
    + ',finally,for,function,if,in,instanceof,new,null,return,switch,this'
    + ',throw,true,try,typeof,var,void,while,with'

        // 保留字
    + ',abstract,boolean,byte,char,class,const,double,enum,export,extends'
    + ',final,float,goto,implements,import,int,interface,long,native'
    + ',package,private,protected,public,short,static,super,synchronized'
    + ',throws,transient,volatile'

        // ECMA 5 - use strict
    + ',arguments,let,yield'

    + ',undefined';

var REMOVE_RE = /\/\*[\w\W]*?\*\/|\/\/[^\n]*\n|\/\/[^\n]*$|"(?:[^"\\]|\\[\w\W])*"|'(?:[^'\\]|\\[\w\W])*'|\s*\.\s*[$\w\.]+/g;
var SPLIT_RE = /[^\w$]+/g;
var KEYWORDS_RE = new RegExp(["\\b" + KEYWORDS.replace(/,/g, '\\b|\\b') + "\\b"].join('|'), 'g');
var NUMBER_RE = /^\d[^,]*|,\d[^,]*/g;
var BOUNDARY_RE = /^,+|,+$/g;


// 获取变量
function getVariable (code) {
    return code
        .replace(REMOVE_RE, '')
        .replace(SPLIT_RE, ',')
        .replace(KEYWORDS_RE, '')
        .replace(NUMBER_RE, '')
        .replace(BOUNDARY_RE, '')
        .split(/^$|,+/);
};

var getVariables = function(source) {

    var options = artTemplate.defaults;

    var openTag = options.openTag,
        closeTag = options.closeTag;

    var uniq = {$data:1,$filename:1,$utils:1,$helpers:1,$out:1,$line:1};

    var headerCode = [];

    // html与逻辑语法分离
    source.split(openTag).forEach(function(code) {

        code = code.split(closeTag);

        var $0 = code[0];
        var $1 = code[1];

        // code: [html]
        if (code.length === 1) {

            // code: [logic, html]
        } else {

            headerCode = headerCode.concat(logic($0, uniq));
        }
    });

    return headerCode;
}

// 处理逻辑语句
function logic (code, uniq) {

    var headerCode = [];
    var utils = artTemplate.utils;
    var helpers = artTemplate.helpers;

    // 提取模板中的变量名
    getVariable(code).forEach(function(name) {

        // name 值可能为空，在安卓低版本浏览器下
        if (!name || uniq[name]) {
            return;
        }

        var value;

        // 声明模板变量
        // 赋值优先级:
        // [include, print] > utils > helpers > data
        if (name === 'print') {
            return;
        } else if (name === 'include') {
            return;
        } else if (utils[name]) {

            value = "$utils." + name;

        } else if (helpers[name]) {

            value = "$helpers." + name;

        } else {

            value = "$$data." + name;
        }

        headerCode.push(name + "=" + value);
        uniq[name] = true;
    })

    return headerCode;
};

exports = module.exports = through.obj(preInclude);

// set some configs
exports.config = function(key, value) {
    defaults[key] = value;
}

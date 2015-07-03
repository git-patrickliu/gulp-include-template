/**
 * Created by patrickliu on 15/7/3.
 */

var assert = require('assert'),
    fs = require('fs');


describe('normal', function() {

    describe('simple', function() {
        it('compiled index.html should equal expected index.html', function(done) {
            var compiled = fs.readFileSync(__dirname + '/compiled/index.html', 'utf-8'),
                expected = fs.readFileSync(__dirname + '/expected/index.html', 'utf-8');

            assert.equal(compiled, expected);
            done();
        });
    });
});

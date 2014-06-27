'use strict';

var assert = require('chai').assert;
var mediation = require('../');

describe('mediation', function() {
  it('conflict major', function() {
    assert.throws(function() {
      var resolved = mediation({
        "a": {
          "1.0.0": true,
          "2.2.0": true
        }
      });
    });
  });

  it('resolve minor', function() {
    var resolved = mediation({
      "a": {
        "1.2.0": true,
        "1.2.3": true
      }
    });

    assert(resolved.a);
    assert(resolved.a["1.2.3"]);
    assert(!resolved.a["1.2.0"]);
  });

});
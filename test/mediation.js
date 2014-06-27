'use strict';

var assert = require('chai').assert;
var mediation = require('../');

describe('mediation', function() {
  it('conflict major', function() {
    var resolved = mediation({
      "a": {
        "1.0.0": true,
        "2.2.0": true
      }
    });

    console.log(resolved);

  });
});
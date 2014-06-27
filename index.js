var util = require('util');
var semver = require('semver');



var defaultRule = {
  major: function(majors, name) {
    if (majors.length > 1) {
      throw new Error("Incompatible versions detected");
    }
    return majors;
  },
  minor: function(minors) {
    return [minors.concat().sort().pop()];
  },
  patch: function(patchs) {
    return [patchs.concat().sort().pop()];
  }
};


module.exports = function(modules, rule) {
  var tree = {};
  rule = rule || defaultRule;

  if (util.isArray(modules)) {
    // array
    modules.forEach(function(mod) {
      var name = mod.name,
        version = mod.version;
      treefy(name, version, tree);
    });
  } else {
    // object
    for (var name in modules) {
      var obj = modules[name];
      if (util.isArray(obj)) {
        obj.forEach(function(version) {
          treefy(name, version, tree);
        });
      } else {
        for (var version in obj) {
          treefy(name, version, tree);
        }
      }
    }
  }



  var rs = {};
  // handle tree
  for (var name in tree) {
    rs[name] = rs[name] || {};

    var mod = tree[name];
    var majors = Object.keys(mod);
    try {
      majors = rule.major ? rule.major(majors, name) : majors;
    } catch (e) {
      throw new Error(e.message + ' versions: [' + mod._versions.join(', ') + ']');
    }


    majors.forEach(function(major) {
      var m = mod[major];
      var minors = Object.keys(m);
      try {
        minors = rule.minor ? rule.minor(minors, major, name) : minors;
      } catch (e) {
        throw new Error(e.message + ' versions: [' + m._versions.join(', ') + ']');
      }

      minors.forEach(function(minor) {
        var mi = m[minor];
        var patchs = Object.keys(mi);
        try {
          patchs = rule.patch ? rule.patch(patchs, minor, major, name) : patchs;
        } catch (e) {
          throw new Error(e.message + 'versions: [' + m._versions.join(', ') + ']');
        }

        patchs.forEach(function(patch) {
          var p = mi[patch];
          var prereleases = Object.keys(p);
          try {
            prereleases = rule.prerelease ? rule.prerelease(prereleases, patch, minor, major, name) : prereleases;
          } catch (e) {
            throw new Error(e.message + 'versions: [' + p._versions.join(', ') + ']');
          }


          // prerelease is optional
          prereleases.forEach(function(pre) {
            rs[name][
              [major, '.', minor, '.', patch, '-', pre].join('')
            ] = true;
          });

          if (p._) {
            rs[name][major + '.' + minor + '.' + patch] = true;
          }
        });
      });
    });
  }

  return rs;
};


function treefy(name, version, tree) {
  var mod = tree[name] = tree[name] || {};

  var v = semver.parse(version);

  if (!mod._versions)
    Object.defineProperty(mod, '_versions', {
      enumerable: false,
      configurable: false,
      writable: false,
      value: []
    });

  mod._versions.push(version);

  var major = mod[v.major] = mod[v.major] || {};

  if (!major._versions)
    Object.defineProperty(major, '_versions', {
      enumerable: false,
      configurable: false,
      writable: false,
      value: []
    });

  major._versions.push(version);

  var minor = major[v.minor] = major[v.minor] || {};

  if (!minor._versions)
    Object.defineProperty(minor, '_versions', {
      enumerable: false,
      configurable: false,
      writable: false,
      value: []
    });

  minor._versions.push(version);

  var patch = minor[v.patch] = minor[v.patch] || {};

  if (!patch._versions)
    Object.defineProperty(patch, '_versions', {
      enumerable: false,
      configurable: false,
      writable: false,
      value: []
    });

  patch._versions.push(version);

  if (v.prerelease && v.prerelease.length)
    patch[v.prerelease.join('-')] = true;
  else if (!patch._) {
    Object.defineProperty(patch, '_', {
      enumerable: false,
      configurable: false,
      writable: false,
      value: true
    });
  }
};
process.env.NODE_ENV = 'test';

var should = require('should');
var Manifest = require('../index');
var m = new Manifest();
var common;

describe('validate', function () {
  afterEach(function () {
    common = {
      description: 'test app',
      name: 'app'
    };
  });

  it('should return an invalid manifest object', function () {
    try {
      var results = m.validate('');
    } catch (err) {
      err.toString().should.equal('Error: Manifest is not in a valid JSON format or has invalid properties');
    }
  });

  it('should return an invalid manifest with missing mandatory keys for the marketplace', function () {
    var results = m.validate({});

    ['name', 'description', 'developer'].forEach(function (f) {
      var currKey = results.errors['MandatoryField' + f.charAt(0).toUpperCase() + f.slice(1)];
      currKey.toString().should.equal('Error: Mandatory field ' + f + ' is missing');
    });
  });

  it('should return an invalid manifest with missing mandatory keys for non-marketplace', function () {
    content = '{}';
    m.appType = '';
    var results = m.validate(content);

    ['name', 'description'].forEach(function (f) {
      var currKey = results.errors['MandatoryField' + f.charAt(0).toUpperCase() + f.slice(1)];
      currKey.toString().should.equal('Error: Mandatory field ' + f + ' is missing');
      should.not.exist(results.errors.MandatoryFieldDeveloper);
    });
  });

  it('should return an invalid manifest for duplicate fields', function () {
    common.activities = '1';
    common.activities = '2';

    try {
      var results = m.validate(common);
    } catch (err) {
      err.toString().should.equal('Error: Manifest is not in a valid JSON format or has invalid properties');
    }
  });

  it('should return an invalid property type', function () {
    common.launch_path = [];

    var results = m.validate(common);
    results.errors['InvalidPropertyTypeLaunchPath'].toString().should.equal("Error: `launch_path` must be of type `string`");
  });

  it('should return an invalid launch path', function () {
    common.launch_path = '//';

    var results = m.validate(common);

    results.errors['InvalidLaunchPath'].toString().should.equal("Error: `launch_path` must be a path relative to app's origin");
  });

  it('should have a valid icon size and valid icon path', function () {
    common.icons = {
      a: ''
    };

    var results = m.validate(common);

    results.errors['InvalidIconSizeA'].toString().should.equal('Error: Icon size must be a natural number');
    results.errors['InvalidIconPathA'].toString().should.equal('Error: Paths to icons must be absolute paths, relative URIs, or data URIs');
  });

  it('should have a valid length if a minLength is provided', function () {
    common.default_locale = '';

    var results = m.validate(common);

    results.errors['InvalidPropertyLengthDefaultLocale'].toString().should.equal('Error: `default_locale` must not be empty');
  });
});

import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('route:jobs', 'JobsRoute', {
  // Specify the other units that are required for this test.
  needs: ['controller:jobs']
});

test('it exists', function() {
  var route = this.subject();
  ok(route);
});

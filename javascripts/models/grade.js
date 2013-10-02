var attr = Ember.attr, hasMany = Ember.hasMany;

QHAC.Grade = Ember.Model.extend({
  id: attr(),
  name: attr(),
  assigned: attr(),
  due: attr(),
  points: attr(),
  userCreated: attr(),
});
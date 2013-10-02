var attr = Ember.attr, hasMany = Ember.hasMany;

QHAC.Category = Ember.Model.extend({
  id: attr(),
  weight: attr(Number),
  average: attr(Number),
  grades: hasMany("QHAC.Grade", {key: 'grades', embedded: true}),
});

QHAC.Category.adapter = QHAC.adapter.create();
var attr = Ember.attr, hasMany = Ember.hasMany;

QHAC.Cycle = Ember.Model.extend({
  id: attr(),
  datalink: attr(),
  cycleNumber: attr(Number),
  currentAverage: attr(Number),
  categories: hasMany("QHAC.Category", {key: 'categorys', embedded: true}),
});

QHAC.Cycle.adapter = QHAC.adapter.create();
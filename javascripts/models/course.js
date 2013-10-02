var attr = Ember.attr, hasMany = Ember.hasMany;

QHAC.Course = Ember.Model.extend({
  id: attr(),
  name: attr(),
  period: attr(Number),
  exam1grade: attr(Number),
  exam2grade: attr(Number),
  cycles: hasMany("QHAC.Cycle", {key: 'cycles', embedded: true}),
  advanced: function() {
    return false;
  }
});

QHAC.Course.adapter = QHAC.adapter.create();
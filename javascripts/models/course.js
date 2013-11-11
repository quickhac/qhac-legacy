var attr = DS.attr, hasMany = DS.hasMany;

QHAC.Course = DS.Model.extend({
  //id: attr(),
  name: attr(),
  period: attr(),
  exam1grade: attr(),
  exam2grade: attr(),
  cycles: hasMany("cycle", {async: true}),
  advanced: function() {
    return false;
  }
});

QHAC.Course.FIXTURES = [
  { id: "1", name: 'Debate/Com App', period: "1", cycles: ["1506_1", "1506_2"] },
  { id: "2", name: 'Pre-Ib Sci 1', period: "2"     }
];
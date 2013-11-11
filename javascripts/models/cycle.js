var attr = DS.attr, hasMany = DS.hasMany;

QHAC.Cycle = DS.Model.extend({
  //id: attr(),
  datalink: attr(),
  cycleNumber: attr('number'),
  hacAverage: attr('number'),
  //categories: hasMany("category"),
  course: DS.belongsTo('course')
});

QHAC.Cycle.FIXTURES = [
  { id: "1506_1", hacAverage: 99, course: "1", cycleNumber: 1 },
  { id: "1506_2", hacAverage: 87, course: "1", cycleNumber: 2 },
  { id: "4352_1", hacAverage: 70}
];
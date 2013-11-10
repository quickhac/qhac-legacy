var attr = DS.attr, hasMany = DS.hasMany;

QHAC.Category = DS.Model.extend({
  //id: attr(),
  weight: attr('number'),
  average: attr('number'),
  grades: hasMany("grade"),
});
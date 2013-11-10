var attr = DS.attr, hasMany = DS.hasMany;

QHAC.Grade = DS.Model.extend({
  //id: attr(),
  name: attr('number'),
  assigned: attr('date'),
  due: attr('date'),
  points: attr('number'),
  userCreated: attr('boolean'),
  notes: attr()
});
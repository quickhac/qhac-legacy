var attr = DS.attr, hasMany = DS.hasMany;

QHAC.Course = DS.Model.extend({
  //id: attr(),
  name: attr(),
  period: attr(),
  exam1: attr(),
  exam2: attr(),
  cycles: hasMany("cycle", {async: false}),
  advanced: function() {
    return false;
  },
  semester1: function() {
    var numberOfCycles = 0;
    var total = this.get('cycles').reduce(function(previousValue, item, index, enumerable) {
      numberOfCycles++;
      if(item.get('cycleNumber') > 3) { return previousValue; }
      else { return previousValue + item.get('hacAverage'); }
    }, 0);

    return total / numberOfCycles;
  }.property(),

  semester2: function() {
    var numberOfCycles = 0;
    var total = this.get('cycles').reduce(function(previousValue, item, index, enumerable) {
      numberOfCycles++;
      if(item.get('cycleNumber') < 3) { return previousValue; }
      else { return previousValue + item.get('hacAverage'); }
    }, 0);

    return total / numberOfCycles;
  }.property()
});

QHAC.Course.FIXTURES = [
  { id: "1506", name: 'Debate/Com App', period: "1", cycles: ["1506_1", "1506_2", "1506_3"] },
  { id: "4352", name: 'Pre-Ib Sci 1', period: "2", cycles: ["4352_1"]    }
];
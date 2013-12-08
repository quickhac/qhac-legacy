QHAC.MainController = Ember.ArrayController.extend({
  sortProperties: ['period'],
  sortAscending: true,

  // there is a better way to do this
  courseHighLevelInformationRows: function() {
    var rows = [];
    this.forEach(function(course) {
      var row = Ember.Object.create({});
      row.set('name', course.get('name'));
      console.log(course.get('cycles'));
      course.get('cycles').forEach(function(cycle) {
        row.set('cycle' + cycle.get('cycleNumber'), cycle.get('hacAverage'));
      });
      row.set('exam1', course.get('exam1'));
      row.set('exam2', course.get('exam2'));
      row.set('semester1', course.get('semester1'));
      row.set('semester2', course.get('semester2'));
      rows.push(row);
    });
    console.log(rows);
    return rows;
  }.property('@each.period')
});
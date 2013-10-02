QHAC.Router.map(function() {
  this.route('login', { path: '/'});
  this.resource('main');
});

// Todos.TodosRoute = Ember.Route.extend({
//   model: function () {
//     return this.store.find('todo');
//   }
// });
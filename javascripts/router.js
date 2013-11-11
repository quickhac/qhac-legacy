QHAC.Router.map(function() {
  this.route('login', { path: '/'});
  this.resource('main');
});

QHAC.MainRoute = Ember.Route.extend({
  model: function() {
    var course = this.store.findAll('course');
    var cycles = this.store.find('cycle');
    console.log(course.get('isDirty'));
    return course;
    //console.log(this.store.find('course'));
  },
  beforeModel: function(transition) {
    //if(!this.controllerFor('login').get('authenticated')) {
    if(false) {
      this.transitionTo('login');
    }
  }
});


QHAC.LoginRoute = Ember.Route.extend({
  beforeModel: function(transition) {
    //this.transitionTo('main');
  },
  actions: {
    login: function() {
      this.get('controller').setProperties({
        loginFailed: false,
        isProcessing: true,
        loginMessage: "Logging In...",
        authenticated: true
      });
      var this_login_controller = this.get('controller');
      var _this = this;
      setTimeout(function() {
        this_login_controller.reset();
        _this.transitionTo('main');
      }, 2000);
    }
  }
});
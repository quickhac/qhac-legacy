QHAC.LoginController = Ember.Controller.extend({

  loginFailed: false,
  isProcessing: false,
  isSlowConnection: false,
  districts: ["aisd", "rrisd"],
  loginMessage: "Log In",
  authenticated: false,

  failure: function() {
    this.reset();
    this.set("loginFailed", true);
  },

  reset: function() {
    this.setProperties({
      isProcessing: false,
      isSlowConnection: false,
      loginMessage: "Log In",
    });
  }

});
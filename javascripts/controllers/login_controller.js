QHAC.LoginController = Ember.Controller.extend({

  loginFailed: false,
  isProcessing: false,
  isSlowConnection: false,
  districts: ["aisd", "rrisd"],
  loginMessage: "Log In",

  login: function() {
    this.setProperties({
      loginFailed: false,
      isProcessing: true,
      loginMessage: "Logging In..."
    });
    var this_login_controller = this;
    setTimeout(function() {
      this_login_controller.reset();
      this_login_controller.transitionToRoute('main'); // wtf
    }, 2000);
  },

  success: function() {
    alert("logged in");
    // sign in logic
  },

  failure: function() {
    this.reset();
    this.set("loginFailed", true);
  },

  reset: function() {
    this.setProperties({
      isProcessing: false,
      isSlowConnection: false,
      loginMessage: "Log In"
    });
  }

});
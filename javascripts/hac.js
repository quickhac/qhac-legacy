var HAC = {
  initialize: function(username, password, district) {
    this.district = district;
  },
};

HAC = (function () {

  /** @constructor 
  */
  function HAC(username, password, studentid, district) {
    this.username = username;
    this.password = password;
    this.studentid = studentid;
    this.district = district;
    this.host = "https://hacaccess.herokuapp.com";
  }

  HAC.prototype.getSession =  function (callback, on_error) {
    var jqXHR = $.ajax({
      url: AISD_HAC.host + "api/login",
      type: "POST",
      data: {
        login: this.login,
        password: this.password,
        studentid: this.studentid,
        district: this.district
      }
    }).done(callback).fail(on_error);
  };

  HAC.prototype.toJSON = function() {
    
  };



  return HAC;
})();
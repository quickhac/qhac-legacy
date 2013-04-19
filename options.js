var asianness, r_interval, hue, asianness_on, refresh_enabled, hue_on, password_enabled, badge_enabled;

function generate_color_table() {
	var table = document.createElement("table");
	$(table).attr("cellpadding", "8px").attr("cellspacing", "0px").css("width", "100%");
	for (var r = 9; r >= 0; r--) {
		var row = document.createElement("tr");
		for (var c = 0; c < 10; c++) {
			var cell = document.createElement("td");
			var grade = 10 * r + c;
			cell.textContent = grade;
			$(cell).css("backgroundColor", HAC_HTML.colorize(grade));
			$(row).append(cell);
		}
		$(table).append(row);
	}

	$("#color_table").html("").append(table);
}

// version number: http://goo.gl/QTj3c
function getVersion(callback) {
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open('GET', 'manifest.json');
	xmlhttp.onload = function (e) {
		var manifest = JSON.parse(xmlhttp.responseText);
		callback(manifest.version);
	}
	xmlhttp.send(null);
}

// validation

var error_id = 0;

function show_error($input, message) {
	console.error(message);
	
	$input.parent().children(".error_msg").detach();
	
	$el = $("<div/>");
	$el.addClass("error_msg")
		.text(message)
		.appendTo($input.parent())
		.addClass("animate");
	window.setTimeout(function () {
		$(".error_msg").detach();
	}, 5000);
	$input.focus();
	error_id++;
}

Validator = function (valid, invalid) {
	this.inputs = [];
	this.conditions = [];
	this.successes = [];
	this.errors = [];
	this.valid = valid || function () {};
	this.invalid = invalid || function () {};
	this.isValid = false;
	
	return this;
};
Validator.prototype.add = function (vals, condition, success, error) {
	this.inputs.push(vals);
	this.conditions.push(condition);
	this.successes.push(success);
	this.errors.push(error);
	return this;
};
Validator.prototype.validate = function () {
	var all_valid = true;
	var vals;
	
	for (var i = this.conditions.length - 1; i >= 0; i--) {
		vals = this.inputs[i];
		if (this.conditions[i].call(window, vals)) {
			this.successes[i].call(window, vals);
		} else {
			all_valid = all_valid && false;
			this.errors[i].call(window, vals);
		}
	}
	
	if (all_valid) {
		this.valid.call(window);
		this.isValid = true;
	} else {
		this.invalid.call(window);
		this.isValid = false;
	}
	return this;
};

function set_password_boxes(checked) {
	function require(ids, isRequired) {
		$(ids).prop("required", isRequired).prop("disabled", !isRequired);
		if (!isRequired) $(ids).val("").parent().slideUp(250);
		else $(ids).parent().slideDown(250);
	}
	function closePassOpts() {
		$("#pass_opts").slideUp(250).prev(".toggler").addClass("minimized");
	}
	function openPassOpts() {
		$("#pass_opts").slideDown(250).prev(".toggler").removeClass("minimized");
	}

	if (checked) {
		require("#new_pass, #confirm_pass", true);
		openPassOpts();

		if (password_enabled) {
			require("#old_pass", true);
			$("#pass_title").text("Change Password");
		} else {
			require("#old_pass", false);
			$("#pass_title").text("Set Password");
		}
	} else {
		require("#new_pass, #confirm_pass", false);

		if (password_enabled) {
			require("#old_pass", true);
			$("#pass_title").text("Disable Password Protection");
			openPassOpts();
		} else {
			require("#old_pass", false);
			closePassOpts();
		}
	}
}

// Updates options DOM
// disables animation if passed true, animates otherwise.
function update_options_dom(doAnimation) {
	var anim = doAnimation ? 0 : 500;

	if ($("#asianness_check").prop('checked')) {
		$("#colorization").slideDown(anim);
		asianness_on = true;
		asianness = $("#asianness").val();

		hue_on = true;
		hue = $("#hue").val();

		$("#asianness_check").parent().removeClass('minimized');

		$("#asianness_wrap").slideDown(anim);
	} else {
		$("#colorization").slideUp(anim);
		asianness_on = false;
		asianness = 0;

		hue_on = false;
		hue = 0;

		$("#asianness_check").parent().addClass('minimized');

		$("#asianness_wrap").slideUp(anim);
	}
	
	if ($("#refresh_check").prop('checked')) {
		$("#refresh_check").parent().removeClass('minimized');
		$("#refresh_opts").slideDown(anim);
		r_int = $("#r_interval").val();
		refresh_enabled = false;
	} else {
		$("#refresh_check").parent().addClass('minimized');
		$("#refresh_opts").slideUp(anim);
		refresh_enabled = true;
		r_int = 0;
	}

	if ($("#badge_check").prop("checked")) {
		badge_enabled = true;
	} else {
		badge_enabled = false;
	}

	set_password_boxes($("#password_check").prop('checked'));
}

// events and stuff
$(function(){
	// load
	asianness = localStorage.hasOwnProperty("asianness") ? localStorage["asianness"] : DEFAULT_ASIANNESS;
	r_interval = localStorage.hasOwnProperty("r_int") ? localStorage["r_int"] : DEFAULT_R_INT;
	hue = localStorage.hasOwnProperty("hue") ? parseFloat(localStorage["hue"]) : DEFAULT_HUE;
	// Load checkbox states and update DOM
	asianness_on = (localStorage.hasOwnProperty("asianness") ? (localStorage["asianness"] != 0) : true);
	refresh_enabled = (localStorage.hasOwnProperty("r_int") ? (localStorage["r_int"] != 0) : true);
	badge_enabled = localStorage.hasOwnProperty("badge_enabled") && localStorage["badge_enabled"] == "true";
	password_enabled = localStorage.hasOwnProperty("password") && localStorage["password"] != "";
	
	// update spinbox values (use default values if previously disabled)
	$("#asianness").val(asianness_on ? asianness : 4);
	$("#slider").val(Math.log(asianness_on ? asianness : 4));
	$("#r_interval").val(refresh_enabled ? r_interval : 60);
	$("#hue, #hue_slider").val(hue);
	// $("#the_password").val(localStorage["password"]);
	
	$("#asianness_check").prop('checked', asianness_on);
	$("#refresh_check").prop('checked', refresh_enabled);
	$("#badge_check").prop('checked', badge_enabled);
	$("#password_check").prop('checked', password_enabled);
	
	generate_color_table();

	getVersion(function(v) {
		$("#version").text("version " + v);
	});
	
	$("#asianness_check").change(function () {
		update_options_dom(false);
	
		// force re-draw of table for asianness enable/disable changes
		generate_color_table();
	});
	
	$("#refresh_check").change(function () {
		update_options_dom(false);
	});

	$("#badge_check").change(function () {
		update_options_dom(false);
	});

	$("#password_check").change(function () {
		set_password_boxes(this.checked);
	});
	
	update_options_dom(true);
	
	// slider change events
	$("#slider").change(function () {
		asianness = Math.exp(parseFloat($(this).val()));
		generate_color_table();
		$("#asianness").val(asianness);

		$(this).parent().prev().children('.sliderIndicator')
			.addClass('visible')
			.text(asianness.toPrecision(3).toString())
			.css('left', Math.round(Math.log(asianness)*(360-16)/2.5 + 120) + 'px');
	}).mouseup(function () {
		$(this).parent().prev().children('.sliderIndicator')
			.removeClass('visible');
	});
	$("#asianness").change(function () {
		asianness = $(this).val();
		generate_color_table();
		$("#slider").val(Math.log(asianness));
	});
	$("#hue").change(function () {
		hue = parseInt($(this).val());
		generate_color_table();
		$("#hue_slider").val(hue);
	});
	$("#hue_slider").change(function () {
		hue = parseInt($(this).val());
		generate_color_table();
		$("#hue").val(hue);

		$(this).parent().prev().children('.sliderIndicator')
			.addClass('visible')
			.text(Math.floor(hue).toString())
			.css('left', Math.round(hue*(360-15)/360 + 120) + 'px');
	}).mouseup(function () {
		$(this).parent().prev().children('.sliderIndicator')
			.removeClass('visible');
	});
	
	// save
	$("#save").click(function() {
		// analytics
		_gaq.push(['_trackEvent', 'Options', 'Save', 'Save Options', Math.abs(asianness)]);

		// actually save
		var new_asianness = parseFloat($("#asianness").val());
		var new_r_int = parseFloat($("#r_interval").val());
		var new_hue = parseInt($("#hue").val());
		// var new_pass = $("#the_password").val();
		var old_pass = $("#old_pass").val();
		var new_pass = $("#new_pass").val();
		var confirm_pass = $("#confirm_pass").val();
		
		validator = new Validator();
		
		validator.add(new_asianness, function (val) {
			return !isNaN(val);
		}, function (val) {
			localStorage.setItem("asianness", $("#asianness_check").prop('checked') ? val.toString() : 0);
		}, function (val) {
			show_error($("#asianness"), "Asianness level must be a number!");
		})
		
		.add(new_r_int, function (val) {
			return !(isNaN(val) || (val < 0));
		}, function (val) {
			localStorage.setItem("r_int", $("#refresh_check").prop('checked') ? val.toString() : 0);
		}, function (val) {
			show_error($("#r_interval"), "Refresh interval must be a (positive) number!");
		})

		.add(new_hue, function (val) {
			return !(isNaN(val) || (val < 0) || (val > 360));
		}, function (val) {
			localStorage.setItem("hue", val.toString());
		}, function (val) {
			show_error($("#hue"), "Hue must be between 0 and 360.");
		});
		
		if ($("#old_pass").prop("required")) {
			validator.add({op: old_pass, np: new_pass}, function (val) {
				var val_hash = CryptoJS.SHA512(val.op).toString();
				var stored_hash = localStorage["password"];

				return (val.op.length > 0) ? val_hash == stored_hash : val.np.length == 0 && password_enabled;
			}, function (val) {
				// if (val.length > 0) console.log('correct old password');
				// else console.log('no password entered');
			}, function (val) {
				show_error($("#old_pass"), "Incorrect password.");
			});
		}
		if ($("#new_pass").prop("required")) {
			validator.add({cp: confirm_pass, np: new_pass, op: old_pass}, function (val) {
				return (val.np.length > 0) ? val.cp == val.np : true;
			}, function (val) {
				// if (val.np.length > 0) console.log("passwords match :D");
				// else console.log("no new password entered");
			}, function (val) {
				show_error($("#confirm_pass"), "The passwords provided do not match.");
			})

			.add({np: new_pass, op: old_pass}, function (val) {
				return (val.np.length > 0) ? val.np.length > 2 : val.op.length == 0 && password_enabled;
			}, function (val) {}, function (val) {
				show_error($("#new_pass"), "The new password must be at least 3 characters long.");
			});
		}

		validator.validate();
		
		if (!validator.isValid) return false;

		var A = CryptoJS.SHA512(old_pass).toString() == localStorage["password"];
		var L = password_enabled ? true : false; //to clone boolean object?
		var E = $("#password_check").prop("checked");
		var M = new_pass == confirm_pass;

		if (A && L && E && M) {
			// update password
			// console.log("updated password");
			set_password_boxes(true);
			localStorage.setItem("password", CryptoJS.SHA512(new_pass).toString());

		} else if (A && L && !E) {
			// disable password lock
			// console.log("disabled password lock");
			password_enabled = false;
			set_password_boxes(false);
			localStorage.removeItem("password");

		} else if (!L && E && M) {
			// enable password lock
			// console.log("enabled password lock");
			password_enabled = true;
			set_password_boxes(true);
			localStorage.setItem("password", CryptoJS.SHA512(new_pass).toString());

		}

		$("#old_pass, #new_pass, #confirm_pass").val("");

		localStorage.setItem("badge_enabled", (badge_enabled ? "true" : "false"));
		
		$("#save_msg").addClass('visible');
		window.setTimeout(function() {
			$("#save_msg").removeClass('visible');
		}, 500);
	});
});

// analytics
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-37395872-1']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

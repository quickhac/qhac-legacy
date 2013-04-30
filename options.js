var asianness, r_interval, hue, colorization_enabled, refresh_enabled, hue_enabled, password_enabled, badge_enabled, notifs_enabled, single_notif;

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
	};
	xmlhttp.send(null);
}

// validation

var error_id = 0;

function show_error($input, message) {
	console.error(message);

	// Hide old error messages
	$input.parent().children(".error_msg").detach();
	
	$el = $(document.createElement("div"));
	$el.addClass("error_msg")
		.text(message)
		.appendTo($input.parent())
		.addClass("animate");
	window.setTimeout(function () {
		$el.detach();
	}, 4000);
	$input.focus();
	error_id++;
}

// Validator_old = function (valid, invalid) {
// 	this.inputs = [];
// 	this.conditions = [];
// 	this.successes = [];
// 	this.errors = [];
// 	this.valid = valid || function () {};
// 	this.invalid = invalid || function () {};
// 	this.isValid = false;
	
// 	return this;
// };
// Validator_old.prototype.add = function (vals, condition, success, error) {
// 	this.inputs.push(vals);
// 	this.conditions.push(condition);
// 	this.successes.push(success);
// 	this.errors.push(error);
// 	return this;
// };
// Validator_old.prototype.validate = function () {
// 	var all_valid = true;
// 	var vals;
	
// 	for (var i = this.conditions.length - 1; i >= 0; i--) {
// 		vals = this.inputs[i];
// 		if (this.conditions[i].call(window, vals)) {
// 			this.successes[i].call(window, vals);
// 		} else {
// 			all_valid = all_valid && false;
// 			this.errors[i].call(window, vals);
// 		}
// 	}
	
// 	if (all_valid) {
// 		this.valid.call(window);
// 		this.isValid = true;
// 	} else {
// 		this.invalid.call(window);
// 		this.isValid = false;
// 	}
// 	return this;
// };

function set_password_boxes(checked) {
	function require(ids, isRequired) {
		$(ids).prop("required", isRequired).prop("disabled", !isRequired);
		if (!isRequired) {
			$(ids).val("").parent().slideUp(250);
		} else {
			$(ids).parent().slideDown(250);
		}
	}
	function closePassOpts() {
		$("#password_protection_wrapper").addClass("minimized")
			.children(".option, .info, section")
			.slideUp(250);
	}
	function openPassOpts() {
		$("#password_protection_wrapper").removeClass("minimized")
			.children(".option, .info, section")
			.slideDown(250);
	}

	if (password_enabled)
			require("#old_password", true);

	if (checked) {
		require("#new_password, #confirm_password", true);
		openPassOpts();
		$("#single_notif").prop({"required": true, "disabled": true, "checked": true});

		if (password_enabled) {
			$("#settings section:first-of-type h3").text("Change Password");
		} else {
			require("#old_password", false);
			$("#settings section:first-of-type h3").text("Set Password");
		}
	} else {
		require("#new_password, #confirm_password", false);
		$("#single_notif").prop({"required": false, "disabled": false, "checked": single_notif});

		if (password_enabled) {
			$("#settings section:first-of-type h3").text("Disable Password");
			openPassOpts();
		} else {
			require("#old_password", false);
			closePassOpts();
		}
	}
}

// Updates options DOM
// disables animation if passed true, animates otherwise.
function update_options_dom(noAnimation) {
	var anim = noAnimation ? 0 : 500;

	if ($("#colorization").prop('checked')) {
		// $("#asianness_wrapper, #hue_wrapper").slideDown(anim);
		colorization_enabled = true;
		asianness = $("#asianness").val();

		hue_enabled = true;
		hue = $("#hue").val();

		$("#colorization_wrapper").removeClass('minimized');

		$("#asianness_wrapper, #hue_wrapper").slideDown(anim);
	} else {
		// $("#colorization").slideUp(anim);
		colorization_enabled = false;
		asianness = 0;

		hue_enabled = false;
		hue = 0;

		$("#colorization_wrapper").addClass('minimized');

		$("#asianness_wrapper, #hue_wrapper").slideUp(anim);
	}
	
	if ($("#auto_refresh").prop('checked')) {
		$("#auto_refresh_wrapper").removeClass('minimized');
		$("#auto_refresh_wrapper .option, #auto_refresh_wrapper section .info")
			.slideDown(anim);
		r_int = $("#r_interval").val();
		refresh_enabled = true;
	} else {
		$("#auto_refresh_wrapper").addClass('minimized');
		$("#auto_refresh_wrapper .option, #auto_refresh_wrapper section .info")
			.slideUp(anim);
		refresh_enabled = false;
		r_int = 0;
	}

	if ($("#notifs_enabled").prop("checked")) {
		$("#notifs_enabled_wrapper").removeClass("minimized");
		$("#notifs_enabled_wrapper .option, #notifs_enabled_wrapper section .info")
			.slideDown(anim);
		notif_duration = $("#notif_duration").val();
		single_notif = $("#single_notif").prop("checked");
		notifs_enabled = true;
	} else {
		$("#notifs_enabled_wrapper").addClass("minimized");
		$("#notifs_enabled_wrapper .option, #notifs_enabled_wrapper section .info")
			.slideUp(anim);
		notifs_enabled = false;
	}

	badge_enabled = $("#badge_count").prop("checked");

	set_password_boxes($("#password_protection").prop('checked'));
}

// events and stuff
$(function(){
	// load values from storage
	asianness = localStorage.hasOwnProperty("asianness") ? parseFloat(localStorage["asianness"]) : DEFAULT_ASIANNESS;
	r_interval = localStorage.hasOwnProperty("r_int") ? parseFloat(localStorage["r_int"]) : DEFAULT_R_INT;
	hue = localStorage.hasOwnProperty("hue") ? parseFloat(localStorage["hue"]) : DEFAULT_HUE;
	notif_duration = localStorage.hasOwnProperty("notif_duration") ? parseFloat(localStorage["notif_duration"]) : DEFAULT_NOTIF_DURATION;
	
	// Load toggles states from storage
	colorization_enabled = (localStorage.hasOwnProperty("asianness") ? (parseFloat(localStorage["asianness"]) != 0) : true);
	refresh_enabled = (localStorage.hasOwnProperty("r_int") ? (parseFloat(localStorage["r_int"]) != 0) : true);
	notifs_enabled = localStorage.hasOwnProperty("notifs_enabled") && localStorage["notifs_enabled"] == "true";
	single_notif = localStorage.hasOwnProperty("single_notif") && localStorage["single_notif"] == "true";
	badge_enabled = localStorage.hasOwnProperty("badge_enabled") && localStorage["badge_enabled"] == "true";
	password_enabled = localStorage.hasOwnProperty("password") && localStorage["password"] != "";
	
	// Generate Options HTML
	renderOptions(options_formdata, $("#settings")[0]);

	// update toggles
	$("#colorization").prop('checked', colorization_enabled);
	$("#auto_refresh").prop('checked', refresh_enabled);
	$("#notifs_enabled").prop('checked', notifs_enabled);
	$("#single_notif").prop('checked', single_notif);
	$("#badge_count").prop('checked', badge_enabled);
	$("#password_protection").prop('checked', password_enabled);

	// update spinbox values (use default values if previously disabled)
	$("#asianness").val(colorization_enabled ? asianness.toString() : DEFAULT_ASIANNESS.toString());
	$("#asianness_slider").val(Math.log(colorization_enabled ? asianness.toString() : DEFAULT_ASIANNESS.toString()));
	$("#r_interval").val(refresh_enabled ? r_interval.toString() : DEFAULT_R_INT.toString());
	$("#hue, #hue_slider").val(hue.toString());
	$("#notif_duration").val(notifs_enabled ? notif_duration.toString() : "0");

	// Initialize slider indicators
	$("#asianness_slider").parent().prev('.sliderIndicator')
		.text(asianness.toPrecision(3).toString())
		.css('left', Math.round(Math.log(asianness)*(360-16)/2.5 + 40) + 'px');

	$("#hue_slider").parent().prev('.sliderIndicator')
		.text(Math.floor(hue).toString())
		.css('left', Math.round(hue*(360-15)/360 + 40) + 'px');

	
	generate_color_table();

	getVersion(function(v) {
		$("#version").text("version " + v);
	});

	update_options_dom(true);
	
	// slider change events
	$("#asianness_slider").change(function () {
		asianness = Math.exp(parseFloat($(this).val()));
		generate_color_table();
		$("#asianness").val(asianness);

		$(this).parent().prev('.sliderIndicator')
			.addClass('visible')
			.text(asianness.toPrecision(3).toString())
			.css('left', Math.round(Math.log(asianness)*(360-16)/2.5 + 40) + 'px');
	}).mouseup(function () {
		$(this).parent().prev('.sliderIndicator')
			.removeClass('visible');
	});
	$("#asianness").change(function () {
		asianness = $(this).val();
		generate_color_table();
		$("#asianness_slider").val(Math.log(asianness));
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

		$(this).parent().prev('.sliderIndicator')
			.addClass('visible')
			.text(Math.floor(hue).toString())
			.css('left', Math.round(hue*(360-15)/360 + 40) + 'px');
	}).mouseup(function () {
		$(this).parent().prev('.sliderIndicator')
			.removeClass('visible');
	});
});

// analytics
// var _gaq = _gaq || [];
// _gaq.push(['_setAccount', 'UA-37395872-1']);
// _gaq.push(['_trackPageview']);

// (function() {
//   var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
//   ga.src = 'https://ssl.google-analytics.com/ga.js';
//   var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
// })();

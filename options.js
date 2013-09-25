/** @type number */
var asianness,

/** @type number */
r_interval,

/** @type number */
hue,

/** @type boolean */
colorization_enabled,

/** @type boolean */
refresh_enabled,

/** @type boolean */
hue_enabled,

/** @type boolean */
password_enabled,

/** @type boolean */
badge_enabled,

/** @type boolean */
notifs_enabled,

/** @type boolean */
single_notif,

/** @type boolean */
animations_enabled,

/** @type boolean */
gpa_enabled;

/**
 * Generates and displays a table with numbers labeled 1 to 100 showing the
 * background colors correspodnig with those numbers.
 */
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
/**
 * Gets a version number
 * @param {function} callabck - a function to call when the version number is found
 */
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

/**
 * Shows an error after an input element
 * @param {jQuery} $input - the input element to show an error for
 * @param {string} message - a description of the error
 */
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

/**
 * Shows and hides the password boxes for setting the password according
 * to the application state
 * @param {boolean} checked - the state of the "Password Protection" option
 */
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

/**
 * Updates options DOM, showing and hiding elements as necessary
 * @param {boolean} noAnimation - disables animation if passed true, animates otherwise.
 */
function update_options_dom(noAnimation) {
	var anim = noAnimation ? 0 : 500;

	if ($("#colorization").prop('checked')) {
		colorization_enabled = true;
		asianness = $("#asianness").val();

		hue_enabled = true;
		hue = $("#hue").val();

		$("#colorization_wrapper").removeClass('minimized');

		$("#asianness_wrapper, #hue_wrapper").slideDown(anim);
	} else {
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

	if ($("#gpa_enabled").prop("checked")) {
		$("#gpa_enabled_wrapper").removeClass("minimized");
		$("#gpa_enabled_wrapper .option, #gpa_enabled_wrapper section .info")
			.slideDown(anim);
		gpa_enabled = true;
	} else {
		$("#gpa_enabled_wrapper").addClass("minimized");
		$("#gpa_enabled_wrapper .option, #gpa_enabled_wrapper section .info")
			.slideUp(anim);
		gpa_enabled = false;
	}

	set_password_boxes($("#password_protection").prop("checked"));
}

/**
 * Sets the slider indicator to a given value
 * @param {Element} id - the element to set the indicator of
 * @param {string} val - the numeric value that the slider is currently set to
 */
function setSliderIndicator(id, val) {
	var $el = $(id).parent().prev('.sliderIndicator');
	if (id == "#asianness_slider") {
		$el.addClass('visible')
			.text(val.toPrecision(3).toString())
			.css('left', Math.round(Math.log(val)*(360-16)/2.5 + 40) + 'px');
	} else if (id == "#hue_slider") {
		$el.addClass('visible')
			.text(Math.floor(val).toString())
			.css('left', Math.round(val*(360-15)/360 + 40) + 'px');
	}
	window.setTimeout(function () {
		$el.removeClass('visible');
	}, 500);
}

// events and stuff
$(function(){
	// load values from storage
	asianness = localStorage.hasOwnProperty("asianness") ? parseFloat(localStorage["asianness"]) : DEFAULT_ASIANNESS;
	r_interval = localStorage.hasOwnProperty("r_int") ? parseFloat(localStorage["r_int"]) : DEFAULT_R_INT;
	hue = localStorage.hasOwnProperty("hue") ? parseFloat(localStorage["hue"]) : DEFAULT_HUE;
	notif_duration = localStorage.hasOwnProperty("notif_duration") ? parseFloat(localStorage["notif_duration"]) : DEFAULT_NOTIF_DURATION;
	
	// Generate Options HTML
	renderOptions(options_formdata, $("#settings")[0]);
	
	// Load toggles states from storage
	colorization_enabled = (localStorage.hasOwnProperty("asianness") ? (parseFloat(localStorage["asianness"]) != 0) : true);
	refresh_enabled = (localStorage.hasOwnProperty("r_int") ? (parseFloat(localStorage["r_int"]) != 0) : true);

	if (!localStorage.hasOwnProperty("notifs_enabled")) {
		var enabled = $("#notifs_enabled").prop("checked");
		notifs_enabled = enabled;
		localStorage.setItem("notifs_enabled", enabled ? "true" : "false");
	} else {
		notifs_enabled = localStorage["notifs_enabled"] == "true";
	}
	if (!localStorage.hasOwnProperty("single_notif")) {
		var enabled = $("#single_notif").prop("checked");
		single_notif = enabled;
		localStorage.setItem("single_notif", enabled ? "true" : "false");
	} else {
		single_notif = localStorage["single_notif"] == "true";
	}
	if (!localStorage.hasOwnProperty("badge_enabled")) {
		var enabled = $("#badge_count").prop("checked");
		badge_enabled = enabled;
		localStorage.setItem("badge_enabled", enabled ? "true" : "false");
	} else {
		badge_enabled = localStorage["badge_enabled"] == "true";
	}
	if (!localStorage.hasOwnProperty("animations")) {
		var enabled = $("#animations").prop("checked");
		animations_enabled = enabled;
		localStorage.setItem("animations", enabled ? "on" : "off");
	} else {
		animations_enabled = localStorage["animations"] == "on";
	}
	if (!localStorage.hasOwnProperty("password")) {
		var enabled = $("#password_protection").prop("checked");
		password_enabled = enabled;
		localStorage.setItem("password_enabled", enabled ? "true" : "false");
	} else {
		password_enabled = localStorage["password"] != "";
	}

	// update toggles
	$("#colorization").prop('checked', colorization_enabled);
	$("#auto_refresh").prop('checked', refresh_enabled);
	$("#notifs_enabled").prop('checked', notifs_enabled);
	$("#single_notif").prop('checked', single_notif);
	$("#badge_count").prop('checked', badge_enabled);
	$("#password_protection").prop('checked', password_enabled);
	$("#animations").prop('checked', animations_enabled);

	// update spinbox values (use default values if previously disabled)
	$("#asianness").val(colorization_enabled ? asianness.toString() : DEFAULT_ASIANNESS.toString());
	$("#asianness_slider").val(Math.log(colorization_enabled ? asianness.toString() : DEFAULT_ASIANNESS.toString()));
	$("#r_interval").val(refresh_enabled ? r_interval.toString() : DEFAULT_R_INT.toString());
	$("#hue, #hue_slider").val(hue.toString());
	$("#notif_duration").val(notifs_enabled ? notif_duration.toString() : "0");

	// Initialize slider indicators
	setSliderIndicator("#asianness_slider", asianness);
	setSliderIndicator("#hue_slider", hue);

	
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
		setSliderIndicator("#asianness_slider", asianness);
	}).mouseup(function () {
		$(this).parent().prev('.sliderIndicator')
			.removeClass('visible');
	});
	$("#asianness").change(function () {
		asianness = parseFloat($(this).val());
		generate_color_table();
		$("#asianness_slider").val(Math.log(asianness));
		setSliderIndicator("#asianness_slider", asianness);
	});
	$("#hue").change(function () {
		hue = parseInt($(this).val());
		generate_color_table();
		$("#hue_slider").val(hue);
		setSliderIndicator("#hue_slider", hue);
	});
	$("#hue_slider").change(function () {
		hue = parseInt($(this).val());
		generate_color_table();
		$("#hue").val(hue);
		setSliderIndicator("#hue_slider", hue);
	}).mouseup(function () {
		$(this).parent().prev('.sliderIndicator')
			.removeClass('visible');
	});

	// save data
	$("#localstorage_data").text(Base64.encode(JSON.stringify(localStorage)))
		.click(function() {
			$(this).select();
		});
});

analytics
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-37395872-1']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

var asianness, r_interval, hue, asianness_on, refresh_enabled;

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
	}, 4000);
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
Validator.prototype.add = function (val, condition, success, error) {
	this.inputs.push(val);
	this.conditions.push(condition);
	this.successes.push(success);
	this.errors.push(error);
	return this;
};
Validator.prototype.validate = function () {
	var all_valid = true;
	var val;
	
	for (var i = this.conditions.length - 1; i >= 0; i--) {
		val = this.inputs[i];
		if (this.conditions[i].call(window, val)) {
			this.successes[i].call(window, val);
		} else {
			all_valid = all_valid && false;
			this.errors[i].call(window, val);
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

// Updates options DOM — disables animation if passed true, animates otherwise.
function update_options_dom(doAnimation) {
	if($("#asianness_check").prop('checked')) {
		$("#asianness").parent().slideDown(doAnimation ? 0 : 500);
		// $("#asianness_wrap").slideDown(doAnimation ? 0 : 500);		
		asianness_on = true;
		asianness = $("#asianness").val();
	} else {
		$("#asianness").parent().slideUp(doAnimation ? 0 : 500);
		// $("#asianness_wrap").slideUp(doAnimation ? 0 : 500);		
		asianness_on = false;
		asianness = 0;
	}
	
	if($("#refresh_check").prop('checked')) {
		$("#r_interval").parent().slideDown(doAnimation ? 0 : 500);
		r_int = $("#r_interval").val();
	} else {
		$("#r_interval").parent().slideUp(doAnimation ? 0 : 500);		
	}
}

// events and stuff
$(function(){
	// load
	asianness = localStorage.hasOwnProperty("asianness") ? localStorage["asianness"] : DEFAULT_ASIANNESS;
	r_interval = localStorage.hasOwnProperty("r_int") ? localStorage["r_int"] : DEFAULT_R_INT;
	hue = localStorage.hasOwnProperty("hue") ? localStorage["hue"] : DEFAULT_HUE;
	// Load checkbox states and update DOM
	asianness_on = (localStorage.hasOwnProperty("asianness") ? (localStorage["asianness"] != 0) : true);
	refresh_enabled = (localStorage.hasOwnProperty("r_int") ? (localStorage["r_int"] != 0) : true);
	
	// update spinbox values (use default values if previously disabled)
	$("#asianness").val(asianness_on ? asianness : 4);
	$("#slider").val(Math.log(asianness_on ? asianness : 4));
	$("#r_interval").val(refresh_enabled ? r_interval : 60);
	$("#hue, #hue_slider").val(hue);
	
	$("#asianness_check").prop('checked', asianness_on);
	$("#refresh_check").prop('checked', refresh_enabled);
	
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
	
	update_options_dom(true);
	
	// slider change events
	$("#slider").change(function () {
		asianness = Math.exp(parseFloat($(this).val()));
		generate_color_table();
		$("#asianness").val(asianness);
	});
	$("#asianness").change(function () {
		asianness = $(this).val();
		generate_color_table();
		$("#slider").val(Math.log(asianness));
	});
	$("#hue").change(function () {
		hue = $(this).val();
		generate_color_table();
		$("#hue_slider").val(hue);
	});
	$("#hue_slider").change(function () {
		hue = parseFloat($(this).val());
		generate_color_table();
		$("#hue").val(hue);
	});
	
	// save
	$("#save").click(function() {
		// analytics
		_gaq.push(['_trackEvent', 'Options', 'Save', 'Save Options', Math.abs(asianness)]);

		// actually save
		var new_asianness = parseFloat($("#asianness").val());
		var new_r_int = parseFloat($("#r_interval").val());
		var new_hue = parseFloat($("#hue").val());
		
		validator = new Validator();
		
		validator.add(new_asianness, function (val) {
			return !isNaN(val);
		}, function (val) {
			localStorage.setItem("asianness", $("#asianness_check").prop('checked') ? val.toString() : 0);
		}, function (val) {
			show_error($("#asianness"), "Asianness level must be a number!");
		}).add(new_r_int, function (val) {
			return !(isNaN(val) || (val < 0));
		}, function (val) {
			localStorage.setItem("r_int", $("#refresh_check").prop('checked') ? val.toString() : 0);
		}, function (val) {
			show_error($("#r_interval"), "Refresh interval must be a (positive) number!");
		}).add(new_hue, function (val) {
			return !(isNaN(val) || (val < 0) || (val > 1));
		}, function (val) {
			localStorage.setItem("hue", val.toString());
		}, function (val) {
			show_error($("#hue"), "Hue must be between 0 and 1.");
		}).validate();
		
		if (!validator.isValid) return false;
		
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

var asianness, asianness_on, hue, shadowMax = false;

// Get the size of an object
Object.size = function (obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

// handlers

// disable input to the login form, showing that a login is in progress
function disable_login_form() {
	$("#error_msg").slideUp(250, function () {
		$("#error_msg").text("");
	});
	$("#login_form input").attr("disabled", true);
	$("#do_login").val("Logging in...");
}

// reset the login form to its original state
function reset_login_form() {
	$("body").removeClass("busy");
	$("#login_form input").attr("disabled", false);
	$("#do_login").val("Login");
}

// show that an error occurred during the login process
function show_login_error(text) {
	$("#error_msg").text(text).slideDown();
}

// hide the login form and show the grades
function hide_login_form() {
	// $("#direct_access_form").show();
	// $("#login_form").hide();
	$("#password").val("");
	$(document.body).addClass("logged_in");

	window.setTimeout(function () {
		$("#login_wrapper").hide();
	}, 500);
}

// handles any error thrown while logging in
function on_error_logging_in(jqXHR, textStatus, errorThrown) {
	console.log(textStatus, errorThrown);

	var error_msg;
	switch (textStatus) {
	case "error":
		error_msg = "Unable to log in";
		break;
	case "timeout":
		error_msg = "Login timed out";
		break;
	default:
		error_msg = "Failed to log in";
	}

	toast(error_msg);
	// show_login_error(error_msg);
	reset_login_form();
}
function toast(txt, duration) {
	var invalid_duration = typeof duration == "undefined" || duration < 0;
	duration = invalid_duration ? 5 : duration;
	var toast = document.createElement("div");
	$(toast).addClass("toast").text(txt);
	if (!$("body").hasClass("nonimations"))
		$(toast).addClass("out");
		window.setTimeout(function () {
			$(toast).removeClass("out");
		}, 10);
		window.setTimeout(function () {
			$(toast).addClass("out");
		}, duration * 1000 + 510);
	$("body").append(toast);

	window.setTimeout(function () {
		$(toast).detach();
	}, duration * 1000 + 2510);
}

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

function handle_load_error(jqXHR, textStatus, errorThrown) {
	// console.log(textStatus, errorThrown);
	switch (textStatus) {
		case "timeout": error_msg = "Loading grades timed out"; break;
		case "abort": error_msg = "Loading grades aborted"; break;
		default: error_msg = "Loading grades failed";
	}
	$("body").removeClass("busy").addClass("offline");
	toast(error_msg);
}
function handle_load_error_class(jqXHR, textStatus, errorThrown) {
	// console.log(textStatus, errorThrown);
	switch (textStatus) {
		case "timeout": error_msg = "Loading class grades timed out"; break;
		case "abort": error_msg = "Loading class grades aborted"; break;
		default: error_msg = "Loading class grades failed";
	}
	$("body").removeClass("busy").addClass("offline");
	toast(error_msg);
}

// log in to RRISD
function login_to_rrisd(uname, pass, studentid) {
	// get a session ID
	RRISD_HAC.get_session(
		uname,
		pass,
		studentid,
		function (id) {
			// save url
			RRISD_HAC.get_gradesURL(id, function (url) {
				var captures = /id=([\w\d%]*)/.exec(url);
				// if login failed
				if (typeof captures == "undefined") {
					// return error
					show_login_error("Unable to log in")
					reset_login_form();
					return false;
				}

				sID = captures[1];
				localStorage.setItem("url", sID);
				$("#direct_url").val(sID);
				// load grades directly
				RRISD_HAC.get_gradesHTML(sID, function (doc) {
					processUpdatedGrades(doc);
					hide_login_form();
					reset_login_form();
					$("body").removeClass("busy offline edited");
				}, handle_load_error);
			});
		},
		on_error_logging_in);
}

// log in to AISD
function login_to_aisd(uname, pass, studentid) {
	// get a session ID
	AISD_HAC.get_session(
		uname,
		pass,
		studentid,
		function (id) {
			// save session id
			window.session_id = id;

			// load grades
			AISD_HAC.get_gradesHTML(id, localStorage["studentid"].decrypt().decrypt(),
				function(doc) {
					window.doc = doc;
					processUpdatedGrades(doc);
					hide_login_form();
					reset_login_form();
					$("body").removeClass("busy offline edited");
				});
		},
		on_error_logging_in);
}

// loads an AISD session into memory
function load_aisd_session(callback) {
	if (window.session_id != undefined)
		callback();
	else
		AISD_HAC.get_session(
			localStorage["login"].decrypt().decrypt(),
			localStorage["aisd_password"].decrypt().decrypt(),
			localStorage["studentid"].decrypt().decrypt(),
			function (id) {
				window.session_id = id;
				callback();
			});
}

// login
function login(uname, pass, studentid, district) {
	$("body").addClass("busy");

	// analytics
	_gaq.push(['_trackEvent', 'Account', 'Login']);

	disable_login_form();

	localStorage.setItem("login", uname.encrypt().encrypt());
	localStorage.setItem("studentid", studentid.encrypt().encrypt());
	localStorage.setItem("district", district);
	if (district == "aisd")
		localStorage.setItem("aisd_password", pass.encrypt().encrypt());

	// query the correct district's website
	switch (district) {
	case "rrisd":
		login_to_rrisd(uname, pass, studentid);
		break;
	case "aisd":
		login_to_aisd(uname, pass, studentid);
		break;
	}
}

function showCachedGrades() {
	if (localStorage.hasOwnProperty("grades")) {
		$("#grades").html("").append(HAC_HTML.json_to_html(
			JSON.parse(localStorage["grades"])));

		setChangedGradeIndicators();
	}
}

function update() {
	$("body").addClass("busy");

	// analytics
	_gaq.push(['_trackEvent', 'Grades', 'Refresh']);

	// show cached grades (this undoes user edits)
	showCachedGrades();

	// hide class grades
	$("#classgrades").html("");

	// query the correct district
	switch (localStorage["district"]) {
	case "rrisd":
		RRISD_HAC.get_gradesHTML(localStorage["url"], function (doc) {
			processUpdatedGrades(doc);
			$("body").removeClass("busy offline edited");
		}, handle_load_error);
		break;
	case "aisd":
		load_aisd_session(function () {
			AISD_HAC.get_gradesHTML(
				window.session_id,
				localStorage["studentid"].decrypt().decrypt(),
				function (doc) {
					processUpdatedGrades(doc);
					$("body").removeClass("busy offline edited");
				});
		});
		break;
	}
}

function displayGrades(grades_json) {
	$("#grades").html("").append(HAC_HTML.json_to_html(grades_json));
}

function processUpdatedGrades(doc) {
	var doc_json = HAC_HTML.html_to_jso(doc);
	// output
	displayGrades(doc_json);
	// compare
	if (localStorage.hasOwnProperty("grades")) {
		HAC_HTML.compare_grades(JSON.parse(localStorage["grades"]), doc_json);
		setChangedGradeIndicators();
	}

	// store
	localStorage.setItem("grades", JSON.stringify(doc_json));
	Updater.set_updated();
	$("#lastupdated").html(Updater.get_update_text());
	// class
	$("body").addClass("logged_in");
}

function processUpdatedClassGrades(data, doc) {
	// process marking period-level grades first
	processUpdatedGrades(doc);

	// store
	var cgrades_json = HAC_HTML.cgrades_to_json(doc);
	localStorage.setItem("class-" + data, JSON.stringify(cgrades_json));

	// show grades
	$("#classgrades").html(HAC_HTML.cjson_to_html(cgrades_json));
}

function logout() {
	// analytics
	_gaq.push(['_trackEvent', 'Account', 'Logout']);

	// show login
	$("#direct_access_form").hide();
	$("#login_form").show();
	$(document.body).removeClass("logged_in");

	// hide grades
	$("#grades").html("");
	$("#classgrades").html("");

	// clear cache
	localStorage.clear();
}

function loadClassGrades(data) {
	$("body").addClass("busy");

	// analytics
	_gaq.push(['_trackEvent', 'Class Grades', 'View']);

	// pass data
	var cg;
	(cg = $("#classgrades")).data("data", data);

	// hide old class grades if visible while loading
	cg.html("");

	// Remove grade change indicator
	if (localStorage.hasOwnProperty("changed_grades")) {
		var gradeChanges = JSON.parse(localStorage["changed_grades"]);
		delete gradeChanges[data];
		localStorage.setItem("changed_grades", JSON.stringify(gradeChanges));
		// setChangedGradeIndicators();
	}

	// show cached grades (this undoes user edits)
	showCachedGrades();

	if (localStorage.hasOwnProperty("class-" + data))
		cg.html("").append(
			HAC_HTML.cjson_to_html(
				JSON.parse(
					localStorage["class-" + data])));

	// load
	switch (localStorage["district"]) {
	case "rrisd":
		RRISD_HAC.get_classGradeHTML(localStorage["url"], data, function(stuff) {
			processUpdatedClassGrades(data, stuff);
			$("body").removeClass("busy offline edited");
		}, handle_load_error_class);
		break;
	case "aisd":
		load_aisd_session(function() {
			AISD_HAC.get_classGradeHTML(
				window.session_id,
				localStorage["studentid"].decrypt().decrypt(),
				data,
				function(stuff) {
					processUpdatedClassGrades(data, stuff);
					$("body").removeClass("busy offline edited");
				});
		});
		break;
	}
}

// password protection
function lock() {
	// $(document.body).addClass("locked").removeClass("logged_in");
	$(document.body).addClass("locked");
	$("#unlocker").focus();
	$("#restricted_access_wrapper").removeClass("hide");
}

var shakeTimer;
function unlock(password) {
	if (typeof shakeTimer !== "undefined") window.clearTimeout(shakeTimer);

	var hashedInput = CryptoJS.SHA512(password).toString();
	if (hashedInput === localStorage["password"]) {
		$("#unlocker")[0].setCustomValidity("");
		$(document.body).removeClass("locked");
		window.setTimeout(function () {
			$("#restricted_access_wrapper").addClass("hide");
		}, 1000);
	} else {
		if (!localStorage.hasOwnProperty("animations") || localStorage["animations"] != "on") {
			// $("#unlocker")[0].setCustomValidity("Incorrect Password");
			show_error($("#unlocker"), "Incorrect Password");
		} else {
			$("#restricted_access").addClass("shake");
			shakeTimer = window.setTimeout(function () {
				$("#restricted_access").removeClass("shake");
			}, 1000);
		}
		$("#unlocker").select();
	}
}

// throttle, used for scrolling
function throttle(ms, callback) {
	var timer, lastCall = 0;

	return function() {
		var now = new Date().getTime(),
		diff = now - lastCall;
		if (diff >= ms) {
			lastCall = now;
			callback.apply(this, arguments);
		}
	};
}

function imposter(gradesToFake) {
	// for development testing
	// gradesToFake = [[
	// 	1, // row
	// 	7, // col
	// 	"100" // grade
	// ], ... ];

	var fakeGrades = JSON.parse(localStorage["grades"]);

	for (var n = gradesToFake.length - 1; n >=0; n--) {
		fakeGrades[gradesToFake[n][0]].grades[gradesToFake[n][1]] = gradesToFake[n][2];
	}
	localStorage["grades"] = JSON.stringify(fakeGrades);
	return fakeGrades;
}

function setChangedGradeIndicators() {
	var n = 0;
	if (localStorage.hasOwnProperty("changed_grades")) {
		var changedGrades = JSON.parse(localStorage["changed_grades"]);

		for (gradeChange in changedGrades) {
			if (changedGrades.hasOwnProperty(gradeChange)) {

				$("#grades tr").eq(changedGrades[gradeChange].row)
					.children(".grade").eq(changedGrades[gradeChange].col)
					.children("a").removeClass().addClass(changedGrades[gradeChange].dir);
			}
		}
		n = Object.size(changedGrades);
	}
	// Set Badge
	localStorage.setItem("badge", n.toString());
	if (localStorage["badge_enabled"] == "true")
		chrome.browserAction.setBadgeText({"text": n > 0 ? n.toString() : ""});

}

// init
$(function () {

	// Setup AJAX (converters not used)
	$.ajaxSetup({
		timeout: 15000,
		contents: {
			gjson: /gjson/,
			cjson: /cjson/
		},
		converters: {
			"text gjson": HAC_HTML.html_to_jso,
			"text cjson": HAC_HTML.cgrades_to_json,
			"gjson html": HAC_HTML.json_to_html,
			"cjson html": HAC_HTML.cjson_to_html
		}
	});

	// backwards compatibility with 1.x: update district if not set
	// (in 1.x, the only valid district was RRISD)
	if (!localStorage.hasOwnProperty("district"))
		localStorage.setItem("district", "rrisd");

	// Set animations
	if (!localStorage.hasOwnProperty("animations")) {
		localStorage.setItem("animations", "on");
	}
	if (localStorage["animations"] != "on")
		$("body").addClass("noanimations");

	// asianness
	if (localStorage.hasOwnProperty("asianness")) {
		asianness = localStorage.getItem("asianness");
		if (asianness == null || isNaN(asianness)) asianness = DEFAULT_ASIANNESS;
	} else asianness = DEFAULT_ASIANNESS;
	asianness_on = (localStorage.hasOwnProperty("asianness_on") ? localStorage["asianness_on"] : true) === "true";
	
	// hue
	if (localStorage.hasOwnProperty("hue")) {
		hue = parseInt(localStorage.getItem("hue"));
		if (hue == null || isNaN(hue)) hue = DEFAULT_HUE;
	} else hue = DEFAULT_HUE;

	// paint the logo
	$(window).focus(function (e) {
		paintLogo($("#logo")[0], hue, 36);
	});

	// handlers
	$("#login_form").submit(function(e) {
		e.preventDefault();
		login($("#login").val(), $("#password").val(), $("#studentid").val(), $("#district").val());
		return false;
	});
	$("#do_direct_access").click(update);
	$("#cancel_refresh").click(function () {
		$("body").removeClass("busy");
		XHR_Queue.abortAll();
	});
	$("#do_options").click(function() { chrome.tabs.create({url: "options.html"}); });
	$("#do_logout").click(logout);
	$("#do_close").click(function() {
		// remove popup by selecting the tab
		chrome.tabs.getSelected(null, function(tab) {
			chrome.tabs.update(tab.id, { selected: true } )
		});
	});

	// fill in form
	try {
		$("#login").attr("value", localStorage["login"].decrypt().decrypt());
		$("#studentid").attr("value", localStorage["studentid"].decrypt().decrypt());
	} catch (e) { /* it's not filled out yet, carry on */ }

	// fill in grades
	if (localStorage.hasOwnProperty("grades") && localStorage["grades"] != "") {
		displayGrades(JSON.parse(localStorage["grades"]));

		setChangedGradeIndicators();
	}
	
	// shadow on scrolling
	$(window).scroll(throttle(30, function() {
			var pos = $(window).scrollTop();
			if (pos == 0) {
				$("#direct_access_form").css("box-shadow", "none");
				shadowMax = false;
			}
			else if (pos < 32) {
				$("#direct_access_form").css("box-shadow",
					"0px " + Math.round(pos / 4) + "px " +
					Math.round(pos / 4) + "px -" +
					Math.round(pos / 4) + "px rgba(0,0,0,0.5)");
				shadowMax = false;
			}
			else if (!shadowMax) {
				$("#direct_access_form").css("box-shadow", "0px 8px 8px -8px rgba(0,0,0,0.5)");
				shadowMax = true;
			}

			return true;
		}
	));

	// login or direct access?
	if (typeof localStorage["url"] == "undefined" && typeof localStorage["aisd_password"] == "undefined")
		// not logged in
		// $("#direct_access_form").addClass("hide");
		$("#login_form").removeClass("hide");
	else {
		// logged in
		$("#login_form").addClass("hide");
		// $("#direct_access_form").removeClass("hide");
		// $("#direct_url").val(localStorage['url']);
		$("#lastupdated").html(Updater.get_update_text());
		// bug: body won't scroll if the "logged_in" class is added immediately
		window.setTimeout(function () { $(document.body).addClass("logged_in"); }, 100);
	}

	$("#logOutToReset").click(function () {
		logout();
		$("#resetInfo").removeClass("visible");
		// $("#restricted_access_wrapper").hide();
	});
	$("#cancelReset").click(function () {
		$("#restricted_access").removeClass("reset");
	});
	$("#resetLink").click(function () {
		$("#restricted_access").addClass("reset");
	});

	// password protection
	if (!localStorage.hasOwnProperty("password")) {
		localStorage["password"] = ""; // set default if not set
	} else if (localStorage["password"] != "") {
		// Lock if necessary
		lock();
		$("#unlocker").focus();
		$("#restricted_access").submit(function (e) {
			e.preventDefault();
			unlock($("#unlocker").val());
			return false;
		});
	} else {
		$("#restricted_access_wrapper").addClass("hide");
	}

	$("html").css("height", $("#main_view").outerHeight() + "px");
});

// analytics
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-37395872-1']);
_gaq.push(['_trackPageview']);

(function () {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();
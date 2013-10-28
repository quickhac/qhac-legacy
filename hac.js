/** @type {number} */
var asianness,

/** @type {boolean} */
asianness_on,

/** @type {number} */
hue,

/** @type {boolean} */
shadowMax = false;

/**
 * Gets the number of properties of an object
 * @param {Object} obj - the object to get the size of
 * @returns {number} the number of properties of the object
 */
Object.size = function (obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

/***================***
 *** LOGIN HANDLERS ***
 ***================***/

/** Disables input to the login form and shows that a login is in progress */
function disable_login_form() {
	$("#error_msg").slideUp(250, function () {
		$("#error_msg").text("");
	});
	$("#login_form input").attr("disabled", true);
	$("#do_login").val("Logging in...");
}

/** Resets the login form to its original enabled state */
function reset_login_form() {
	$("body").removeClass("busy");
	$("#login_form input").attr("disabled", false);
	$("#do_login").val("Login");
}

/**
 * Shows that an error occurred during the login process
 * @param {string} text - the text to display
 * @deprecated use {@link toast} instead
 */
function show_login_error(text) {
	$("#error_msg").text(text).slideDown();
}

/** Hides the login form and show the grades */
function hide_login_form() {
	$("#password").val("");
	$(document.body).addClass("logged_in");

	window.setTimeout(function () {
		$("#login_wrapper").hide();
		$("#restricted_access_wrapper").addClass("hide");
	}, 500);
}

/**
 * Handles any error thrown while logging in by displaying an error message
 * to the user and showing the login form
 * @param {XMLHttpRequest} jqXHR - the request that threw the error
 * @param {string} textStatus - the type of error thrown
 * @param {string} errorThrown - a description of the error
 */
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
	
	reset_login_form();
}

/**
 * Displays a small message near the bottom of the window, inspired by Android
 * Toast
 * @param {string} txt - the message to display
 * @param {number} [duration=5] - the length of time in seconds to display the
 * message for
 */
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

/**
 * Displays an error on the restricted access form (password protection)
 * @param {jQuery} $input - the element that sent the request to show an error
 * @param {string} message - the message to display
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
 * Handles any error that occurs when loading grades fails
 * @param {XMLHttpRequest} jqXHR - the request that caused the error
 * @param {string} textStatus - the type of error thrown
 * @param {string} errorThrown - a description of the error
 */
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

/**
 * Handles any error that occurs when loading class grades fails
 * @param {XMLHttpRequest} jqXHR - the request that caused the error
 * @param {string} textStatus - the type of error thrown
 * @param {string} errorThrown - a description of the error
 */
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

/**
 * Logs into Round Rock ISD with the given credentials
 * @param {string} uname - username
 * @param {string} pass - password
 * @param {string} studentid - 6-digit district-assigned student ID
 */
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
					chrome.extension.getBackgroundPage().create_interval(true);
					$("body").removeClass("busy offline edited");
				}, handle_load_error);
			});
		},
		on_error_logging_in);
}

/**
 * Logs into Austin ISD with the given credentials
 * @param {string} uname - username
 * @param {string} pass - password
 * @param {string} studentid - 7-digit district-assigned student ID
 */
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
					chrome.extension.getBackgroundPage().create_interval(true);
					$("body").removeClass("busy offline edited");
				});
		},
		on_error_logging_in);
}

/**
 * Saves credentials to localStorage and logs in
 * @param {string} uname - username
 * @param {string} pass - password
 * @param {string} studentid - district-assigned student ID
 * @param {string} district - district name
 */
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

/** Generates the bar that shows up right below the overall grades table */
function generateBottomBar() {
	var $root = $(document.createElement("div"));
	$root.attr("id", "bottom_bar");

	var $gpa_wrapper = $(document.createElement("span"));
	$gpa_wrapper.attr("id", "gpa_wrapper").html("GPA: ")
		.append($(document.createElement("span")).attr("id", "gpa"));

	var ad = Ad.generate_ad();

	$root.append($gpa_wrapper).append(ad).append(
		$(document.createElement("span")).html("&nbsp;")
			.css("clear", "both"));

	$("#grades").append($root);
}

/** Retrieves the cached grades from localStorage and displays them */
function showCachedGrades() {
	if (localStorage.hasOwnProperty("grades")) {
		$("#grades").html("").append(HAC_HTML.json_to_html(
			JSON.parse(localStorage["grades"])));

		generateBottomBar();

		setChangedGradeIndicators();
	}
}

/**
 * Checks if a response from HAC contains grade data
 * @param {string} the HTML document to parse and check
 * @returns {boolean} true if the document is valid
 */
function isValidGradeData(doc) {
	return $(".DataTable", $.parseHTML(doc)).length != 0;
}

/** Reverts user edits and tries to update the grades from the server */
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
		RRISD_HAC.get_gradesHTML(
			localStorage["url"], processUpdatedGrades, handle_load_error);
		break;
	case "aisd":
		AISD_HAC.load_session(function() {
			AISD_HAC.get_gradesHTML(
				window.session_id,
				localStorage["studentid"].decrypt().decrypt(),
				processUpdatedGrades)
		});
		break;
	}
}

/**
 * Displays a set of grades from JSON on-screen
 * @param {JSON} grades_json - the grades to display
 */
function displayGrades(grades_json) {
	$("#grades").html("").append(HAC_HTML.json_to_html(grades_json));
	generateBottomBar();
}

/**
 * Saves a response from a HAC server for marking period grades and displays it
 * to the user
 * @param {string} doc - the HTML response of the server
 * @returns {boolean} true if the operation was successful
 */
function processUpdatedGrades(doc) {
	if (!isValidGradeData(doc)) return false;

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
	// classes
	$("body").addClass("logged_in").removeClass("busy offline edited");
	// gpa
	GPA.show();

	return true;
}

/**
 * Saves a response from a HAC server for class grades and displays it to the user
 * @param {string} data - the unique class and marking period identifier
 * @param {string} doc - the HTML response of the server
 * @returns {boolean} true if the operation was successful
 */
function processUpdatedClassGrades(data, doc) {
	// process marking period-level grades first
	if (!processUpdatedGrades(doc))
		// if processUpdatedGrades returns false, cancel the operation; it failed
		return false;

	// store
	var cgrades_json = HAC_HTML.cgrades_to_json(doc);
	localStorage.setItem("class-" + data, JSON.stringify(cgrades_json));

	// show grades
	$("#classgrades").html(HAC_HTML.cjson_to_html(cgrades_json));

	return true;
}

/**
 * Logs out, deletes all user data, and shows the login from
 */
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

	// clear interval
	chrome.extension.getBackgroundPage().clear_interval();
}

/**
 * Loads class grades for a given class and marking period
 * @param {string} data - the unique class and marking period identifier, which
 * corresponds to the ID the HAC server assigns
 */
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
		RRISD_HAC.get_classGradeHTML(
			localStorage["url"], data,
			function(stuff) { processUpdatedClassGrades(data, stuff); },
			handle_load_error_class);
		break;
	case "aisd":
		AISD_HAC.load_session(function() {
			AISD_HAC.get_classGradeHTML(
				window.session_id,
				localStorage["studentid"].decrypt().decrypt(),
				data,
				function(stuff) { processUpdatedClassGrades(data, stuff); });
		});
		break;
	}
}

/** Restricts access to the grades by displaying a form over them */
function lock() {
	// $(document.body).addClass("locked").removeClass("logged_in");
	$(document.body).addClass("locked");
	$("#unlocker").focus();
	$("#restricted_access_wrapper").removeClass("hide");
}

var shakeTimer;

/**
 * Tests the password given through the restricted access form and grants access
 * if it is correct
 * @param {string} password - the password that the user entered
 */
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

/**
 * Throttles calls to a callback to fire at a given minimum interval. Used for
 * setting the shadow blur while scrolling.
 * @param {number} ms - the number of milliseconds to wait between each function call
 * @param {function} callback - the function to call
 */
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

/**
 * Changes given grades in the grades JSON stored in localStorage to the given
 * values for testing purposes
 * @param {Array.<Array.<number, number, string>>}} gradesToFake - an array
 * of grades to change
 */
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

/** Displays changed grade indicators for all grades that have recently changed */
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
	// body is hidden in css on page load

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
			if (pos <= 0) {
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
		$("#login_form").removeClass("hide");
	else {
		// logged in
		$("#login_form").addClass("hide");
		$("#lastupdated").html(Updater.get_update_text());
		GPA.show();
		$(document.body).addClass("logged_in");
	}

	$("#logOutToReset").click(function () {
		logout();
		$("#resetInfo").removeClass("visible");
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

	// bug: http://stackoverflow.com/questions/13217353/random-whitespace-in-google-chrome-extension
	// show body after done populating DOM
	window.setTimeout(function() {
		$(document.body).css({
			width: '600px',
			height: '100px',
			display: 'block'})
		.animate({
			opacity: 1,
			height: $(document.body).height()}); // this is the hackiest HAC hack that QuickHAC has ever HAC'd
	}, 100);
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
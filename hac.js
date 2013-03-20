var asianness;

// handlers
function login(uname, pass, studentid) {
	$("body").addClass("busy");

	// analytics
	_gaq.push(['_trackEvent', 'Account', 'Login']);

	// error handling
	$("#error_msg").slideUp(250, function () {
		$("#error_msg").text("");
	});
	$("#login_form input").attr("disabled", true);
	$("#do_login").val("Logging in...");

	localStorage.setItem("login", uname.encrypt().encrypt());
	// localStorage.setItem("pass", pass.encrypt().encrypt());
	localStorage.setItem("studentid", studentid.encrypt().encrypt());
	// get a session ID
	HAC.get_session(
		uname,
		pass,
		studentid,
		function (id) {
			// save url
			HAC.get_gradesURL(id, function(url) {
				var captures = /id=([\w\d%]*)/.exec(url);
				// if login failed
				if (captures == undefined) {
					// return error
					$("#error_msg").text("Unable to log in").slideDown();

					// reset login form
					$("body").removeClass("busy");
					$("#login_form input").attr("disabled", false);
					$("#do_login").val("Login");
					return false;
				}

				sID = captures[1];
				localStorage.setItem("url", sID);
				$("#direct_url").val(sID);
				// load grades directly
				HAC.get_gradesHTML_direct(sID, function(doc) {
					// output
					var doc_json = HAC_HTML.html_to_jso(doc);
					$("#grades").html("").append(HAC_HTML.json_to_html(doc_json));

					// store
					localStorage.setItem("grades", JSON.stringify(doc_json));
					$("#lastupdated").html(Updater.get_update_text());
					Updater.set_updated();

					// hide login
					$("#direct_access_form").show();
					$("#login_form").hide();
					$("#password").val("");
					$(document.body).addClass("logged_in");

					// reset login form
					$("#login_form input").attr("disabled", false);
					$("#do_login").val("Login");

					$("body").removeClass("busy");
				});
			});
		},
		function (jqXHR, textStatus, errorThrown) { // ON ERROR LOGGING IN
			console.log(textStatus, errorThrown);
			switch (textStatus) {
			case "error":
				$("#error_msg").text("Unable to log in").slideDown();
				break;
			case "timeout":
				$("#error_msg").text("Login timed out").slideDown();
				break;
			}

			$("body").removeClass("busy");
			$("#login_form input").attr("disabled", false);
			$("#do_login").val("Login");
		});
}

function update(sID) {
	$("body").addClass("busy");

	// analytics
	_gaq.push(['_trackEvent', 'Grades', 'Refresh']);

	HAC.get_gradesHTML_direct(sID, function(doc) {
		processUpdatedGrades(doc);

		$("body").removeClass("busy");
	});
}

function processUpdatedGrades(doc) {
	// output
	var doc_json = HAC_HTML.html_to_jso(doc);
	$("#grades").html("").append(HAC_HTML.json_to_html(doc_json));
	// compare
	HAC_HTML.compare_grades(JSON.parse(localStorage["grades"]), doc_json);
	// store
	localStorage.setItem("grades", JSON.stringify(doc_json));
	Updater.set_updated();
	$("#lastupdated").html(Updater.get_update_text());
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

	// load
	HAC.get_classGradeHTML(localStorage["url"], data, function(stuff) {
		// reload class grades
		processUpdatedGrades(stuff);

		$("#classgrades").html(HAC_HTML.cjson_to_html(HAC_HTML.cgrades_to_json(stuff)));

		$("body").removeClass("busy");
	});
}

// init
$(function(){
	// asianness
	asianness = localStorage.getItem("asianness");
	if ((asianness == null) || (isNaN(asianness))) asianness = 4;

	// handlers
	$("#login_form").submit(function(e) {
		e.preventDefault();
		login($("#login").val(), $("#password").val(), $("#studentid").val());
		return false;
	});
	$("#do_direct_access").click(function() { update($("#direct_url").val()); });
	$("#do_options").click(function() { chrome.tabs.create({url: "options.html"}); });
	$("#do_logout").click(logout);

	// fill in form
	try {
		$("#login").attr("value", localStorage["login"].decrypt().decrypt());
		$("#studentid").attr("value", localStorage["studentid"].decrypt().decrypt());
	} catch (e) { /* it's not filled out yet, carry on */ }

	// fill in grades
	if (localStorage["grades"] != undefined)
		$("#grades").append(HAC_HTML.json_to_html(JSON.parse(localStorage["grades"])));

	// badge
	chrome.browserAction.setBadgeText({"text": ""});
	localStorage.setItem("badge", "0");

	// shadow on scrolling
	$(window).scroll(function() {
		var pos = $(window).scrollTop();
		if (pos == 0)
			$("#direct_access_form").css("box-shadow", "none");
		else if (pos < 32)
			$("#direct_access_form").css("box-shadow", "0px 0px " +
				parseInt(pos / 4) + "px #888");
		else
			$("#direct_access_form").css("box-shadow", "0px 0px 8px #888");
	});

	// login or direct access?
	if (localStorage["url"] == undefined) $("#direct_access_form").hide();
	else {
		$("#login_form").hide();
		$("#direct_url").val(localStorage['url']);
		$("#lastupdated").html(Updater.get_update_text());
		// bug: body won't scroll if the "logged_in" class is added immediately
		window.setTimeout(function(){ $(document.body).addClass("logged_in"); }, 100);
	}
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
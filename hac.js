var asianness;

// handlers
function login(uname, pass, studentid) {
	$("body").addClass("busy");
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

	HAC.get_gradesHTML_direct(sID, function(doc) {
		// output
		var doc_json = HAC_HTML.html_to_jso(doc);
		$("#grades").html("").append(HAC_HTML.json_to_html(doc_json));
		// compare
		HAC_HTML.compare_grades(JSON.parse(localStorage["grades"]), doc_json);
		// store
		localStorage.setItem("grades", JSON.stringify(doc_json));
		$("#lastupdated").html(Updater.get_update_text());
		Updater.set_updated();

		$("body").removeClass("busy");
	});
}

function logout() {
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

	HAC.get_classGradeHTML(localStorage["url"], data, function(stuff) {
		// color in assignment grades
		$("#classgrades").html(stuff).find(".AssignmentGrade").each(function(e) {
			if (!isNaN(parseInt(this.textContent))) {
				var pointsPossible = $(this).parent().children(".AssignmentPointsPossible");
				if (pointsPossible.length == 0) {
					$(this).css("backgroundColor", HAC_HTML.colorize(this.textContent));
				}
				else {
					$(this).css("backgroundColor", HAC_HTML.colorize(100 * this.textContent / pointsPossible[0].textContent));
				}
			}
		});
		// color in averages
		$(".CurrentAverage").each(function(e) {
			$(this).css("backgroundColor", HAC_HTML.colorize(this.textContent.substr(17)));
		});
		$(".DataTable tr:last-child").each(function(e) {
			var avg = $(this).children()[3];
			$(avg).css("backgroundColor", HAC_HTML.colorize(avg.textContent));		});
		// remove extraneous information
		$(".PageHeader, .PageNote, .StudentHeader, .StudentHeader+table").remove();

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
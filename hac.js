var asianness;

// handlers
function login(uname, pass, studentid) {
	$("body").addClass("busy");

	localStorage.setItem("login", uname.encrypt().encrypt());
	localStorage.setItem("pass", pass.encrypt().encrypt());
	localStorage.setItem("studentid", studentid.encrypt().encrypt());
	// get a session ID
	HAC.get_session(
		uname,
		pass,
		studentid,
		function(id) {
			// save url
			HAC.get_gradesURL(id, function(url) {
				sID = /id=([\w\d%]*)/.exec(url)[1];
				localStorage.setItem("url", sID);
				$("#direct_url").val(sID);
				// load grades directly
				HAC.get_gradesHTML_direct(sID, function(doc) {
					// output
					var doc_json = HAC_HTML.html_to_jso(doc);
					$("#grades").html("").append(HAC_HTML.json_to_html(doc_json));

					// store
					localStorage.setItem("grades", JSON.stringify(doc_json));
					localStorage.setItem("lastupdated", (new Date()).toString());
					$("#lastupdated").html(localStorage['lastupdated']);

					// hide login
					$("#direct_access_form").show();
					$("#login_form").hide();

					$("body").removeClass("busy");
				});
			});
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
		localStorage.setItem("lastupdated", (new Date()).toString());
		$("#lastupdated").html(localStorage['lastupdated']);

		$("body").removeClass("busy");
	});
}

function logout() {
	// show login
	$("#direct_access_form").hide();
	$("#login_form").show();

	// hide grades
	$("#grades").html("");

	// clear cache
	localStorage.clear();
}

function loadClassGrades(data) {
	$("body").addClass("busy");

	HAC.get_classGradeHTML(localStorage["url"], data, function(stuff) {
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
		$(".CurrentAverage").each(function(e) {
			$(this).css("backgroundColor", HAC_HTML.colorize(this.textContent.substr(17)));
		})
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
	$("#do_login").click(function() { login($("#login").attr("value"), $("#password").attr("value"), $("#studentid").attr("value")); });
	$("#do_direct_access").click(function() { update($("#direct_url").val()); });
	$("#do_logout").click(logout);

	// fill in form
	try {
		$("#login").attr("value", localStorage["login"].decrypt().decrypt());
		$("#studentid").attr("value", localStorage["studentid"].decrypt().decrypt());
	} catch (e) { /* it's not filled out yet, carry on */ }

	// fill in grades
	if (localStorage["grades"] != undefined)
		$("#grades").append(HAC_HTML.json_to_html(JSON.parse(localStorage["grades"])));

	// login or direct access?
	if (localStorage["url"] == undefined) $("#direct_access_form").hide();
	else {
		$("#login_form").hide();
		$("#direct_url").val(localStorage['url']);
		$("#lastupdated").html(localStorage['lastupdated']);
	}

	// badge
	chrome.browserAction.setBadgeText({"text": ""});
	localStorage.setItem("badge", "0");
});
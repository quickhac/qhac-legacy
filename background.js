// the main updating function
var theInterval, cached_refresh_interval;

function silent_update() {
	HAC.get_gradesHTML_direct(localStorage['url'], function(doc) {
		// should this even continue?
		if (localStorage["r_int"] == 0) {
			window.clearInterval(theInterval);
			return;
		}

		// compare
		var doc_json = HAC_HTML.html_to_jso(doc);
		HAC_HTML.compare_grades(JSON.parse(localStorage["grades"]), doc_json, function () {
			text = localStorage["badge"];
			if (isNaN(parseInt(text))) text = 0;
			text = parseInt(text) + 1;
			localStorage.setItem("badge", text.toString(10));

			chrome.browserAction.setBadgeText({"text": text.toString(10)});
		});

		// store
		localStorage.setItem("grades", JSON.stringify(doc_json));
		Updater.set_updated();

		// reset interval if changed
		if (cached_refresh_interval != localStorage["r_int"]) {
			window.clearInterval(theInterval);
			theInterval = window.setInterval(silent_update, localStorage["r_int"]);
		}
	});
}

// refresh every once in a while
$(function() {
	// get interval
	var r_int = localStorage["r_int"];
	if (r_int == undefined) r_int = 60;
	else if (r_int == 0) return;

	cached_refresh_interval = r_int;

	// set interval
	theInterval = window.setInterval(silent_update, r_int * 60000);

	// update once
	silent_update();
});
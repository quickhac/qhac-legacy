// the main updating function
var theInterval, cached_refresh_interval;

// Get the size of an object
Object.size = function (obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

function process_update(doc) {
	var count = 0;
	// compare
	var doc_json = HAC_HTML.html_to_jso(doc);
	HAC_HTML.compare_grades(JSON.parse(localStorage["grades"]), doc_json);

	var count = Object.size(JSON.parse(localStorage["changed_grades"]));

	localStorage.setItem("badge", count.toString(10));

	if (localStorage["badge_enabled"] == "true")
		chrome.browserAction.setBadgeText({"text": count > 0 ? count.toString(10) : ""});

	// store
	localStorage.setItem("grades", JSON.stringify(doc_json));
	Updater.set_updated();

	// reset interval if changed
	var new_r_int = localStorage["r_int"];
	if (typeof new_r_int == "undefined") new_r_int = 60;
	if (cached_refresh_interval != new_r_int) {
		window.clearInterval(theInterval);
		theInterval = window.setInterval(silent_update, new_r_int * 60000);
	}
}

function silent_update() {
	// should this even continue?
	if (localStorage["r_int"] == 0) {
		window.clearInterval(theInterval);
		return;
	}

	// query the correct district
	switch (localStorage["district"]) {
	case "rrisd":
		RRISD_HAC.get_gradesHTML(localStorage["url"], process_update);
		break;
	case "aisd":
		// TODO
	}
}

// refresh every once in a while
$(function() {
	// get interval
	var r_int = localStorage["r_int"];
	if (typeof r_int == "undefined") r_int = 60;
	else if (r_int == 0) return;

	cached_refresh_interval = r_int;

	// set interval
	theInterval = window.setInterval(silent_update, r_int * 60000);

	// update once
	silent_update();
});
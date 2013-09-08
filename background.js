/** @type {Interval} */
var theInterval,

/** @type {number} */
cached_refresh_interval;

/** Gets the size of an object */
Object.size = function (obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

/**
 * Processes an update from the server, displaying notifications if necessary
 * @param {string} doc - the HTML element to process
 */
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
	var new_r_int = 60;
	if (localStorage.hasOwnProperty("r_int") && localStorage["r_int"] !== "") {
		new_r_int = parseInt(localStorage["r_int"]);
	}
	if (cached_refresh_interval != new_r_int) {
		window.clearInterval(theInterval);
		theInterval = window.setInterval(silent_update, new_r_int * 60000);
	}
}

/** Checks the server for updated grades */
function silent_update() {
	// should this even continue?
	if (parseInt(localStorage["r_int"]) == 0) {
		window.clearInterval(theInterval);
		return;
	}

	// query the correct district
	switch (localStorage["district"]) {
	case "rrisd":
		RRISD_HAC.get_gradesHTML(localStorage["url"], process_update);
		break;
	case "aisd":
		// clear session id if it might be expired
		if (localStorage["r_int"] > 5) window.session_id = undefined;
		AISD_HAC.load_session(function() {
			AISD_HAC.get_gradesHTML(
				window.session_id,
				localStorage["studentid"].decrypt().decrypt(),
				process_update);
		});
		break;
	}
}

// refresh every once in a while
function create_interval(cancel_update_now) {
	// get interval
	var r_int = localStorage["r_int"];
	if (typeof r_int === "undefined") r_int = 60;
	else if (r_int == 0 || isNaN(r_int)) return;
	else r_int = parseInt(r_int);

	cached_refresh_interval = r_int;

	// set interval
	theInterval = window.setInterval(silent_update, r_int * 60000);

	// update once
	if (!cancel_update_now) silent_update();

	return theInterval;
}

function clear_interval() {
	window.clearInterval(theInterval);
}

$(create_interval);

// analytics
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-37395872-1']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

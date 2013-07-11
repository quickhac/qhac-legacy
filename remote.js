// primitive encryption functions. this'll get 'em!

String.prototype.rot13 = function (){
	return this.replace(/[a-zA-Z]/g, function(c){
		return String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26);
	});
};

String.prototype.b64enc = function () {
	return Base64.encode(this);
};

String.prototype.b64dec = function () {
	return Base64.decode(this);
}

String.prototype.encrypt = function () {
	return this.b64enc().rot13();
};

String.prototype.decrypt = function () {
	return this.rot13().b64dec();
}

/**
 * A queue of XHRs
 * @namespace
 */
Queuer = (function () {

	/** @constructor */
	function Queuer() {
		this.queue = [];
	};

	/**
	 * Adds an XHR to the queue
	 * @param {XMLHttpRequest} xhr - the request to add
	 * @returns the Queuer
	 * @namespace Queuer
	 */
	Queuer.prototype.addRequest = function (xhr) {
		this.queue.push(xhr);
		return this;
	};

	/**
	 * Aborts all of the XHRs in the queue
	 * @returns the Queuer
	 * @namespace Queuer
	 */
	Queuer.prototype.abortAll = function () {
		while (this.queue.length) {
			this.queue[0].abort();
			this.queue.splice(0, 1);
		}
		return this;
	};

	return Queuer;
})();

/** @type Queuer */
var XHR_Queue = new Queuer();

/**
 * Logs an error to the console
 * @param {XMLHttpRequest} jqXHR - the request that threw the error
 * @param {string} textStatus - the type of error thrown
 * @param {string} errorThrown - a description of the error
 */
function default_error_handler(jqXHR, textStatus, errorThrown) {
	console.error(jqXHR, textStatus, errorThrown)
}

/**
 * Manages the time of the last update
 * @namespace
 */
var Updater = {

	/**
	 * Saves the current time to localStorage as the last updated time
	 */
	set_updated: function () {
		localStorage.setItem("lastupdated", (new Date()).getTime());
	},

	/**
	 * Gets the relative time of the last update based on localStorage
	 * @returns {string} relative time of the last update
	 */
	get_update_text: function () {
		return moment(parseInt(localStorage["lastupdated"])).fromNow();
	}
};

/**
 * Generates useful links for the user
 */
var Ad = {

	/**
	 * Creates the most relevant link
	 * @returns {Element} a link to append to the marking period grades table
	 */
	generate_ad: function () {
		var wrapper = document.createElement("div");
		$(wrapper).attr("id", "ad_wrapper");

		// survey
		if (localStorage["ad_3"] != "no")
			return Ad.generate_ad_inner(
				"We value your feedback! Take our survey &raquo;",
				"https://docs.google.com/forms/d/1VcjEbLuRL1AwNE7sXmJ003uM0KJ8bpW_Ev31nII_s1A/viewform",
				"3");

		// workaround for scrolling
		if ((window.navigator.appVersion.indexOf("OS X 10") != -1) && (localStorage["ad_2"] != "no"))
			return Ad.generate_ad_inner(
				"Using OS X? Scrolling might not work. Here's a fix. &raquo;",
				"http://hacaccess.herokuapp.com/qhac/ml-fix", "2");

		// edit grade banner
		if (localStorage["ad_1"] != "no")
			return Ad.generate_ad_inner(
				"New in 1.2: Edit grades locally. Click on any assignment grade to get started!",
				"", "1");

		return document.createDocumentFragment();
	},

	/**
	 * Generates a formatted link
	 * @param {string} text - the text of the link
	 * @param {string} url - the destination of the link
	 * @param {string} id - a unique identifier to send to Google Analytics when
	 * the link is clicked
	 */
	generate_ad_inner: function (text, url, id) {
		var wrapper = document.createElement("div");
		wrapper.setAttribute("id", "ad_wrapper");

		// create main ad
		var ad;
		if (url == "") {
			ad = document.createElement("span");
			$(ad).attr("id", "ad").html(text);
		} else {
			ad = document.createElement("a");
			$(ad).attr("id", "ad").data("label", id)
				.click(function () {
					chrome.tabs.create({"url": url});
					var label = $(this).data("label");
					if (label != "")
						_gaq.push(['_trackEvent', 'Ad', 'Follow ' + label]);
				})
				.html(text);
		}
		wrapper.appendChild(ad);

		// create link to hide ad
		var hideAd = document.createElement("a");
		$(hideAd).attr({"id": "hide_ad", "href": "#"}).data("label", id)
			.html("&times;").click(function () {
				var label = $(this).data("label");
				if (label != "")
					_gaq.push(['_trackEvent', 'Ad', 'Hide ' + label]);
				$("#ad_wrapper").remove();
				localStorage.setItem("ad_" + label, "no");
			});
		wrapper.appendChild(hideAd);

		return wrapper;
	}
};

/**
 * Interfaces with the Round Rock ISD Home Access Center
 * @namespace
 */
var RRISD_HAC = {

	/**
	 * Requests a session ID from Home Access by logging in
	 * @param {string} login - username
	 * @param {string} pass - password
	 * @param {string} id - 6-digit district-provided student ID
	 * @param {function} callback - a function to call if the request succeeds
	 * @param {function} on_error  a funciton to call if the request fails
	 */
	get_session: function (login, pass, id, callback, on_error) {
		var jqXHR = $.ajax({
			url: "https://hacaccess.herokuapp.com/api/rrisd/login",
			type: "POST",
			data: {
				login: login.encrypt(),
				password: pass.encrypt(),
				studentid: id.rot13()
			}
		}).done(callback).fail(on_error || default_error_handler);
		XHR_Queue.abortAll().addRequest(jqXHR);
	},

	/**
	 * Retrieves the grades URL from the server
	 * @param {string} id - a valid RRISD HAC session ID
	 * @param {function} callback - a function to call when the request succeeds
	 */
	get_gradesURL: function (id, callback) {
		var jqXHR = $.ajax({
			url: "https://hacaccess.herokuapp.com/api/rrisd/gradesURL",
			type: "POST",
			data: { sessionid: id.rot13() }
		}).done(callback).fail(default_error_handler);
		XHR_Queue.abortAll().addRequest(jqXHR);
	},

	/**
	 * Retrieves grades from RRISD
	 * @param {string} url - the unique student URL that accesses grades
	 * @param {function} callback - a function to call when the request succeeds
	 * @param {function} on_error - a function to call when the request fails
	 */
	get_gradesHTML: function (url, callback, on_error) {
		var jqXHR = $.ajax({
			url: "https://gradebook.roundrockisd.org/pc/displaygrades.aspx?studentid=" + url,
			type: "GET"
			// dataType: "text gjson"
		}).done(callback).fail(on_error || default_error_handler);
		XHR_Queue.abortAll().addRequest(jqXHR);
	},

	/**
	 * Retrieves class grades from RRISD
	 * @param {string} sID - the unique student URL that accesses grades
	 * @param {string} data - the class and marking period identifier
	 * @param {function} callback - a function to call when the request succeeds
	 * @param {function} on_error - a function to call when the request fails
	 */
	get_classGradeHTML: function (sID, data, callback, on_error) {
		var jqXHR = $.ajax({
			url: "https://gradebook.roundrockisd.org/pc/displaygrades.aspx?data=" + data + "&studentid=" + sID,
			type: "GET"
			// dataType: "text cjson",
			// data: {
			// 	"data": data,
			// 	"studentid": sID
			// }
		}).done(function (doc) {
			if (doc == "Could not decode student id.") {
				console.log("Error while fetching class grades (could not decode student ID)");
				on_error(new Error("Unable to decode student ID"));
				return false;
			}
			callback(doc);
		}).fail(on_error || default_error_handler);
		XHR_Queue.abortAll().addRequest(jqXHR);
	}
};

/**
 * Interfaces with the Austin ISD Gradespeed (Home Access Center)
 */
var AISD_HAC = {
	/** The server to sending API calls to */
	host: "https://hacaccess.herokuapp.com/",

	/**
	 * Requests a session ID from Home Access by logging in
	 * @param {string} login - username
	 * @param {string} pass - password
	 * @param {string} id - 6-digit district-provided student ID
	 * @param {function} callback - a function to call if the request succeeds
	 * @param {function} on_error  a funciton to call if the request fails
	 */
	get_session: function (login, pass, id, callback, on_error) {
		var jqXHR = $.ajax({
			url: AISD_HAC.host + "api/aisd/login",
			type: "POST",
			data: {
				login: login.encrypt(),
				password: pass.encrypt(),
				studentid: id.encrypt()
			}
		}).done(callback).fail(on_error || default_error_handler);
		XHR_Queue.abortAll().addRequest(jqXHR);
	},

	/**
	 * Calls a function, ensuring that window.session_id has been set to an
	 * AISD session ID.
	 * @param {function} callback - the function to call once the session
	 * has been loaded
	 */
	load_session: function (callback) {
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
	},

	/**
	 * Retrieves grades from AISD
	 * @param {string} id - a valid AISD session ID
	 * @param {function} callback - a function to call when the request succeeds
	 */
	get_gradesHTML: function (id, studentid, callback) {
		var jqXHR = $.post(AISD_HAC.host + "api/aisd/gradesHTML",
			{ sessionid: id.rot13(), studentid: studentid.rot13() },
			function (data) { callback(data); }
		);
		XHR_Queue.abortAll().addRequest(jqXHR);
	},

	/**
	 * Retrieves class grades from AISD
	 * @param {string} id - a valid AISD session ID
	 * @param {string} studentid - the 7-digit district-assigned student ID
	 * @param {string} data - the class and marking period identifier
	 * @param {function} callback - a function to call when the request succeeds
	 */
	get_classGradeHTML: function (id, studentid, data, callback) {
		var jqXHR = $.post(AISD_HAC.host + "api/aisd/gradesHTML",
			{ sessionid: id.rot13(), studentid: studentid.rot13(), data: data.rot13() },
			function (data) { callback(data); }
		);
		XHR_Queue.abortAll().addRequest(jqXHR);
	}
};

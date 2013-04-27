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

// XHR QUEUE (is this really necessary?)
// I suppose we could just have a global flag
// if a request is currently being made...
// but let's go with the more complex option :P
Queuer = (function () {

	function Queuer() {
		this.queue = [];
	};

	Queuer.prototype.addRequest = function (xhr) {
		this.queue.push(xhr);
		return this;
	};

	Queuer.prototype.abortAll = function () {
		while (this.queue.length) {
			this.queue[0].abort();
			this.queue.splice(0, 1);
		}
		return this;
	};

	return Queuer;
})();

var XHR_Queue = new Queuer();

function default_error_handler(jqXHR, textStatus, errorThrown) {
	console.error(jqXHR, textStatus, errorThrown)
}

// date setting
var Updater = {
	set_updated: function () {
		localStorage.setItem("lastupdated", (new Date()).getTime());
	},
	get_update_text: function () {
		return moment(parseInt(localStorage["lastupdated"])).fromNow();
	}
};

// ads
var Ad = {
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

var RRISD_HAC = {
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

	get_gradesURL: function (id, callback) {
		var jqXHR = $.ajax({
			url: "https://hacaccess.herokuapp.com/api/rrisd/gradesURL",
			type: "POST",
			data: { sessionid: id.rot13() }
		}).done(callback).fail(default_error_handler);
		XHR_Queue.abortAll().addRequest(jqXHR);
	},

	get_gradesHTML: function (url, callback, on_error) {
		var jqXHR = $.ajax({
			url: "https://gradebook.roundrockisd.org/pc/displaygrades.aspx?studentid=" + url,
			type: "GET"
			// dataType: "text gjson"
		}).done(callback).fail(on_error || default_error_handler);
		XHR_Queue.abortAll().addRequest(jqXHR);
	},

	get_classGradeHTML: function (sID, data, callback, on_error) {
		var jqXHR = $.ajax({
			url: "https://gradebook.roundrockisd.org/pc/displaygrades.aspx",
			type: "GET",
			// dataType: "text cjson",
			data: {
				"studentid": sID,
				"data": data
			}
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

var AISD_HAC = {
	host: "https://hacaccess.herokuapp.com/",

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

	get_gradesHTML: function (id, studentid, callback) {
		var jqXHR = $.post(AISD_HAC.host + "api/aisd/gradesHTML",
			{ sessionid: id.rot13(), studentid: studentid.rot13() },
			function (data) { callback(data); }
		);
		XHR_Queue.abortAll().addRequest(jqXHR);
	},

	get_classGradeHTML: function (id, studentid, data, callback) {
		var jqXHR = $.post(AISD_HAC.host + "api/aisd/gradesHTML",
			{ sessionid: id.rot13(), studentid: studentid.rot13(), data: data.rot13() },
			function (data) { callback(data); }
		);
		XHR_Queue.abortAll().addRequest(jqXHR);
	}
};

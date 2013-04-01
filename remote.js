// primitive encryption functions. this'll get 'em!

String.prototype.rot13 = function(){
	return this.replace(/[a-zA-Z]/g, function(c){
		return String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26);
	});
};

String.prototype.b64enc = function() {
	return Base64.encode(this);
};

String.prototype.b64dec = function() {
	return Base64.decode(this);
}

String.prototype.encrypt = function() {
	return this.b64enc().rot13();
};

String.prototype.decrypt = function() {
	return this.rot13().b64dec();
}

// date setting
var Updater =
{
	set_updated: function() {
		localStorage.setItem("lastupdated", (new Date()).getTime());
	},
	get_update_text: function() {
		return moment(parseInt(localStorage["lastupdated"])).fromNow();
	}
}

// working with HACaccess
var HAC =
{
	get_session: function(login, pass, id, callback, on_error) {
		$.ajax({
			url: "https://hacaccess.herokuapp.com/api/login",
			timeout: 15000,
			type: "POST",
			data: {
				login: login.encrypt(),
				password: pass.encrypt(),
				studentid: id.rot13()
			},
			success: callback,
			error: on_error
		});
	},

	get_gradesURL: function(id, callback) {
		$.post("https://hacaccess.herokuapp.com/api/gradesURL",
			{sessionid: id.rot13()},
			function (data) { callback(data); }
		);
	},

	get_gradesHTML: function(id, callback) {
		$.post("https://hacaccess.herokuapp.com/api/gradesHTML",
			{sessionid: id.rot13()},
			function (data) { callback(data); }
		);
	},

	get_gradesHTML_direct: function(url, callback) {
		$.get("https://gradebook.roundrockisd.org/pc/displaygrades.aspx?studentid=" + url,
			function (data) { callback(data); }
		);
	},

	get_classGradeHTML: function(sID, data, callback) {
		$.get("https://gradebook.roundrockisd.org/pc/displaygrades.aspx?studentid=" + sID
			+ "&data=" + data,
			function (data) { callback(data); }
		);
	},

	generate_ad: function() {
		var wrapper = document.createElement("div");
		$(wrapper).attr("id", "ad_wrapper");

		// workaround for scrolling
		if ((window.navigator.appVersion.indexOf("OS X 10_8") != -1) && (localStorage["ad_2"] != "no")) {
			var wrapper = document.createElement("div");
			$(wrapper).attr("id", "ad_wrapper");

			var ad = document.createElement("a");
			$(ad).attr("id", "ad")
				.click(function(){chrome.tabs.create({"url": "https://hacaccess.herokuapp.com/qhac/ml-fix"})})
				.html("Using Mountain Lion? Scrolling might not work. Here's a fix. &raquo;");
			$(wrapper).append(ad);

			var hideAd = document.createElement("a");
			$(hideAd).attr("id", "hide_ad").attr("href", "#")
				.html("&times;").click(function() {
					// _gaq.push(['_trackEvent', '...', 'Hide Link']);
					$("#ad_wrapper").remove();
					localStorage.setItem("ad_2", "no");
				});
			$(wrapper).append(hideAd);

			return wrapper;
		}

		if (localStorage["ad_1"] == "no")
			return document.createDocumentFragment();

		var ad = document.createElement("span");
		$(ad).attr("id", "ad")
			.html("New in 1.2: Edit grades locally. Click on any assignment grade to get started!");
		$(wrapper).append(ad);

		var hideAd = document.createElement("a");
		$(hideAd).attr("id", "hide_ad").attr("href", "#")
			.html("&times;").click(function() {
				// _gaq.push(['_trackEvent', '...', 'Hide Link']);
				$("#ad_wrapper").remove();
				localStorage.setItem("ad_1", "no");
			});
		$(wrapper).append(hideAd);

		return wrapper;

		// return document.createDocumentFragment();
	}
}



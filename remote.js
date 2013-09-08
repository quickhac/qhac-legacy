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
		return HAC.generate_ad_inner(
			"Download QuickHAC 2 from the Chrome Web Store &raquo;",
			"https://chrome.google.com/webstore/detail/quickhac/dnboopdmbbpaicaphfkcphonijbfhopg",
			"4");
	},

	generate_ad_inner: function(text, url, id) {
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
				.click(function() {
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
			.html("&times;").click(function() {
				var label = $(this).data("label");
				if (label != "")
					_gaq.push(['_trackEvent', 'Ad', 'Hide ' + label]);
				$("#ad_wrapper").remove();
				localStorage.setItem("ad_" + label, "no");
			});
		wrapper.appendChild(hideAd);

		return wrapper;
	}
}



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
			error: on_error,
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
	}
}

// parsing and creating DOMs
var HAC_HTML =
{
	html_to_jso: function(html) {
		myObj = [];
		rows = $("tr.DataRow, tr.DataRowAlt", html);

		// each row
		for (var r = 0; r < rows.length; r++) {
			var title, grades, cells, grade;
			cells = $(rows[r]).children("td");
			title = $(cells[0]).html();
			grades = [];
			urls = [];

			// each cell
			for (var i = 0; i < 10; i++) {
				grade = $(cells[i + 2]).html();
				if (grade.indexOf("<") != -1) {
					if (grade.indexOf("<a href") != -1)
						urls[i] = /\?data=([\w\d%]*)"/g.exec(grade)[1];
					grade = />([\w\d]*)</g.exec(grade)[1];
				} else {
					if (grade = "&nbsp;") {
						grade = "";
					}
				}

				grades[i] = grade;
				urls[i] = (urls[i] == undefined ? "" : urls[i]);
			}

			myObj[myObj.length] = {
				title: title,
				grades: grades,
				urls: urls
			};
		}

		return myObj;
	},

	json_to_html: function(json) {
		var root = document.createElement("table");

		// header row
		var header = document.createElement("tr");
		["Course", "Cycle 1", "Cycle 2", "Cycle 3", "Exam 1", "Semester 1", "Cycle 4", "Cycle 5", "Cycle 6", "Exam 2", "Semester 2"].forEach(function(e,i) {
			var cell = document.createElement("th");
			cell.textContent = e;
			$(cell).addClass("gradeHeader");

			$(header).append(cell);
		});
		$(root).append(header);

		// each row
		for (var r = 0; r < json.length; r++) {
			var row = document.createElement("tr");

			// title cell
			var title = document.createElement("td");
			title.textContent = json[r].title;
			$(title).addClass("classTitle");
			$(row).append(title);

			// each grade cell
			for (var c = 0; c < 10; c++) {
				var cell = document.createElement("td");
				if (json[r].urls[c] == "")
					cell.textContent = json[r].grades[c];
				else {
					// create a link
					var innerCell = document.createElement("a");
					innerCell.textContent = json[r].grades[c];
					$(innerCell).attr("href", "#").data("data", json[r].urls[c])
						.click(function() { loadClassGrades($(this).data("data")); });

					$(cell).append(innerCell);
				}

				var classes = "grade";
				if ((c == 3) || (c == 8)) classes += " exam";
				else if ((c == 4) || (c == 9)) classes += " semester";
				$(cell).addClass(classes);
				var color = HAC_HTML.colorize(parseInt(json[r].grades[c]));
				$(cell).css({"backgroundColor": color, "box-shadow": "0px 0px 4px " + color});

				$(row).append(cell);
			}

			$(root).append(row);
		}

		return root;
	},

	colorize: function(grade) {
		// color is only for numerical grades
		if (isNaN(parseInt(grade))) return "#FFF";

		// interpolate a hue gradient and convert to rgb
		var h, s, v, r, g, b;

		// determine color. ***MAGIC DO NOT TOUCH UNDER ANY CIRCUMSTANCES***
		h = Math.min(0.25 * Math.pow(grade / 100, asianness), 0.13056);
		s = 1 - Math.pow(grade / 100, asianness * 2);
		v = 0.86944 + h;

		// convert to rgb: http://goo.gl/J9ra3
		var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch(i % 6){
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    return "rgb(" + parseInt(r * 255) + "," + parseInt(g * 255) + "," + parseInt(b * 255) + ")";
	},

	compare_grades: function(oldgrade, newgrade, on_notify) {
		var labels = ["Cycle 1", "Cycle 2", "Cycle 3", "Exam 1", "Semester 1", "Cycle 4", "Cycle 5", "Cycle 6", "Exam 2", "Semester 2"];
		for (var r = 0; r < Math.min(oldgrade.length, newgrade.length); r++) {
			for (var c = 0; c < 10; c++) {
				if (oldgrade[r].grades[c] != newgrade[r].grades[c]) {
					HAC_HTML._notify(newgrade[r].title, labels[c], oldgrade[r].grades[c], newgrade[r].grades[c]);
					if (typeof on_notify === "function") on_notify();
				}
			}
		}
	},

	_notify: function(className, label, oldgrade, newgrade) {
		var text;
		if ((oldgrade == undefined) || (oldgrade == "")) text = "is now";
		else if (newgrade > oldgrade) text = "rose to";
		else text = "fell to";

		var notif = webkitNotifications.createNotification(
			"icon.png",
			className + " grade for " + label,
			"Your grade " + text + " " + newgrade + ".");

		notif.show();
	}
};
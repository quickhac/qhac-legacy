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
		// if (localStorage["ad_0"] == "no")
		// 	return document.createDocumentFragment();

		// var wrapper = document.createElement("div");
		// $(wrapper).attr("id", "ad_wrapper");;

		// var ad = document.createElement("a");
		// $(ad).attr("id", "ad").attr("href", "https://hacaccess.herokuapp.com/wworch")
		// 	.html("We need your help! &raquo;").click(function() {
		// 		_gaq.push(['_trackEvent', 'TMEA Booster', 'Helper Link']);
		// 		chrome.tabs.create({'url': 'https://hacaccess.herokuapp.com/wworch'});
		// 	});
		// $(wrapper).append(ad);

		// var hideAd = document.createElement("a");
		// $(hideAd).attr("id", "hide_ad").attr("href", "#")
		// 	.html("&times;").click(function() {
		// 		_gaq.push(['_trackEvent', 'TMEA Booster', 'Hide Link']);
		// 		$("#ad_wrapper").remove();
		// 		localStorage.setItem("ad_0", "no");
		// 	});
		// $(wrapper).append(hideAd);

		// return wrapper;

		return document.createDocumentFragment();
	}
}

// parsing and creating DOMs
var HAC_HTML =
{
	html_to_jso: function(html) {
		myObj = [];
		rows = $(".DataTable:first tr.DataRow, .DataTable:first tr.DataRowAlt", html);

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

		// more root
		var superRoot = document.createDocumentFragment();
		$(superRoot).append(root);

		// and an ad
		$(superRoot).append(HAC.generate_ad());

		return superRoot;
	},

	cgrades_to_json: function(html) {
			var myObj = {
				"title": $("h3.ClassName", html).text(),
				"currAvg": /Current Average: (\d*)/.exec($("p.CurrentAverage", html).text())[1],
				"cats": []
			};

			var categoryPattern = /^(.*) - (\d*)%$/;

			var categories = $(".CategoryName", html);
			var gradeTables = $("table.DataTable", html);
			gradeTables.splice(0, 1);

			// in caes of array length mismatch, ignore unmatched array elements
			var len = Math.min(categories.length, gradeTables.length);

			// for each grade category
			for (var i = 0; i < len; i++) {
				var captures = categoryPattern.exec(categories[i].innerText);

				// category name
				myObj.cats[i] = {"title": captures[1], "percent": parseInt(captures[2])};

				// grades
				myObj.cats[i].grades = [];
				var gradeList = $(gradeTables[i]).find("tr.DataRow, tr.DataRowAlt");
				for (var j = 0; j < gradeList.length; j++) {
					// get data
					var title         = $(gradeList[j]).children(".AssignmentName").text();
					var dueDateElem   = $(gradeList[j]).children(".DateDue");
					var dueDate       = dueDateElem.text();
					var noteElem      = $(gradeList[j]).children(".AssignmentNote");
					var note          = noteElem.text();
					var ptsEarnedElem = $(gradeList[j]).children(".AssignmentGrade");
					var ptsEarned     = parseInt(ptsEarnedElem.text());
					var ptsPossElem   = $(gradeList[j]).children(".AssignmentPointsPossible");
					if (ptsPossElem.length == 0)
						ptsPoss = 100;
					else
						ptsPoss = parseInt(ptsPossElem.text());

					myObj.cats[i].grades[j] = {
						"title": title,
						"dueDate": dueDate,
						"note": note,
						"ptsEarned": ptsEarned,
						"ptsPoss": ptsPoss
					};
				}

				// category average
				myObj.cats[i].average = parseInt(
					$(gradeTables[i]).find("tr").last().children("td")[3].innerText);

				// 100 point scale?
				myObj.cats[i].is100Pt = (myObj.cats[i].grades.length == 0 ? true :
					myObj.cats[i].grades[0].ptsPoss == 100);
			}

			return myObj;
	},

	cjson_to_html: function(json) {
		var root = document.createDocumentFragment();

		var title = document.createElement("h3");
		$(title).addClass("ClassName").text(json.title);
		$(root).append(title);

		var currAvg = document.createElement("p");
		$(currAvg).addClass("CurrentAverage").text(json.currAvg);
		$(root).append(currAvg);

		for (var i = 0; i < json.cats.length; i++) {
			var catHeader = document.createElement("span");
			$(catHeader).text(json.cats[i].title + " - " + json.cats[i].percent);
			$(root).append(catHeader);

			var catTable = document.createElement("table");

			var catTableHeader = document.createElement("thead");
			var catTableHeaderRow = document.createElement("tr");
			$(catTableHeader).append(catTableHeaderRow);
			$(catTable).append(catTableHeader);

			// TODO: headers

			var catTableBody = document.createElement("tbody");
			$(catTable).addClass("DataTable").append(catTableBody);
			for (var j = 0; j < json.cats[i].grades.length; j++) {
				var gradeRow = document.createElement("tr");

				var gradeTitle = document.createElement("td");
				$(gradeTitle).addClass("AssignmentName").text(json.cats[i].grades[j].title);
				$(gradeRow).append(gradeTitle);

				var dueDate = document.createElement("td");
				$(dueDate).addClass("DateDue").text(json.cats[i].grades[j].dueDate);
				$(gradeRow).append(dueDate);

				var ptsEarned = document.createElement("td");
				$(ptsEarned).addClass("AssignmentGrade").text(json.cats[i].grades[j].ptsEarned);
				$(gradeRow).append(ptsEarned);

				if (!json.cats[i].is100Pt) {
					var ptsPoss = document.createElement("td");
					$(ptsPoss).addClass("AssignmentPointsPossible").text(json.cats[i].grades[j].ptsPoss);
					$(gradeRow).append(ptsPoss);
				}

				var note = document.createElement("td");
				$(note).addClass("AssignmentNote").text(json.cats[i].grades[j].note);
				$(gradeRow).append(note);

				$(catTableBody).append(gradeRow);
			}

			// TODO: average

			$(root).append(catTable);
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
		var labels = [
			"Cycle 1", "Cycle 2", "Cycle 3", "Exam 1", "Semester 1",
			"Cycle 4", "Cycle 5", "Cycle 6", "Exam 2", "Semester 2"
		];
		var gradesToNotify = [], notif;
		
		for (var r = 0, l = Math.min(oldgrade.length, newgrade.length); r < l; r++) {
			// If class is not the same as before, skip row
			if (oldgrade[r].title != newgrade[r].title) continue;
			// Collect all new grades to be notified
			for (var c = 0; c < 10; c++) {
				// skip semester averages
				if ((c != 4) && (c != 9))
					// notify if changed
					if (oldgrade[r].grades[c] != newgrade[r].grades[c])
						gradesToNotify.push({
							title: newgrade[r].title,
							label: labels[c],
							oldgrade: parseInt(oldgrade[r].grades[c]),
							newgrade: parseInt(newgrade[r].grades[c])
						});
			}
		}
		
		// Call notification for each grade update
		for (var n = gradesToNotify.length-1; n >=0; n--) {
			notif = HAC_HTML.makeUpdateText(gradesToNotify[n]);
			HAC_HTML._notify2(notif.title, notif.text);
			if (typeof on_notify === "function") on_notify.call();
		}
	},

	makeUpdateText: function (gradeData) {
		var text, is_new, fromText,
			className = gradeData.title,
			label = gradeData.label,
			oldgrade = gradeData.oldgrade,
			newgrade = gradeData.newgrade;
		
		is_new = oldgrade == undefined || isNaN(oldgrade) || oldgrade == "";
		
		fromText = is_new ? "" : " from " + oldgrade.toString(10);
		
		if (is_new) text = "is now";
		else if (newgrade > oldgrade) text = "rose to";
		else if (newgrade < oldgrade) text = "fell to";
		else if (newgrade == oldgrade) text = "is still";
		else {
			text = "???";
			console.error("What happen?");
			console.log(oldgrade, newgrade);
		}
		
		return {
			title: className + " grade for " + label,
			text: "Your grade " + text + " " + newgrade.toString(10) + fromText
		};
	},

	_notify2: function(titleText, updateText) {
		webkitNotifications.createNotification("assets/icon-full.png", titleText, updateText).show();
	},

	_notify: function(className, label, oldgrade, newgrade) {
		var text;
		if ((oldgrade == undefined) || (oldgrade == "") || (isNaN(oldgrade))) text = "is now";
		else if (newgrade > oldgrade) text = "rose to";
		else text = "fell to";

		var notif = webkitNotifications.createNotification(
			"icon.png",
			className + " grade for " + label,
			"Your grade " + text + " " + newgrade + ".");

		notif.show();
	}
};

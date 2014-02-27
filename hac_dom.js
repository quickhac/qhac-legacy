/**
 * @type {number}
 * @const
 */
var DEFAULT_ASIANNESS = 4;

/**
 * @type {number}
 * @const
 */
var DEFAULT_R_INT = 60;

/**
 * @type {number}
 * @const
 */
var DEFAULT_HUE = 0;

/**
 * @type {number}
 * @const
 */
var DEFAULT_NOTIF_DURATION = 5;

/**
 * @type {regex}
 * @const
 */
var EXTRA_CREDIT_REGEX = /^extra credit$|^ec$/i;
var EXTRA_CREDIT_NOTE_REGEX = /extra credit/i;

/**
 * Converts different kind of grade lists between HTML documents, JSON objects,
 * and DOMs
 * @namespace
 */
var HAC_HTML =
{
	/**
	 * Converts a server response for marking period grades into JSON
	 * @param {string} html - the HTML document to parse
	 * @returns {JSON} the grades extracted from the document
	 */
	html_to_jso: function (html, is_qhac_html) {
		var myObj = [];
		var context = $.parseHTML(html);
		$rows = $(".DataTable:first tr.DataRow, .DataTable:first tr.DataRowAlt", context);

		// hard-coded offsets
		var titleOffset, gradesOffset, gradesRowOffset;
		if (is_qhac_html) {
			titleOffset = 0; gradesOffset = 1, gradesRowOffset = 0;
		}
		else if (localStorage["district"] == "rrisd") {
			titleOffset = 0; gradesOffset = 2, gradesRowOffset = 0;
		} else if (localStorage["district"] == "aisd") {
			titleOffset = 1; gradesOffset = 3, gradesRowOffset = 1;
		}

		// each row
		for (var r = gradesColOffset; r < $rows.length; r++) {
			var title, grades, $cells, grade;
			$cells = $rows.eq(r).children("td");
			title = $cells.eq(titleOffset).html();
			grades = [];
			urls = [];

			// each cell
			for (var i = 0; i < 10; i++) {
				if (i == 4 || i == 9) {
					var earned = 0, weight = 0,
						weightPerSixWeeks = 85 / 300,
						examWeight;
					if (localStorage["district"] == "rrisd") {
						weightPerSixWeeks = 85 / 300;
						examWeight = 0.15;
					} else {
						weightPerSixWeeks = 0.25;
						examWeight = 0.25;
					}
					// calculate semester average (issue #45)
					// TODO: use same calculations as the grade edit finaliser
					for (var j = i - 4; j < i - 1; j++) {
						if (grades[j] != "" && !isNaN(grades[j])) {
							earned += parseInt(grades[j]) * weightPerSixWeeks;
							weight += weightPerSixWeeks;
						}
					}
					// add exam grade
					if (grades[i-1] != "" && !isNaN(grades[i-1])){
						earned += parseInt(grades[i-1]) * examWeight;
						weight += examWeight;
					}
					// calculate
					var semesterGrade = earned / weight;
					if (!isNaN(semesterGrade))
						grade = isNaN(semesterGrade) ? "" : Math.round(Math.round(semesterGrade * 10000) / 10000);
				} else {
					grade = $cells.eq(i + gradesOffset).html();
					if (grade.indexOf("<") != -1) {
						if (grade.indexOf("<a href") != -1)
							if (is_qhac_html)
								urls[i] = $cells.eq(i + gradesOffset).children().eq(0).data("data");
							else
								urls[i] = /\?data=([\w\d%]*)"/g.exec(grade)[1];
						grade = />([\w\d]*)</g.exec(grade)[1];
					} else {
						if (grade = "&nbsp;")
							grade = "";
						if (is_qhac_html)
							grade = $cells.eq(i + gradesOffset).html();
					}
				}

				grades[i] = grade;
				urls[i] = (typeof urls[i] == "undefined" ? "" : urls[i]);
			}

			myObj[myObj.length] = {
				title: title,
				grades: grades,
				urls: urls
			};
		}

		return myObj;
	},

	/*
	 * Converts marking period grades JSON to a DOM node
	 * @param {JSON} json - the JSON to parse
	 * @returns {Element} an HTML element with the grades in a table
	 */
	json_to_html: function (json) {
		var root = document.createElement("table");
		$(root).addClass("DataTable");

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
			$(row).addClass("DataRow");

			// title cell
			var title = document.createElement("td");
			$(title).addClass("classTitle").html(json[r].title);
			$(row).append(title);

			// each grade cell
			for (var c = 0; c < 10; c++) {
				var cell = document.createElement("td");
				if (json[r].urls[c] == "")
					$(cell).text(json[r].grades[c]);
				else {
					// create a link
					var innerCell = document.createElement("a");
					$(innerCell).text(json[r].grades[c]).attr("href", "#").data("data", json[r].urls[c])
						.click(function() { loadClassGrades($(this).data("data")); });

					$(cell).append(innerCell);
				}

				// add classes
				var classes = "grade";
				if ((c == 3) || (c == 8)) {
					classes += " exam";

					// allow edit of exam grades directly
					var cellText = $(cell).text();
					$(cell).data("orig", cellText)
					.attr("title", "Original grade: " +
						(isNaN(cellText) && (cellText != "EX")
							&& (cellText != "Exc") && (cellText != "NA") || (cellText == "")
							? "none" : cellText))
					.data("editing", "0")
					.click(function () {
						if ($(this).data("editing") == "0") {
							var $el = $(this);
							var i = $el.index();
							var row_i = $el.parent().index();
							var wrap = $el.parent().parent().children().length;
							var nextRow_i = (row_i+1) >= wrap ? 1 : row_i + 1;
							var prevRow_i = (row_i-1) < 1 ? wrap - 1: row_i - 1;
							var $nextRow = $el.parent().parent().children().eq(nextRow_i);
							var $prevRow = $el.parent().parent().children().eq(prevRow_i);

							var editor = document.createElement("input");
							var kphandler = function(e) {
								switch (e.keyCode || e.which) {
									case 13: HAC_HTML._finalize_exam_grade_edit(this); break;
									case 9: HAC_HTML._finalize_exam_grade_edit(this);
										// edit next grade (fire click event)
										if (e.shiftKey) {
											// edit previous grade
											$prevRow.children().eq(i).click();
										} else {
											//edit next grade
											$nextRow.children().eq(i).click();
										}
										e.preventDefault();
										break;
									default: break;
								}
							};

							$(editor).attr("size", "2").val(this.innerText).keydown(kphandler).keypress(kphandler)
								.blur(function () {HAC_HTML._finalize_exam_grade_edit(this);})
								.addClass("GradeEditor");
							$(this).html("").append(editor).data("editing", "1").tipsy("show")
								.children().focus().select();
						}})
					.tipsy({gravity: $.fn.tipsy.autoNS, trigger: 'manual', fade: true, opacity: 1});
				}
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

	/*
	 * Converts a server response for class grades into JSON
	 * @param {string} html - the HTML document to parse
	 * @returns {JSON} the grades extracted from the document
	 */
	cgrades_to_json: function (html) {
		var context = $.parseHTML(html);

		// sanity checking
		if ($("table.DataTable", context).length == 0)
			return {};

		var myObj = {
			"title": $("h3.ClassName", context).text(),
			"currAvg": /Current Average: (\d*)/.exec($("p.CurrentAverage", context).text())[1],
			"cats": []
		};

		var categoryPattern = /^(.*) - (\d*)%$/;
		var isPercentWeight = true;

		var categories = $(".CategoryName", context);
		var gradeTables = $("table.DataTable", context);
		gradeTables.splice(0, 1);

		// in caes of array length mismatch, ignore unmatched array elements
		var len = Math.min(categories.length, gradeTables.length);

		// for each grade category
		for (var i = 0; i < len; i++) {
			var captures = categoryPattern.exec(categories[i].innerText);
			
			// Failed to capture any categories
			// Could be a Grisham student or an error...
			if (captures == null) {
				// console.log("switching to IB-MYP grading (grade counts n times toward average)");
				var categoryPattern2 = /^(.*) - Each assignment counts (\d+)/;
				isPercentWeight = false;
				captures = categoryPattern2.exec(categories[i].innerText);

				if (captures == null) {
					console.log("unable to capture any categories, exiting...");
					return;
				}
			}
			myObj.cats[i] = {
				"title": captures[1],
				"is_percent_weight": isPercentWeight,
				"weight": parseInt(captures[2]) / (isPercentWeight ? 100 : 1),
				"grades": []
			};
			// grades
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

	/*
	 * Converts a class grades JSON to a DOM element
	 * @param {JSON} json - the JSON to parse
	 * @returns {Element} an HTML element with the grades in a table
	 */
	cjson_to_html: function (json) {
		var root = document.createDocumentFragment();

		var title = document.createElement("h3");
		var spinner = document.createElement("div");
		$(spinner).addClass("spinner").css("margin-left", "8px");
		$(title).addClass("ClassName").html(json.title).append(spinner);
		$(root).append(title);

		var currAvg = document.createElement("p");
		$(currAvg).addClass("CurrentAverage").text("Current Average: ")
			.append($(document.createElement("span")).text(json.currAvg)
				.css('background', HAC_HTML.colorize(parseInt(json.currAvg))));
		$(root).append(currAvg);

		for (var i = 0; i < json.cats.length; i++) {
			var percentiles = []; // for the category
			var total = 0; // for non-100-point scales

			// create the category header

			var catHeader = document.createElement("span");
			var categoryWeighting, n;
			if (json.cats[i].is_percent_weight) {
				categoryWeighting = (100 * json.cats[i].weight) + "%";
			} else {
				// IB-MVP grading (Grisham)
				n = json.cats[i].weight;
				switch (n) {
					// case 0: numberOfTimes = "doesn't count"; break;
					// case 1: numberOfTimes = "counts once"; break;
					// case 2: numberOfTimes = "counts twice"; break;
					// default: numberOfTimes = "counts " + n + " times";
					case 1: numberOfTimes = "1 time"; break;
					default: numberOfTimes = n + " times";
				}
				categoryWeighting = "Assignments count " + numberOfTimes;
			}
			$(catHeader).addClass("CategoryName").text(json.cats[i].title + " - " + categoryWeighting);
			$(root).append(catHeader);
			$(root).append(document.createElement("br"));

			// create the category table

			var catTable = document.createElement("table");

			var catTableHeader = document.createElement("thead");
			var catTableHeaderRow = document.createElement("tr");
			$(catTableHeaderRow).addClass("TableHeader");
			$(catTableHeader).append(catTableHeaderRow);
			$(catTable).append(catTableHeader);

			var headerCells = [];
			var numHeaders = 4 + (json.cats[i].is100Pt ? 0 : 1);
			for (var j = 0; j < numHeaders; j++)
				headerCells[j] = document.createElement("th");

			headerCells[0].innerHTML = "Assignment";
			headerCells[1].innerHTML = "Due";
			headerCells[2].innerHTML = "Grade";
			if (numHeaders == 4)
				headerCells[3].innerHTML = "Note";
			else {
				headerCells[3].innerHTML = "Possible";
				headerCells[4].innerHTML = "Note";
			}

			$(catTableHeaderRow).append(headerCells);

			var catTableBody = document.createElement("tbody");
			$(catTable).addClass("DataTable").append(catTableBody)
				// add weight
				.data({
						"weight": json.cats[i].weight,
						"is_percent_weight": json.cats[i].is_percent_weight
				});

			// each grade
			for (var j = 0; j < json.cats[i].grades.length; j++) {
				var gradeRow = document.createElement("tr");
				$(gradeRow).addClass("DataRow");

				var gradeTitle = document.createElement("td");
				$(gradeTitle).addClass("AssignmentName").text(json.cats[i].grades[j].title);
				$(gradeRow).append(gradeTitle);

				var dueDate = document.createElement("td");
				$(dueDate).addClass("DateDue").text(json.cats[i].grades[j].dueDate);
				$(gradeRow).append(dueDate);

				var ptsEarned = document.createElement("td");
				var pts = json.cats[i].grades[j].ptsEarned;
				var ptsIsNaN = isNaN(pts) || pts == null;
				if (ptsIsNaN)
					json.cats[i].grades[j].ptsEarned = NaN;
				var is_extra_credit = EXTRA_CREDIT_REGEX.test(json.cats[i].grades[j].title)
				                   || EXTRA_CREDIT_NOTE_REGEX.test(json.cats[i].grades[j].note);
				var grade_to_color = is_extra_credit ? 100 + pts : pts * 100 / json.cats[i].grades[j].ptsPoss;
				$(ptsEarned).addClass("AssignmentGrade")
					.text(ptsIsNaN ? "" : pts).data("editing", "0")
					.css('background', ptsIsNaN ? "#FFF" : HAC_HTML.colorize(grade_to_color))
					.data({
						"orig": ptsIsNaN ? "" : pts
					})
					.attr("title", "Original grade: " + (ptsIsNaN ? "none" : pts))
					// allow editing
					.click(function() {
						var $el = $(this);
						var i = $el.index();
						var row_i = $el.parent().index();

						// $el.parent().parent().nextUntil(".AssignmentCreator").last().next().children(".AssignmentGrade").children().blur();
						// $(".NewAssignment:empty").last().remove();
						// var len = $el.parent().parent().children().length;

						var $table = $el.parent().parent().parent();
						// var $prevTable = $table.prevUntil(".DataTable").last().prev();

						var $nextRow = $table.children("tbody").children(".DataRow").eq(row_i + 1);
						var $prevRow = $table.children("tbody").children(".DataRow").eq(row_i - 1);

						// var $prevRow = row_i-1 < 0 ?
						// 	$prevTable.children("tbody").children(".DataRow").last()
						// 	: $table.children("tbody").children(".DataRow").eq(row_i - 1);

						// var nextIsCreator = $nextRow.hasClass("AssignmentCreator");
						// var prevIsCreator = $prevRow.hasClass("AssignmentCreator");
						
						// var $nextGrade = $nextRow.children().eq(nextIsCreator ? 0 : i);
						// var $prevGrade = $prevRow.children().eq(prevIsCreator ? 0 : i);
						var $nextGrade = $nextRow.children().eq(i);
						var $prevGrade = $prevRow.children().eq(i);

						if ($(this).data("editing") == "0") {
							var editor = document.createElement("input");
							var kphandler = function (e) {

								switch (e.keyCode || e.which) {
									case 13: HAC_HTML._finalize_grade_edit(this); break;
									case 9: HAC_HTML._finalize_grade_edit(this);
										if (e.shiftKey) {
											// edit previous grade
											$prevGrade.click();
										} else {
											//edit next grade
											$nextGrade.click();
										}
										e.preventDefault();
										break;
									default: break;
								}
							};

							$(editor).attr("size", "2").val(this.innerText).keydown(kphandler).keypress(kphandler)
								.blur(function() {HAC_HTML._finalize_grade_edit(this);})
								.addClass("GradeEditor");
							$(this).html("").append(editor).data("editing", "1").tipsy("show")
								.children().focus().select();
						}})
					.tipsy({gravity: 'e', trigger: 'manual', fade: true, opacity: 1});
				$(gradeRow).append(ptsEarned);

				// non-100pt scales
				if (!json.cats[i].is100Pt) {
					var ptsPoss = document.createElement("td");
					$(ptsPoss).addClass("AssignmentPointsPossible").text(json.cats[i].grades[j].ptsPoss);
					$(gradeRow).append(ptsPoss);
				}

				var note = document.createElement("td");
				$(note).addClass("AssignmentNote").text(json.cats[i].grades[j].note);
				$(gradeRow).append(note);

				$(catTableBody).append(gradeRow);

				// calculate category average
				if (!ptsIsNaN && json.cats[i].grades[j].note.indexOf("Dropped") == -1
					&& EXTRA_CREDIT_REGEX.test(json.cats[i].grades[j].title) == false
					&& EXTRA_CREDIT_NOTE_REGEX.test(json.cats[i].grades[j].note) == false)
					if (json.cats[i].is100Pt)
						percentiles.push(json.cats[i].grades[j].ptsEarned / json.cats[i].grades[j].ptsPoss);
					else {
						percentiles.push(json.cats[i].grades[j].ptsEarned);
						total += json.cats[i].grades[j].ptsPoss;
					}
			}

			// add a row that allows user to add and edit a new assignment
			var addAssignmentRow = document.createElement("tr");
			var removeIfEmptyRow = function (el) {
				el.find(".AssignmentGrade:empty")
					// console.log("removing", el[0], el.find(".AssignmentGrade")[0]);
					.tipsy("hide")
					.parent().remove();
			};
			var createGradeEditor = function () {
				return $(document.createElement("input"))
					.attr("size", "2")
					.keypress(function (e) {
						if ((e.keyCode || e.which) == 13) {
							var row = $(this).parent().parent();
							HAC_HTML._finalize_grade_edit(this);
							removeIfEmptyRow(row);
						}
					})
					// .keydown(function (e) {
					// 	// This is for tab navigation.
					// 	if ((e.keyCode || e.which) == 9) {
					// 		// GREAT-GREAT-GRANDPARENTS AWW YEAH
					// 		var $table = $(this).parent().parent().parent().parent();
					// 		var $row = $(this).parent().parent();
					// 		var len = $row.siblings(".DataRow").andSelf().length;
					// 		if (e.shiftKey) {
					// 			var $prevTableRow = $table.prevUntil(".DataTable").last().prev().children("tbody").children(".DataRow").last();
					// 			var isNotFirstRow = $row.index() > 0;
					// 			var $prevRow = isNotFirstRow ? $row.prev() : $prevTableRow;
					// 			var $prevGrade = $prevRow.children().eq($prevRow.hasClass("AssignmentCreator") ? 0 : 2);
					// 			$prevGrade.click();

					// 		} else {
					// 			var $nextTable = $table.nextUntil(".DataTable").last().next();
					// 			var $nextTableRow = $nextTable.children("tbody").children().first(".DataRow");
					// 			var isNotLastRow = $row.index() < len - 1;
					// 			var $nextRow = isNotLastRow ? $row.next() : $nextTableRow;
					// 			var $nextGrade = $nextRow.children().eq($nextRow.hasClass("AssignmentCreator") ? 0 : 2);
					// 			$nextGrade.click();
					// 		}
					// 		event.preventDefault();
					// 	}
					// })
					.blur(function () {
						var row = $(this).parent().parent();
						removeIfEmptyRow(row);
						HAC_HTML._finalize_grade_edit(this);
					})
					.addClass("GradeEditor");
			};

			// the next 60 or so lines are one jQuery daisy chain :O
			$(addAssignmentRow).addClass("DataRow AssignmentCreator")
			.append( // cell 0
				$(document.createElement("td")).addClass("AssignmentName")
					.text("+ New Assignment")
					.click(function () { // handler to create new assignment
						$(this).parent()
							.before(
								$(document.createElement("tr"))
									.addClass("DataRow NewAssignment")
									.append(
										$(document.createElement("td")).addClass("AssignmentName")
											.text("New Assignment"))
									.append(
										$(document.createElement("td")).addClass("DateDue")
											.text(""))
									.append(
										$(document.createElement("td")).addClass("AssignmentGrade")
											.data("editing", "1")
											.data("orig", "")
											.attr("title", "User-created assignment")
											.append(createGradeEditor())
											.click(function () { // the new assignment should act like any other
												if ($(this).data("editing") == "0") {
														var editor = createGradeEditor().val(this.innerText);
														$(this).html("").append(editor).data("editing", "1")
															.tipsy("show").children().focus().select();
													}
											})
											.blur(function () {
												$(this).tipsy("hide");
											})
											.tipsy({gravity: 'e', trigger: 'manual', fade: true, opacity: 1}))
									.append(
										$(document.createElement("td")).text(""))
									.append(
										$(this).parent().parent().siblings().eq(0).children(0).children().length == 5 ?
										$(document.createElement("td")).text("") : // if the category is not out of 100 points,
										document.createDocumentFragment()          // we must add another empty data cell
										))
							.prev().find(".GradeEditor").focus().select();
					}))
			.append( // cell 1
				$(document.createElement("td")).text(""))
			.append( // cell 2
				$(document.createElement("td")).text(""))
			.append( // cell 3
				$(document.createElement("td")).text(""))
			.append( // cell 4
				json.cats[i].is100Pt ?
					document.createDocumentFragment() :
					$(document.createElement("td")).text(""))
			.appendTo(catTableBody);

			// calculate and display category average

			var $avgRow = $(document.createElement("tr"))
				.addClass("CategoryAverageRow");

			var $avgLabel = $(document.createElement("td"));
			$avgLabel.attr('colspan', 2)
				.html("Average")
				.appendTo($avgRow);

			var $avgCell = $(document.createElement("td"));
			var avg = (percentiles.length == 0 ? NaN :
				percentiles.reduce(function (a,b) {
						return (isNaN(a) ? 0 : a) + (isNaN(b) ? 0 : b);
					}) * 100 /
					(json.cats[i].is100Pt ? percentiles.length : total));
			$avgCell.css('background', HAC_HTML.colorize(avg))
				.html(isNaN(avg) ? "" : Math.round(avg * 100) / 100)
				.addClass("CategoryAverage")
				.appendTo($avgRow);

			$(catTableBody).append($avgRow);

			$(root).append(catTable);
		}

		return root;
	},

	/**
	 * Performs all the actions necessary after a grade editor changes the value
	 * of a grade
	 * @param {Element} el - the element that fired this event
	 */
	_finalize_grade_edit: function (el) {
		var ptsPoss, ptsPossElem, grade, gradeText, assignmentNameElem, assignmentNoteElem;

		// hide tipsy
		$(el).parent().tipsy("hide");

		// calculate grade
		if ((ptsPossElem = $(el).parent().parent()
				.children(".AssignmentPointsPossible")).length == 0)
			ptsPoss = 100;
		else
			ptsPoss = parseInt(ptsPossElem.text());
		grade = parseFloat($(el).val()) * 100 / ptsPoss;
		gradeText = parseFloat($(el).val());
		if (isNaN(gradeText)) gradeText = "";

		// show/hide edited notice
		var note = $(el).parent().next();
		if (ptsPossElem.length != 0)
			note = note.next();
		if ($(el).parent().data("orig") != $(el).val()) {
			if (note.text().indexOf("(User-edited)") == -1) {
				if (note.text().substr(note.text().length - 1) == " ")
					note.text(note.text() + "(User-edited)");
				else
					note.text(note.text() + " (User-edited)");
			}

			$(el).parent().addClass("edited");
		} else {
			var matches = note.text().match(/^(.*) \(User-edited\)$/);
			if (matches != null && matches.length > 1)
				note.text(matches[1]);

			$(el).parent().removeClass("edited");
		}

		// re-render grade cell
		var $cell = $(el).parent();
		var assignmentNameElem = $cell.siblings(".AssignmentName");
		var assignmentNoteElem = $cell.siblings(".AssignmentNote");
		var gradeToColor = (EXTRA_CREDIT_REGEX.test(assignmentNameElem.text())
		                 || EXTRA_CREDIT_NOTE_REGEX.test(assignmentNoteElem.text()))
		                 ? 100 + grade : grade;
		$cell.html(gradeText).data("editing", "0")
			.css("background-color", HAC_HTML.colorize(gradeToColor));

		// recalculate category average
		var earned = 0, poss = 0, ecPoints = 0, earnedCell, possCell, rows;
		rows = $cell.parent().parent().find(".DataRow, .DataRowAlt");
		for (var i = 0; i < rows.length; i++) {
			var assignmentRow = rows[i];
			if (!(isNaN((earnedCell = $(assignmentRow).children(".AssignmentGrade")).text())
					|| earnedCell.text() == "") && earnedCell.next().text().indexOf("Dropped") == -1) {
				if (EXTRA_CREDIT_REGEX.test(earnedCell.prev().prev().text())
					|| EXTRA_CREDIT_NOTE_REGEX.test(earnedCell.siblings(".AssignmentNote").text())) {
					ecPoints += parseFloat(earnedCell.text());
				} else {
					earned += parseFloat(earnedCell.text());
					if ((possCell = $(assignmentRow).children(".AssignmentPointsPossible")).length == 0)
						poss += 100;
					else
						poss += parseFloat(possCell.text());
				}
			}
		}
		var avg = earned * 100 / poss;
		var categoryAverage = isNaN(avg) ? "" : Math.round(avg * 100) / 100;

		// show category average
		$cell.parent().siblings(".CategoryAverageRow").children(".CategoryAverage").text(categoryAverage)
			.css("background-color", HAC_HTML.colorize(categoryAverage));

		// console.log($cell.parent()[0]);

		// sum up the 6 weeks subject average
		var subjectTotal = 0, weightTotal = 0, bonus = 0;
		rows = $("#classgrades").find(".DataTable");
		for (var i = 0; i < rows.length; i++) {
			$currRow = $(rows[i]);
			if ($(rows[i]).find(".CategoryAverageRow").children(".CategoryAverage").text() != "") {
				var weight = $currRow.data("weight");
				var isPercentWeight = $currRow.data("is_percent_weight");
				categoryAverage = parseFloat($currRow.find(".CategoryAverage").text());
				subjectTotal += categoryAverage * weight;
				weightTotal += weight;

				// special case: extra credit
				if (isPercentWeight && weight == 0 && $currRow.find(".AssignmentPointsPossible").length != 0) {
					// add up scores individually
					var bonuses = $currRow.find(".AssignmentGrade");
					for (var j = 0; j < bonuses.length; j++)
						if (!isNaN(bonuses[j].innerText))
							bonus += parseFloat(bonuses[j].innerText);
				}
			}
		}
		subjectTotal *= 1 / weightTotal;
		subjectTotal += bonus + ecPoints;
		subjectTotal = Math.max(subjectTotal, 0);

		// show subject average
		$(".CurrentAverage").html("Current Average: ")
			.append($(document.createElement("span")).text(Math.round(subjectTotal))
				.css('background', HAC_HTML.colorize(Math.round(subjectTotal))));

		// show subject average on main grades chart
		var sixWeeksColor = HAC_HTML.colorize(subjectTotal);
		var changedGradeCell = $(".grade a").filter(function(){
				return $(this).data("data") == $("#classgrades").data("data");
			})
			.text(Math.round(subjectTotal).toString()).css("color", "#24f")
			.parent().css({"background-color": sixWeeksColor,
				"box-shadow": sixWeeksColor + " 0px 0px 4px"});

		// subject averages
		HAC_HTML._recalculate_subject_averages(changedGradeCell);

		// GPA
		GPA.show();

		// analytics
		_gaq.push(['_trackEvent', 'Class Grades', 'Edit', 'Edit Grades', grade]);
	},

	/**
	 * Performs all of the actions necessary after an exam grade editor changes
	 * a grade
	 * @param {Element} el - the element that fired this event
	 */
	_finalize_exam_grade_edit: function (el) {
		// hide tipsy
		$(el).parent().tipsy("hide");

		// calculate grade
		var grade = $(el).val(), gradeText;
		if (grade.match(/\w+/) != null || grade == "")
			gradeText = grade;
		else if (isNaN(grade)) gradeText = "";
		else if (grade > 100)  { gradeText = "100"; grade = 100; }
		else if (grade < 0)    gradeText = "0";
		else                   gradeText = Math.round(grade);

		// show/hide edited notice
		if ($(el).parent().data("orig") != $(el).val()) {
			$(el).parent().addClass("edited").css("color", "#24f");
			$(document.body).addClass("edited");
		} else {
			$(el).parent().removeClass("edited").css("color", "#000");
		}

		// re-render grade cell
		var $cell = $(el).parent(), color = HAC_HTML.colorize(grade);
		$cell.html(gradeText).data("editing", "0")
			.css({"background-color": color,
				"box-shadow": "0px 0px 4px " + color});

		// semester averages
		HAC_HTML._recalculate_subject_averages($cell);

		// analytics
		_gaq.push(['_trackEvent', 'Grades', 'Edit', 'Edit Exam Grades', grade]);
	},

	/**
	 * Calculates and displays the semester averages based on marking period averaegs
	 * @param {jQuery} changedGradeCell - the grade cell that triggered the recalculation
	 */
	_recalculate_subject_averages: function (changedGradeCell) {
		// add up subject averages
		var sixWeeksCells, examCell, semAvgCell, subject = changedGradeCell.parent().children();
		if (changedGradeCell.index() < 5) {
			sixWeeksCells = [subject[1], subject[2], subject[3]];
			examCell = subject[4];
			semAvgCell = subject[5];
		} else {
			sixWeeksCells = [subject[6], subject[7], subject[8]];
			examCell = subject[9];
			semAvgCell = subject[10];
		}
		var semAvg = 0,
			weightTotal = 0, 
			weightPerSixWeeks,
			examWeight;
		if (localStorage["district"] == "rrisd") {
			weightPerSixWeeks = 85 / 300;
			examWeight = 0.15;
		} else {
			weightPerSixWeeks = 0.25;
			examWeight = 0.25;
		}
		for (var i = 0; i < sixWeeksCells.length; i++) {
			cell = sixWeeksCells[i];
			if (cell.innerHTML != "") {
				semAvg += parseInt($(cell).children().text()) * weightPerSixWeeks;
				weightTotal += weightPerSixWeeks;
			}
		}
		if (examCell.innerText != "" && !isNaN(examCell.innerText)) {
			semAvg += parseInt(examCell.innerText) * examWeight;
			weightTotal += examWeight;
		}
		semAvg *= 1 / weightTotal;
		semAvg = Math.max(Math.min(semAvg, 100), 0);

		// show subject average
		var semColor = HAC_HTML.colorize(semAvg);
		var semAvgText = isNaN(semAvg) ? "" : Math.round(Math.round(semAvg * 10000) / 10000);
		$(semAvgCell).text(semAvgText)
			.css({"background-color": semColor,
				"box-shadow": semColor + " 0px 0px 4px"});

		// show/hide edited notice
		if ($("#classgrades td.edited, .exam.edited").length == 0) {
			$(document.body).removeClass("edited");
			changedGradeCell.children().css("color", "#000");
		} else
			$(document.body).addClass("edited");
	},

	/**
	 * Calculates the background color corresponding with a specific grade based
	 * on the grade, Asianness level, and hue
	 * @param {number} grade - the grade to colorize
	 * @returns {string} the color that corresponds with the grade given
	 */
	colorize: function (grade) {
		// color is only for numerical grades
		if ( typeof grade != "number" || isNaN(parseInt(grade)) || grade == null) return "#FFF";

		// Makes sure asianness cannot be negative
		var asianness_limited = Math.max(0, asianness);

		// interpolate a hue gradient and convert to rgb
		var h, s, v, r, g, b;

		// determine color. ***MAGIC DO NOT TOUCH UNDER ANY CIRCUMSTANCES***
		if (grade < 0) {
			h = 0;
			s = 1;
			v = 0.86944;
		} else {
			h = Math.min(0.25 * Math.pow(grade / 100, asianness_limited)
				// The following line limits the amount hue is allowed to
				// change in the gradient depending on how far the hue is
				// from a multiple of 90.
				+ Math.abs(45 - (hue + 45) % 90) / 256,
				// The following line puts a hard cap on the hue change.
				0.13056);
			s = 1 - Math.pow(grade / 100, asianness_limited * 2);
			v = 0.86944 + h;
		}

		// apply hue transformation
		h += hue/360;
		h %= 1;
		if (h < 0) h += 1;

		// extra credit gets a special color
		if (grade > 100) {
			h = 0.5;
			s = Math.min((grade - 100) / 15, 1);
			v = 1;
		}

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

	/**
	 * Compares two marking period grade JSONs and notifies the user of any
	 * changes if notifications are enabled
	 * @param {JSON} oldgrade - the old list of grades
	 * @param {JSON} newgrade - the new list of grades
	 * @param {function} on_notify - a function to call if grades have been changed
	 */
	compare_grades: function (oldgrade, newgrade, on_notify) {
		var labels = [
			"Cycle 1", "Cycle 2", "Cycle 3", "Exam 1", "Semester 1",
			"Cycle 4", "Cycle 5", "Cycle 6", "Exam 2", "Semester 2"
		];
		var gradesToNotify = [], notif;
		var changedGrades = localStorage.hasOwnProperty("changed_grades") ? JSON.parse(localStorage["changed_grades"]) : {};
		
		// compare the grades
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
							uid: newgrade[r].urls[c],
							row: r+1, col: c,
							title: newgrade[r].title,
							label: labels[c],
							oldgrade: parseInt(oldgrade[r].grades[c]),
							newgrade: parseInt(newgrade[r].grades[c])
						});
			}
		}

		// display notification(s)
		if (localStorage.hasOwnProperty("notifs_enabled") && localStorage["notifs_enabled"]) {
			if (localStorage.hasOwnProperty("single_notif") && localStorage["single_notif"] === "true"
				|| localStorage.hasOwnProperty("password") && localStorage["password"] === ""
				|| !localStorage.hasOwnProperty("password")) {
				// Call notification once for all updates
				if (gradesToNotify.length > 0) 
					HAC_HTML._notify2(
						"Grades Changed", 
						"Your grade changed in " + gradesToNotify.length + " course" + (gradesToNotify.length > 1 ? "s" : "")
					);
				if (typeof on_notify === "function") on_notify.call();
			} else {
				// Call notification for each grade update
				for (var n = gradesToNotify.length-1; n >=0; n--) {
					notif = HAC_HTML.makeUpdateText(gradesToNotify[n]);
					HAC_HTML._notify2(notif.title, notif.text);
					if (typeof on_notify === "function") on_notify.call();
				}
			}
		}
		// Set grade change indicators
		for (var n = gradesToNotify.length-1; n >=0; n--) {
			var dir;
			if (gradesToNotify[n].newgrade > gradesToNotify[n].oldgrade) dir = "up";
			else if (gradesToNotify[n].newgrade < gradesToNotify[n].oldgrade) dir = "down";
			else dir = "same";

			var uid = gradesToNotify[n].uid;
			var r = gradesToNotify[n].row;
			var c = gradesToNotify[n].col;

			if (uid.length > 0)
				changedGrades[uid] = {dir: dir, row: r, col: c};
		}
		localStorage.setItem("changed_grades", JSON.stringify(changedGrades));
	},

	/**
	 * Creates the text needed to display a notification about a grade change
	 * @param {{title: string, label: string, oldgrade: number, newgrade: number}}
	 *     gradeData - information about the grade that was changed
	 * @returns {string} update text for the grade change
	 */
	makeUpdateText: function (gradeData) {
		var text, is_new, fromText,
			className = gradeData.title,
			label = gradeData.label,
			oldgrade = gradeData.oldgrade,
			newgrade = gradeData.newgrade;
		
		is_new = typeof oldgrade == "undefined" || isNaN(oldgrade) || oldgrade == "";
		
		fromText = is_new ? "" : "from " + oldgrade.toString(10);
		
		if (is_new) text = "is now " + newgrade.toString(10);
		else if (newgrade > oldgrade) text = "rose " + fromText + " to " + newgrade.toString(10);
		else if (newgrade < oldgrade) text = "fell " + fromText + " to " + newgrade.toString(10);
		else if (newgrade == oldgrade) text = "is still " + newgrade.toString(10);
		else {
			text = "???";
			console.error("What happen?");
			console.log(oldgrade, newgrade);
		}
		
		return {
			title: className + " grade for " + label,
			text: "Your grade " + text
		};
	},

	/**
	 * Creates and displays a WebKit notification
	 * @param {string} titleText - notification title text
	 * @param {string} updateText - notification body text
	 */
	_notify2: function (titleText, updateText) {
		var notif = webkitNotifications.createNotification("assets/icon-full.png", titleText, updateText).show();

		if (localStorage.hasOwnProperty("notif_duration")) {
			var duration = parseInt(localStorage["notif_duration"]);
			if (duration > 0 && duration <= 60) {
				window.setTimeout(function () {
					notif.cancel();
				}, duration * 1000);
			}
		} else {
			window.setTimeout(function () {
				notif.cancel();
			}, DEFAULT_NOTIF_DURATION * 1000);
		}
	},

	/**
	 * Creates and displays a WebKit notification based on grade data
	 * @param {string} className - the name of the class that the changed grade
	 * is in
	 * @param {string} label - the marking period that the changed grade is in
	 * @param {number} oldgrade - the old grade
	 * @param {number} newgrade - the new grade
	 * @deprecated use {@link HAC_HTML._notify2} instead
	 */
	_notify: function(className, label, oldgrade, newgrade) {
		var text;
		if ((typeof oldgrade == "undefined") || (oldgrade == "") || (isNaN(oldgrade))) text = "is now";
		else if (newgrade > oldgrade) text = "rose to";
		else text = "fell to";

		var notif = webkitNotifications.createNotification(
			"icon.png",
			className + " grade for " + label,
			"Your grade " + text + " " + newgrade + ".");

		notif.show();
	}
};

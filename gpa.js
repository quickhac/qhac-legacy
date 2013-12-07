/**
 * @type {number}
 * @const
 */
var DEFAULT_GPA_PRECISION = 4;

/**
 * Calculates grade point average.
 * @namespace
 */
var GPA = {
	/**
	 * Retrieves the list of Honors course names from localStorage.
	 * If said list does not exist, populates said list with all
	 * of the courses that have course names containing the keywords
	 * AP, IB, or TAG from the list of grades in localStorage.
	 * @returns {string[]} the list of Honors course names
	 */
	get_honors_courses: function() {
		if (localStorage.hasOwnProperty("gpa_honors")) {
			return JSON.parse(localStorage["gpa_honors"])
		} else {
			var honors = [];
			var grades = JSON.parse(localStorage["grades"]);
			for (var i = 0; i < grades.length; i++)
				if (/\b(ap|ib|tag)\b/i.test(grades[i].title))
					honors[honors.length] = grades[i].title;
			localStorage["gpa_honors"] = JSON.stringify(honors);
			return honors;
		}
	},

	/**
	 * Retrieves the list of course names that are blacklisted from the
	 * GPA calculation from localStorage. If said list does not exist,
	 * initialises said blacklist as an empty array and returns that.
	 * @returns {string[]} the list of GPA-blacklisted course names
	 */
	get_gpa_blacklist: function() {
		if (localStorage.hasOwnProperty("gpa_blacklist")) {
			return JSON.parse(localStorage["gpa_blacklist"]);
		} else {
			localStorage["gpa_blacklist"] = "[]";
			return [];
		}
	},

	/**
	 * Removes blacklisted courses from an array of grades.
	 * @param {Object} grades
	 * @returns {Object}
	 */
	filter_grades: function(grades) {
		var blacklist = GPA.get_gpa_blacklist();
		var new_grades = [];
		for (var i = 0; i < grades.length; i++)
			if (blacklist.indexOf(grades[i].title) == -1)
				new_grades[new_grades.length] = grades[i];
		return new_grades;
	},

	/**
	 * Checks if a given grade should be excluded from the GPA calculation.
	 * @param {number} grade - the grade to check
	 * @returns {boolean} true if the grade should be excluded
	 */
	_is_empty: function(grade) {
		if (typeof grade === "undefined") return true;
		if (grade === "") return true;
		if (isNaN(grade)) return true;
		return false;
	},

	/**
	 * Finds the average value of an array, excluding empty and NaN grades.
	 * @param {Array<number>} array - the array of numbers to find the average of
	 * @returns {number} the average of the array
	 */
	_avg: function(array) {
		total = 0;
		items = 0;
		for (var i = 0; i < array.length; i++) {
			if (GPA._is_empty(array[i]))
				continue;
			items++;
			total += array[i];
		}
		return total / items;
	},

	/**
	 * Finds the numerical offset for the conversion from 100-point scale
	 * grade to grade point, as defined by the formula:<br>
	 * <pre>
	 *     grade point (< 70) := 0
	 *     grade point (grade) := (grade - offset) / 10
	 *     grade point (honors grade) := (grade - offset) / 10 + 1
	 * </pre>
	 * @returns {number}
	 */
	offset: function() {
		if (localStorage["district"] == "rrisd")
			return 50;
		else if (localStorage["district"] == "aisd")
			return 60;
	},

	/**
	 * Finds the unweighted grade point on a 4.0 scale of a course,
	 * as defined in the RRISD Course Catalogue
	 * @param {number} grade - the grade to find the grade point of
	 * @returns {number} the equivalent grade point
	 */
	grade_point_unweighted: function(grade) {
		if (GPA._is_empty(grade)) return NaN;
		if (grade < 70) return 0;
		// return Math.min(Math.floor((grade - 60) / 10 + 1), 4);
		return Math.min((grade - 60) / 10, 4);
	},

	/**
	 * Finds the weighted grade point on a 6.0 scale of a course, as
	 * defined in the RRISD Course Catalogue, or a 5.0 scale, as defined
	 * in the AISD Student Handbook, page 116
	 * (http://archive.austinisd.org/academics/docs/2013Schoolguide/en/ssig_2012_2013_Complete.pdf)
	 * @param {number} grade - the grade to find the grade point of
	 * @returns {number} the equivalent grade point
	 */
	grade_point_weighted: function(grade, title, honors_courses) {
		if (GPA._is_empty(grade)) return NaN;
		if (grade < 70) return 0;
		var offset = GPA.offset();
		return (grade - offset) / 10 + (honors_courses.indexOf(title) == -1 ? 0 : 1);
	},

	/**
	 * Finds the grade point average of a list of grades.
	 * @param {Object} grades - the list of grades to find the GPA of
	 * @param {function} callback - a function to calculate grade point
	 * from grade
	 */
	calculate: function(grades, callback) {
		var courses = [];
		var honors_courses = GPA.get_honors_courses();
		grades = GPA.filter_grades(grades);
		for (var i = 0; i < grades.length; i++) {
			courses[courses.length] = callback(grades[i].grades[4], grades[i].title, honors_courses);
			courses[courses.length] = callback(grades[i].grades[9], grades[i].title, honors_courses);
		}
		// average all GPAs to get final number
		return GPA._avg(courses);
	},

	/**
	 * Converts grades shown in qHAC to a grade JSON
	 */
	_retrieve_grades_from_dom: function() {
		return HAC_HTML.html_to_jso(document.body.innerHTML, true);
	},

	/**
	 * Finds the unweighted GPA on a 4.0 scale of a list of grades, as
	 * defined in the RRISD Course Catalogue
	 * @param {Object} grades - the list of gradse to find the grade point of
	 * @returns {number} the equivalent grade point
	 */
	unweighted: function(grades) {
		return GPA.calculate(
			GPA._retrieve_grades_from_dom(),
			GPA.grade_point_unweighted);
	},

	/**
	 * Finds the weighted GPA on a 6.0 scale of a list of grades, as
	 * defined in the RRISD Course Catalogue
	 * @param {Object} grades - the list of gradse to find the grade point of
	 * @returns {number} the equivalent grade point
	 */
	weighted: function(grades) {
		return GPA.calculate(
			GPA._retrieve_grades_from_dom(),
			GPA.grade_point_weighted);
	},

	show: function() {
		if (typeof localStorage['grades'] === 'undefined')
			return;
		if (!localStorage["gpa_enabled"] || (localStorage["gpa_enabled"] == "true")) {
			var gpa = (localStorage["gpa_weighted"] == "true") ?
				GPA.weighted(JSON.parse(localStorage['grades'])) :
				GPA.unweighted(JSON.parse(localStorage['grades']));
			var GPA_text = gpa.toFixed(parseInt(localStorage["gpa_precision"]) || DEFAULT_GPA_PRECISION);
			$("#gpa").text(isNaN(GPA_text) ? "" : GPA_text);
			$("#GPA_panel_wrapper p .gpa_preview").text(isNaN(GPA_text) ? "" : GPA_text);
		} else {
			$("#gpa_wrapper").hide();
			$("#ad_wrapper").css("float", "none");
			$("#ad").css({"float": "left", "paddingTop": "2px"});
		}
	},

	render_panel: function () {
		$panel = $("#GPA_panel").html("");

		var honors_courses = GPA.get_honors_courses();
		var blacklist = GPA.get_gpa_blacklist();
		var courses = JSON.parse(localStorage["grades"]).map(function (el, i) {
			return el.title;
		});

		function makeSwitch(enabled, disabledText, enabledText, courseName, switchType) {
			var $el = $(document.createElement("label"))
				.addClass("switch-light switch-android");
			var $checkbox = $(document.createElement("input"))
				.prop("type", "checkbox")
				.prop("checked", enabled)
				.change(function (event) {
					// console.log(courseName, switchType, this.checked);
					var newState = this.checked;
					event.stopPropagation();
					var list;

					if (switchType === "include") {
						var list = GPA.get_gpa_blacklist();
						var inList = list.indexOf(courseName) >= 0;
						if (!inList && !newState) {
							// Add to blacklist
							list.push(courseName);
						} else if (inList && newState) {
							// remove from blacklist
							list.splice(list.indexOf(courseName), 1);
						}
						localStorage["gpa_blacklist"] = JSON.stringify(list);
					} else {
						var list = GPA.get_honors_courses();
						var inList = list.indexOf(courseName) >= 0;
						if (!inList && newState) {
							// Add to honors list
							list.push(courseName);
						} else if (inList && !newState) {
							// remove from honors list
							list.splice(list.indexOf(courseName), 1);
						}
						localStorage["gpa_honors"] = JSON.stringify(list);
					}
					GPA.show();
				})
				.appendTo($el);
			var $texts = $(document.createElement("span"))
				.appendTo($el);
			var $text1 = $(document.createElement("span"))
				.text(disabledText)
				.appendTo($texts);
			var $text2 = $(document.createElement("span"))
				.text(enabledText)
				.appendTo($texts);
			var $a = $(document.createElement("a"))
				.appendTo($el);

			return $el;
		}

		courses.forEach(function (courseName) {
			var $course = $(document.createElement("div"))
				.addClass("course card")
				.click(function (event) {
					event.stopPropagation();
				});

			var $title = $(document.createElement("span"))
				.addClass("course-title")
				.text(courseName)
				.appendTo($course);

			if (localStorage["gpa_weighted"] == "true") {
				var isHonors = honors_courses.indexOf(courseName) >= 0;
				$course.append(makeSwitch(isHonors, "regular", "honors", courseName, "honors"));
			}

			var isIncluded = blacklist.indexOf(courseName) < 0;
			$course.append(makeSwitch(isIncluded, "exclude", "include", courseName, "include"));

			$panel.append($course);
		});
	},


	/** Displays the GPA settings panel **/
	toggle_panel: function() {

		if ($("#GPA_panel_wrapper").hasClass('visible')) {
			$("#GPA_panel_wrapper").removeClass('visible');
			return;
		}

		GPA.render_panel();
		
		$("#GPA_panel_wrapper").addClass('visible');
	}
}

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
	 * Finds the unweighted grade point on a 4.0 scale of a course,
	 * as defined in the RRISD Course Catalogue
	 * @param {number} grade - the grade to find the grade point of
	 * @returns {number} the equivalent grade point
	 */
	grade_point_unweighted: function(grade) {
		if (GPA._is_empty(grade)) return NaN;
		if (grade < 70) return 0;
		return Math.min(Math.floor((grade - 60) / 10 + 1), 4);
	},

	/**
	 * Finds the weighted grade point on a 6.0 scale of a course, as
	 * defined in the RRISD Course Catalogue
	 * @param {number} grade - the grade to find the grade point of
	 * @returns {number} the equivalent grade point
	 */
	grade_point_weighted: function(grade, title, honors_courses) {
		if (GPA._is_empty(grade)) return NaN;
		if (grade < 70) return 0;
		return (grade - 50) / 10 + (honors_courses.indexOf(title) == -1 ? 0 : 1);
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
		if (!localStorage["gpa_enabled"] || (localStorage["gpa_enabled"] == "true")) {
			var gpa = !localStorage["gpa_weighted"] || (localStorage["gpa_weighted"] == "true") ?
				GPA.weighted(JSON.parse(localStorage['grades'])) :
				GPA.unweighted(JSON.parse(localStorage['grades']));
			$("#gpa").text(gpa.toFixed(parseInt(localStorage["gpa_precision"]) || DEFAULT_GPA_PRECISION));
		} else {
			$("#gpa_wrapper").hide();
			$("#ad_wrapper").css("float", "none");
			$("#ad").css({"float": "left", "paddingTop": "2px"});
		}
	}
}
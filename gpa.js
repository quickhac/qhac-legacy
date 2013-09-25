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
	 * Checks if a course is an honors course based on its course name.
	 * This is needed to calculate the weighted grade point average.
	 * @param {string} coursename - the course to check
	 * @returns {boolean} true if the course in an honors course
	 */
	is_honors: function(coursename) {
		return /(ap|ib|tag)/i.test(coursename);
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
	grade_point_unweighted: function(grade, title) {
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
	grade_point_weighted: function(grade, title) {
		if (GPA._is_empty(grade)) return NaN;
		if (grade < 70) return 0;
		return (grade - 50) / 10 + (GPA.is_honors(title) ? 1 : 0);
	},

	calculate: function(grades, callback) {
		var courses = [];
		for (var i = 0; i < grades.length; i++) {
			courses[courses.length] = callback(grades[i].grades[4], grades[i].title);
			courses[courses.length] = callback(grades[i].grades[9], grades[i].title);
		}
		// average all GPAs to get final number
		return GPA._avg(courses);
	},

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
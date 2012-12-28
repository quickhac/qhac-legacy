var asianness;

function generate_color_table() {
	var table = document.createElement("table");
	$(table).attr("cellpadding", "8px").attr("cellspacing", "0px").css("width", "100%");
	for (var r = 0; r < 10; r++) {
		var row = document.createElement("tr");
		for (var c = 0; c < 10; c++) {
			var cell = document.createElement("td");
			var grade = 10 * r + c;
			cell.textContent = grade;
			$(cell).css("backgroundColor", HAC_HTML.colorize(grade));
			$(row).append(cell);
		}
		$(table).append(row);
	}

	$("#color_table").html("").append(table);
}

$(function(){
	// load
	if (localStorage["asianness"] != undefined)
		{ $("#asianness").val(localStorage["asianness"]); asianness = localStorage["asianness"]; }
	else
		{ asianness = 4; }
	if (localStorage["r_int"] != undefined)
		$("#r_interval").val(localStorage["r_int"]);
	generate_color_table();
	// save
	$("#save").click(function() {
		var level = $("#asianness").val();
		if (isNaN(level)) alert("Asianness level must be a number!");
		else { localStorage.setItem("asianness", level); asianness = level; generate_color_table(); }
		var r_int = $("#r_interval").val();
		if (isNaN(r_int) || (r_int < 0)) alert("Refresh interval must be a positive number or zero!");
		else localStorage.setItem("r_int", r_int);
	});
});
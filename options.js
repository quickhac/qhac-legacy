$(function(){
	// load
	if (localStorage["asianness"] != undefined)
		$("#asianness").val(localStorage["asianness"]);
	if (localStorage["r_int"] != undefined)
		$("#r_interval").val(localStorage["r_int"]);
	// save
	$("#save").click(function() {
		var level = $("#asianness").val();
		if (isNaN(level)) alert("Asianness level must be a number!");
		else localStorage.setItem("asianness", level);
		var r_int = $("#r_interval").val();
		if (isNaN(r_int) || (r_int <= 0)) alert("Refresh interval must be a positive number!");
		else localStorage.setItem("r_int", r_int);
	})
})
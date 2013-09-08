var options_formdata = {
	toggles: [
		{
			title: "Grade Colorization",
			id: "colorization",
			type: "toggle",
			default_value: true,
			info: "Color grades according to severity of the score.",
			attributes: {},
			on_change: function (el) {
				update_options_dom(false);
			},
			options: [
				{
					title: "Asianness Level",
					id: "asianness",
					type: "number",
					default_value: "4",
					info: "",
					attributes: {
						"min": "0"
					},
					on_change: function (el) {},
					validation_input: function () {
						return parseFloat(document.getElementById("asianness").value);
					},
					validation_rules: {
						"gt0": function (x) { return x > 0; }
					},
					validation_responses: [
						{
							states: { "gt0": true },
							success: function (val) {
								// console.log("asianness is valid");
								// localStorage.setItem("asianness", val);
								return true;
							}
						},
						{
							states: { "gt0": false },
							success: function (val) {
								show_error($("#asianness"), "Asianness must be greater than 0");
								return false;
							}
						}
					]
				},
				{
					title: "Hue",
					id: "hue",
					type: "number",
					default_value: "0",
					info: "Enter 0 to return to default",
					attributes: {
						"min": "0",
						"max": "360",
						"step": "15"
					},
					on_change: function (el) {},
					validation_input: function () {
						return parseInt(document.getElementById("hue").value);
					},
					validation_rules: {
						"gte0": function (x) { return x >= 0; },
						"lte360": function (x) { return x <= 360; }
					},
					validation_responses: [
						{
							states: [{ "gte0": true, "lte360": true }],
							success: function (val) {
								// localStorage.setItem("hue", val.toString());
								return true;
							}
						},
						{
							states: [{ "gte0": false }, { "lte360": false }],
							success: function (val) {
								show_error($("#hue"), "Hue must be between 0 and 360");
								return false;
							}
						}
					]
				}
			],
			sections: []
		},
		{
			title: "Automatic Refresh",
			id: "auto_refresh",
			type: "toggle",
			default_value: true,
			info: "Automatically check your grades periodically.",
			attributes: {},
			on_change: function (el) {
				update_options_dom(false);
			},
			options: [
				{
					title: "Refresh Interval (min)",
					id: "r_interval",
					type: "number",
					info: "",
					default_value: "60",
					attributes: {
						"min": "0"
					},
					on_change: function (el) {},
					validation_input: function () {
						return parseFloat(document.getElementById("r_interval").value);
					},
					validation_rules: {
						"gte0": function (x) { return x >= 0; }
					},
					validation_responses: [
						{
							states: [{ "gte0": true }],
							success: function (val) {
								// localStorage.setItem("r_int", val.toString());
								return true;
							}
						},
						{
							states: [{ "gte0": false }],
							success: function (val) {
								console.log(val);
								show_error($("#r_interval"), "Refresh interval must be positive");
								return false;
							}
						}
					]
				}
			],
			sections: []
		},
		{
			title: "Notifications",
			id: "notifs_enabled",
			type: "toggle",
			default_value: true,
			info: "Show a small popup on the corner of the screen when a grade changes.",
			attributes: {},
			on_change: function (el) {
				update_options_dom(false);
			},
			options: [
				{
					title: "Consolidate Updates",
					id: "single_notif",
					type: "toggle",
					info: "Notify once for all grade changes, instead of once for each individual change. This is required if password lock is enabled.",
					default_value: false,
					attributes: {},
					on_change: function (el) {},
					validation_input: function () {},
					validation_rules: {},
					validation_responses: []
				},
				{
					title: "Auto-Hide Duration (sec)",
					id: "notif_duration",
					type: "number",
					info: "<strong>Windows/Linux only</strong>. Set to 0 to disable auto-hide. If you are on OS X, see system notification settings.",
					default_value: "5",
					attributes: {
						"min": "0",
						"max": "60",
						"step": "1"
					},
					on_change: function (el) {},
					validation_input: function () {
						return parseInt($("#notif_duration").val());
					},
					validation_rules: {
						"in_range": function (val) { return val >= 0 && val <= 60; }
					},
					validation_responses: [
						{
							states: [{ "in_range": false }],
							success: function (val) {
								show_error($("#notif_duration"), "Duration must be between 0 and 60 seconds")
								return false;
							}
						}
					]
				}
			],
			sections: []
		},
		{
			title: "Badge Count",
			id: "badge_count",
			type: "toggle",
			default_value: true,
			info: "Show the number of unviewed changed grades on the icon.",
			attributes: {},
			on_change: function (el) {
				// update_options_dom(false);
				badge_enabled = $("#badge_count").prop("checked");
			},
			options: [],
			sections: []
		},
		{
			title: "Animations",
			id: "animations",
			type: "toggle",
			default_value: true,
			info: "Make qHAC fun to use.",
			attributes: {},
			on_change: function (el) {
				// update_options_dom(false);
				animations_enabled = $("#animations").prop("checked");
			},
			options: [],
			sections: []
		},
		{
			title: "Password Protection",
			id: "password_protection",
			type: "toggle",
			default_value: true,
			info: "Protect your grades from prying eyes.",
			attributes: {},
			on_change: function (el) {
				set_password_boxes(document.getElementById("password_protection").checked);
			},
			options: [],
			sections: [
				{
					header: "Change Password",
					info: "",
					options: [
						{
							title: "Old Password",
							id: "old_password",
							type: "password",
							default_value: "",
							info: "",
							attributes: {},
							on_change: function (el) {},
							validation_input: function () {
								return {
									op_required: document.getElementById("old_password").required,
									np_required: document.getElementById("new_password").required,
									op: document.getElementById("old_password").value,
									np: document.getElementById("new_password").value,
									cp: document.getElementById("confirm_password").value
								};
							},
							validation_rules: {
								"op_required": function (val) { return val.op_required; },
								"np_required": function (val) { return val.np_required; },
								"op_empty": function (val) { return val.op.length === 0; },
								"np_empty": function (val) { return val.np.length === 0; },
								"cp_empty": function (val) { return val.cp.length === 0; },
								"auth": function (val) { return CryptoJS.SHA512(val.op).toString() === localStorage["password"]; }
							},
							validation_responses: [
								{
									states: [
										// { "op_required": true, "op_empty": false, "auth": false },
										{ "op_required": true, "np_empty": false, "auth": false },
										{ "op_required": true, "cp_empty": false, "auth": false },
										{ "op_required": true, "np_empty": true, "op_empty": false, "auth": false }
									],
									success: function (val) {
										show_error($("#old_password"), "Incorrect Password");
										return false;
									}
								},
								{
									states: [
										{ "op_required": true, "op_empty": true, "np_empty": false },
										{ "op_required": true, "op_empty": true, "np_required": false }
									],
									success: function (va) {
										show_error($("#old_password"), "Current password required");
										return false;
									}
								}
							]
						},
						{
							title: "New Password",
							id: "new_password",
							type: "password",
							default_value: "",
							info: "",
							attributes: {},
							on_change: function (el) {},
							validation_input: function () {
								return {
									op_required: document.getElementById("old_password").required,
									np_required: document.getElementById("new_password").required,
									op: document.getElementById("old_password").value,
									np: document.getElementById("new_password").value,
									cp: document.getElementById("confirm_password").value
								};
							},
							validation_rules: {
								"op_required": function (val) { return val.op_required; },
								"np_required": function (val) { return val.np_required; },
								"op_empty": function (val) { return val.op.length === 0; },
								"np_empty": function (val) { return val.np.length === 0; },
								"cp_empty": function (val) { return val.cp.length === 0; },
								"np_length": function (val) { return val.np.length > 2; }
							},
							validation_responses: [
								{
									states: [
										{ "np_required": true, "np_length": false, "op_empty": true, "np_empty": false },
										{ "np_required": true, "np_length": false, "cp_empty": false, "np_empty": true },
										{ "np_required": true, "np_length": false, "op_empty": false },
										{ "np_required": true, "op_required": false, "np_empty": true }
									],
									success: function (val) {
										show_error($("#new_password"), "New password must be at least 3 characters long");
									}
								}
							]
						},
						{
							title: "Confirm Password",
							id: "confirm_password",
							type: "password",
							default_value: "",
							info: "",
							attributes: {},
							on_change: function (el) {},
							validation_input: function () {
								return {
									cp_required: document.getElementById("confirm_password").required,
									op: document.getElementById("old_password").value,
									np: document.getElementById("new_password").value,
									cp: document.getElementById("confirm_password").value
								};
							},
							validation_rules: {
								"cp_required": function (val) { return val.cp_required; },
								"np_empty": function (val) { return val.np.length === 0; },
								"cp_empty": function (val) { return val.cp.length === 0; },
								"match": function (val) { return val.cp === val.np; }
							},
							validation_responses: [
								{
									states: [
										{ "cp_required": true, "np_empty": false, "match": false },
										{ "cp_required": true, "cp_empty": false, "match": false }
									],
									success: function (val) {
										show_error($("#confirm_password"), "The passwords provided do not match");
										return false;
									}
								},
								{
									states: [{ "cp_required": true, "np_empty": false, "match": true }],
									success: function (val) {
										console.log("passwords match");
										return true;
									}
								}
							]
						}
					]
				},
				{
					header: "Reset Password",
					info: "To reset your password, you must log in again with your HAC username and password. <strong>Please note that this will reset all your settings as well.</strong>",
					options: []
				}
			]
		}
	],
	on_submit: function (toggles) {
		var all_valid = true, toggle, option, section, section_option;
		for (var i = 0, n = toggles.length; i < n; i++) {
			toggle = toggles[i];
			for (var j = 0, n1 = toggle.options.length; j < n1; j++) {
				option = toggle.options[j];
				all_valid = option.validator.validate() && all_valid;
			}
			for (var k = 0, n2 = toggle.sections.length; k < n2; k++) {
				section = toggle.sections[k];
				for (var l = 0, n3 = section.options.length; l < n3; l++) {
					section_option = section.options[l];
					all_valid = section_option.validator.validate() && all_valid;
				}
			}
		}
		console.log(all_valid);

		if (!all_valid) return false;

		// SAVE ALL THE THINGS!

		var new_asianness = $("#colorization").prop('checked') ? parseFloat($("#asianness").val()) : 0;
		var new_r_int = $("#auto_refresh").prop('checked') ? parseFloat($("#r_interval").val()) : 0;
		var new_hue = parseInt($("#hue").val());
		var new_notif_duration = parseInt($("#notif_duration").val());
		single_notif = $("#single_notif").prop("checked");

		localStorage.setItem("asianness", new_asianness.toString());
		localStorage.setItem("r_int", new_r_int.toString());
		localStorage.setItem("hue", new_hue.toString());
		localStorage.setItem("notif_duration", new_notif_duration.toString());

		localStorage.setItem("notifs_enabled", notifs_enabled ? "true" : "false");
		localStorage.setItem("single_notif", single_notif ? "true" : "false");
		localStorage.setItem("badge_enabled", badge_enabled ? "true" : "false");
		localStorage.setItem("animations", animations_enabled ? "on" : "off");

		// Deal with password crap

		var old_pass = $("#old_password").val();
		var new_pass = $("#new_password").val();
		var confirm_pass = $("#confirm_password").val();

		var A = CryptoJS.SHA512(old_pass).toString() === localStorage["password"];
		var L = password_enabled ? true : false; //to clone boolean object?
		var E = $("#password_protection").prop("checked");
		var M = new_pass === confirm_pass;

		if (A && L && E && M) {
			// update password
			set_password_boxes(true);
			localStorage.setItem("password", CryptoJS.SHA512(new_pass).toString());

		} else if (A && L && !E) {
			// disable password lock
			password_enabled = false;
			set_password_boxes(false);
			localStorage.removeItem("password");

		} else if (!L && E && M) {
			// enable password lock
			password_enabled = true;
			set_password_boxes(true);
			localStorage.setItem("password", CryptoJS.SHA512(new_pass).toString());

		}

		$("#old_password, #new_password, #confirm_password").val("");
		
		$("#save_msg").addClass('visible');
		window.setTimeout(function() {
			$("#save_msg").removeClass('visible');
		}, 4000);

		// _gaq.push(['_trackEvent', 'Options', 'Save', 'Save Options', Math.abs(asianness)]);
	}
}

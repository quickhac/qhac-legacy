
class Validator
	constructor: (inputGetter, rules, responses) ->
		@rules = rules || {}
		@responses = responses || []
		@getInput = inputGetter || {}

	setInput: (inputGetter) =>
		@getInput = inputGetter
		@

	defineRule: (name, condition) =>
		@rules[name] = condition
		@

	defineRules: (@rules) => @

	addResponse: (state, callback) =>
		@responses.push
			state: state
			success: callback
		@

	setResponses: (@responses) => @

	validate: (callback) =>
		state = {}
		returnValue = true
		for name, rule of @rules
			if @rules.hasOwnProperty name
				state[name] = rule.call(this, do @getInput)
		successes = @responses.filter (response, index, array) ->
			isValid = false
			for responseState in response.states
				stateIsTrue = true
				for key, resState of responseState
					checkVal = resState is state[key]
					stateIsTrue = checkVal and stateIsTrue
				isValid = stateIsTrue or isValid
			isValid
		successes.forEach (element, index, array) =>
			returnValue = element.success.call(this, do @getInput) && returnValue
		returnValue

sectionCounter = 1

class Section
	constructor: ->
		@element = document.createElement "section"
		@headerElement = document.createElement "h3"
		@infoElement = document.createElement "p"
		@infoElement.setAttribute "class", "info"
		@header "Section #{sectionCounter++}"
		@info ""

		@options = []

	header: (header) =>
		if typeof header is "undefined" then return @_header
		else if typeof header isnt "string"
			throw new Error "Option#header parameter \"header\" must be a string!"
			return
		@_header = header
		@headerElement.textContent = header
		@

	info: (info) =>
		if typeof info is "undefined" then return @_info
		else if typeof info isnt "string"
			throw new Error "Option#info parameter \"info\" must be a string!"
			return
		@_info = info
		@infoElement.innerHTML = info
		@


	addOption: (option) =>
		if typeof option is "undefined"
			throw new Error "Option#addOption requires an Option object as a parameter!"
		else @options.push option
		@

	appendTo: (container) =>
		option.appendTo @element for option in @options
		reference = if @options.length > 0 then @options[0].element else null
		@element.insertBefore @infoElement, reference
		@element.insertBefore @headerElement, @infoElement
		container.appendChild @element
		@

	insertBefore: (reference, parent) =>
		option.appendTo @element for option in @options
		reference = if @options.length > 0 then @options[0].element else null
		@element.insertBefore @infoElement, reference
		@element.insertBefore @headerElement, @infoElement
		parent.insertBefore @element, reference
		@

optionCounter = 0

class Option
	constructor: ->
		@element = document.createElement "div"
		@element.setAttribute "class", "option"
		@label = document.createElement "label"
		@input = document.createElement "input"
		@infoElement = document.createElement "p"
		@infoElement.setAttribute "class", "info"
		@title "Option #{optionCounter++}"
		@id "option_#{optionCounter++}"
		@info ""
		@validator = new Validator()
	
	title: (title) =>
		if typeof title is "undefined" then return @_title
		else if typeof title isnt "string"
			throw new Error "Option#title parameter \"title\" must be a string!"
			return
		@_title = title
		@label.textContent = title
		@
	
	id: (id) =>
		if typeof id is "undefined" then return @_id
		else if typeof id isnt "string"
			throw new Error "Option#id parameter \"id\" must be a string!"
			return
		@_id = id
		@element.setAttribute "id", "#{id}_wrapper"
		@input.setAttribute "id", id
		@label.setAttribute "for", id
		@
	
	type: (type) =>
		if typeof type is "undefined" then return @_type
		else if typeof type isnt "string"
			throw new Error "Option#type parameter \"type\" must be a string!"
			return
		@_type = type
		switch type
			when "toggle" then @input.setAttribute "type", "checkbox"
			when "choice" then @input.setAttribute "type", "radio"
			when "textbox" then @input.setAttribute "type", "text"
			when "number" then @input.setAttribute "type", "number"
			when "slider" then @input.setAttribute "type", "range"
			when "password" then @input.setAttribute "type", "password"
			else @input.setAttribute "type", "text"
		@

	setAttributes: (attributes) =>
		if typeof attributes isnt "object"
			throw new Error "Option#setAttribute requires an object as a parameter!"
		for attr of attributes
			if attributes.hasOwnProperty attr
				@input.setAttribute attr, attributes[attr]
		@
	
	default_value: (default_value) =>
		if typeof default_value is "undefined" then return @_default_value
		@_default_value = default_value
		switch @_type
			when "toggle" then @input.checked = default_value
			else @input.value = default_value
		@
	
	info: (info) =>
		if typeof info is "undefined" then return @info
		else if typeof info isnt "string"
			throw new Error "Option#info parameter \"info\" must be a string!"
			return
		@_info = info
		@infoElement.innerHTML = info
		@

	appendTo: (container) =>
		@element.appendChild @infoElement
		@element.insertBefore @input, @infoElement
		@input.insertAdjacentHTML "afterend", " "
		@element.insertBefore @label, @input
		@label.insertAdjacentHTML "afterend", ": "
		container.appendChild @element
		@

toggleCounter = 1

class Toggle extends Option
	constructor: ->
		@element = document.createElement "div"
		@element.setAttribute "class", "toggle"
		@label = document.createElement "label"
		@input = document.createElement "input"
		@infoElement = document.createElement "p"
		@infoElement.setAttribute "class", "info"
		@options = []
		@sections = []
		@type "toggle"
		@title "Toggle #{toggleCounter++}"
		@id "toggle_#{toggleCounter++}"
	
	addSection: (section) =>
		if typeof section is "undefined"
			throw new Error "Option#addSection requires a Section object as a parameter!"
		else @sections.push section
		@

	addOption: (option) =>
		if typeof option is "undefined"
			throw new Error "Option#addOption requires an Option object as a parameter!"
		else @options.push option
		@

	appendTo: (container) =>
		top = document.createElement "div"
		top.setAttribute "class", "titlebar"
		top.appendChild @label
		top.appendChild @input
		@element.appendChild top
		@element.appendChild @infoElement
		container.appendChild @element
		option.appendTo @element for option in @options
		section.appendTo @element for section in @sections
		@

renderOptions = (options_json, container) ->
	toggles = []
	container.innerHTML = ""
	for toggle_json in options_json.toggles
		toggle = new Toggle()
		toggle.title(toggle_json.title)
			.id(toggle_json.id)
			.type(toggle_json.type)
			.default_value(toggle_json.default_value)
			.info(toggle_json.info)
			.input.addEventListener "change", toggle_json.on_change, false

		for option_json in toggle_json.options
			option = new Option()
			option.title(option_json.title)
				.id(option_json.id)
				.type(option_json.type)
				.default_value(option_json.default_value)
				.info(option_json.info)
				.setAttributes(option_json.attributes)
			option.validator.setInput option_json.validation_input
			option.validator.defineRules option_json.validation_rules
			option.validator.setResponses option_json.validation_responses
			option.input.addEventListener "change", option_json.on_change, false
			toggle.addOption option

		for section_json in toggle_json.sections
			section = new Section()
			section.header(section_json.header)
				.info(section_json.info)

			for option2_json in section_json.options
				option2 = new Option()
				option2.title(option2_json.title)
					.id(option2_json.id)
					.type(option2_json.type)
					.default_value(option2_json.default_value)
					.info(option2_json.info)
					.setAttributes(option2_json.attributes)
				option2.validator.setInput option2_json.validation_input
				option2.validator.defineRules option2_json.validation_rules
				option2.validator.setResponses option2_json.validation_responses
				option2.input.addEventListener "change", option2_json.on_change, false
				# option2.input.onchange = option2_json.on_change
				section.addOption option2

			toggle.addSection section
		toggle.appendTo container
		toggles.push toggle
	submit_btn = document.getElementById "save"
	submit_btn.addEventListener "click", (e) ->
		options_json.on_submit toggles
	, false

	toggles



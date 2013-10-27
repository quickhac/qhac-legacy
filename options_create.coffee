# Validator Class
# Handles form validations
class Validator

	# Constructor
	# 
	# @param [Function] inputGetter retrieves input from the form
	# @param [Object] rules the rules which generate the various states
	# @param [Array<Object>] responses define a method to be called if a given state is matched
	constructor: (inputGetter, rules, responses) ->
		@rules = rules || {}
		@responses = responses || []
		@getInput = inputGetter || {}

	# Sets the input getting function.
	# 
	# @param [Function] inputGetter a function which retrieves input from the form
	# @return [Validator]
	setInput: (inputGetter) =>
		@getInput = inputGetter
		@

	# Defines a rule.
	#
	# @param [String] name the name of the rule
	# @param [Object] condition the condition that the rule must meet in order to validate
	# @return [Validator]
	defineRule: (name, condition) =>
		@rules[name] = condition
		@

	# Defines all rules with a single hash.
	#
	# @param [Object] rules the hash of rules to define
	# @return [Validator]
	defineRules: (@rules) => @

	# Adds a response.
	#
	# @param [Object] state the state which triggers the response
	# @param [Function] callback is called upon reaching the state
	# @return [Validator]
	addResponse: (state, callback) =>
		@responses.push
			state: state
			success: callback
		@

	# Sets all responses with a single hash.
	#
	# @param [Array<Object>] responses the collection of responses to add
	# @return [Validator]
	setResponses: (@responses) => @

	# Validate the form data.
	# 
	# @param [Function] callback a function which isn't used?
	# @return [Boolean]
	validate: (callback) =>
		state = {}
		returnValue = true

		# Set current state from input
		for own name, rule of @rules
			state[name] = rule.call @, do @getInput

		# Filter out the responses which succeed (pass all rules)
		successes = @responses.filter (response, index, array) ->
			isValid = false
			# Array items are treated as OR
			for responseState in response.states
				stateIsTrue = true
				# Object keys are treated as AND
				for key, resState of responseState
					checkVal = resState is state[key]
					stateIsTrue = checkVal and stateIsTrue
				isValid = stateIsTrue or isValid
			isValid

		# AND all successes together
		successes.forEach (element, index, array) =>
			returnValue = element.success.call(@, do @getInput) and returnValue

		returnValue

sectionCounter = 1

# Creates a generic section in the form.
class Section
	constructor: ->
		@element = document.createElement "section"
		@headerElement = document.createElement "h3"
		@infoElement = document.createElement "p"
		@infoElement.setAttribute "class", "info"
		@header "Section #{sectionCounter++}"
		@info ""

		@options = []

	# Sets the title of this section.
	#
	# @param [String] header the title to be used for this section
	# @return [Section]
	header: (header) =>
		if typeof header is "undefined" then return @_header
		else if typeof header isnt "string"
			throw new Error "Option#header parameter \"header\" must be a string!"
			return
		@_header = header
		@headerElement.textContent = header
		@

	# Sets the description of this section.
	#
	# @param [String] info the description of this section
	# @return [Section]
	info: (info) =>
		if typeof info is "undefined" then return @_info
		else if typeof info isnt "string"
			throw new Error "Option#info parameter \"info\" must be a string!"
			return
		@_info = info
		@infoElement.innerHTML = info
		@

	# Appends an option to this section.
	#
	# @param [Option] option the option to be added
	# @return [Section]
	addOption: (option) =>
		if typeof option is "undefined"
			throw new Error "Option#addOption requires an Option object as a parameter!"
		else @options.push option
		@

	# Injects this section into a container.
	#
	# @param [HTMLElement] container the HTML element to inject this section
	# @return [Section]
	appendTo: (container) =>
		option.appendTo @element for option in @options
		reference = if @options.length > 0 then @options[0].element else null
		@element.insertBefore @infoElement, reference
		@element.insertBefore @headerElement, @infoElement
		container.appendChild @element
		@

	# Inserts this section before a reference element within a parent element.
	#
	# @param [HTMLElement] reference the HTML element before which to insert this section
	# @param [HTMLElement] parent the container which contains the `reference` and this section
	# @return [Section]
	insertBefore: (reference, parent) =>
		option.appendTo @element for option in @options
		reference = if @options.length > 0 then @options[0].element else null
		@element.insertBefore @infoElement, reference
		@element.insertBefore @headerElement, @infoElement
		parent.insertBefore @element, reference
		@

optionCounter = 0

# Base option class
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
	
	# Sets the title of the option.
	#
	# @param [String] title the title to be set
	# @return [Option]
	title: (title) =>
		if typeof title is "undefined" then return @_title
		else if typeof title isnt "string"
			throw new Error "Option#title parameter \"title\" must be a string!"
			return
		@_title = title
		@label.textContent = title
		@
	
	# Sets the DOM ID of the option.
	#
	# @param [String] id the ID to be set
	# @return [Option]
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
	
	# Sets the option type.
	#
	# @param [String] type the type of the option, one of `toggle`, `choice`, `textbox`, `number`, `slider`, or `password`
	# @return [Option]
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

	# Sets the attributes on the DOM input element.
	#
	# @param [Object] attributes a hash of the attributes and values to be set
	# @return [Option]
	setAttributes: (attributes) =>
		if typeof attributes isnt "object"
			throw new Error "Option#setAttribute requires an object as a parameter!"
		for attr of attributes
			if attributes.hasOwnProperty attr
				@input.setAttribute attr, attributes[attr]
		@
	
	# Sets the default value of the DOM input element.
	#
	# @param [String] default_value the value to be assigned to the `value` attribute
	# @return [Option]
	default_value: (default_value) =>
		if typeof default_value is "undefined" then return @_default_value
		@_default_value = default_value
		switch @_type
			when "toggle" then @input.checked = default_value
			else @input.value = default_value
		@
	
	# Sets the description of this option.
	#
	# @param [String] info the description of this option
	# @return [Option]
	info: (info) =>
		if typeof info is "undefined" then return @info
		else if typeof info isnt "string"
			throw new Error "Option#info parameter \"info\" must be a string!"
			return
		@_info = info
		@infoElement.innerHTML = info
		@

	# Injects this option into a container.
	#
	# @param [HTMLElement] container the HTML element to inject this option
	# @return [Option]
	appendTo: (container) =>
		@element.appendChild @infoElement
		@element.insertBefore @input, @infoElement
		@input.insertAdjacentHTML "afterend", " "
		@element.insertBefore @label, @input
		@label.insertAdjacentHTML "afterend", ": "
		container.appendChild @element
		@

toggleCounter = 1

# Creates a togglable option.
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
	
	# Adds a section to the toggle.
	#
	# @param [Section] section the section to add
	# @return [Toggle]
	addSection: (section) =>
		if typeof section is "undefined"
			throw new Error "Option#addSection requires a Section object as a parameter!"
		else @sections.push section
		@

	# Adds an option to the toggle.
	#
	# @param [Option] option the option to add
	# @return [Toggle]
	addOption: (option) =>
		if typeof option is "undefined"
			throw new Error "Option#addOption requires an Option object as a parameter!"
		else @options.push option
		@

	# Injects this toggle into a container.
	#
	# @param [HTMLElement] container the HTML element into which this toggle will be injected
	# @return [Toggle]
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

# Creates the HTML for the form.
#
# @param [Object] options_json the collection of options to be created
# @param [HTMLElement] container the parent element in which the form will be injected
# @return [Array<Toggle>]
renderOptions = (options_json, container) ->
	toggles = []
	container.innerHTML = ""
	for toggle_json in options_json.toggles
		# Create toggles
		toggle = new Toggle()
		toggle.title(toggle_json.title)
			.id(toggle_json.id)
			.type(toggle_json.type)
			.default_value(toggle_json.default_value)
			.info(toggle_json.info)
			.input.addEventListener "change", toggle_json.on_change, false

		# Create and place all non-grouped options first (before sections)
		for option_json in toggle_json.options
			option = new Option()
			option.title(option_json.title)
				.id(option_json.id)
				.type(option_json.type)
				.default_value(option_json.default_value)
				.info(option_json.info)
				.setAttributes(option_json.attributes)

			# Set validation properties of this option
			option.validator.setInput option_json.validation_input
			option.validator.defineRules option_json.validation_rules
			option.validator.setResponses option_json.validation_responses

			# Attach event listener
			option.input.addEventListener "change", option_json.on_change, false
			toggle.addOption option

		# Create sections
		for section_json in toggle_json.sections
			section = new Section()
			section.header(section_json.header)
				.info(section_json.info)

			# Create options to be placed in this section
			for option2_json in section_json.options
				option2 = new Option()
				option2.title(option2_json.title)
					.id(option2_json.id)
					.type(option2_json.type)
					.default_value(option2_json.default_value)
					.info(option2_json.info)
					.setAttributes(option2_json.attributes)

				# Set validation properties of this option
				option2.validator.setInput option2_json.validation_input
				option2.validator.defineRules option2_json.validation_rules
				option2.validator.setResponses option2_json.validation_responses

				# Attach event listener
				option2.input.addEventListener "change", option2_json.on_change, false
				# option2.input.onchange = option2_json.on_change
				section.addOption option2

			toggle.addSection section
		toggle.appendTo container
		toggles.push toggle

	# Attach listener to save button
	submit_btn = document.getElementById "save"
	submit_btn.addEventListener "click", (e) ->
		options_json.on_submit toggles
	, false

	toggles

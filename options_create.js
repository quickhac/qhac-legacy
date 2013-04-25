// Generated by CoffeeScript 1.4.0
var Option, Section, Toggle, Validator, optionCounter, renderOptions, sectionCounter, toggleCounter,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Validator = (function() {

  function Validator(inputGetter, rules, responses) {
    this.validate = __bind(this.validate, this);

    this.setResponses = __bind(this.setResponses, this);

    this.addResponse = __bind(this.addResponse, this);

    this.defineRules = __bind(this.defineRules, this);

    this.defineRule = __bind(this.defineRule, this);

    this.setInput = __bind(this.setInput, this);
    this.rules = rules || {};
    this.responses = responses || [];
    this.getInput = inputGetter || {};
  }

  Validator.prototype.setInput = function(inputGetter) {
    this.getInput = inputGetter;
    return this;
  };

  Validator.prototype.defineRule = function(name, condition) {
    this.rules[name] = condition;
    return this;
  };

  Validator.prototype.defineRules = function(rules) {
    this.rules = rules;
    return this;
  };

  Validator.prototype.addResponse = function(state, callback) {
    this.responses.push({
      state: state,
      success: callback
    });
    return this;
  };

  Validator.prototype.setResponses = function(responses) {
    this.responses = responses;
    return this;
  };

  Validator.prototype.validate = function(callback) {
    var name, returnValue, rule, state, successes, _ref,
      _this = this;
    state = {};
    returnValue = true;
    _ref = this.rules;
    for (name in _ref) {
      rule = _ref[name];
      if (this.rules.hasOwnProperty(name)) {
        state[name] = rule.call(this, this.getInput());
      }
    }
    // console.log(this);
    successes = this.responses.filter(function(response, index, array) {
      var checkVal, isValid, key, resState, responseState, stateIsTrue, _i, _len, _ref1;
      isValid = false;
      _ref1 = response.states;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        responseState = _ref1[_i];
        stateIsTrue = true;
        for (key in responseState) {
          resState = responseState[key];
          checkVal = resState === state[key];
          stateIsTrue = checkVal && stateIsTrue;
        }
        isValid = stateIsTrue || isValid;
      }
      return isValid;
    });
    successes.forEach(function(element, index, array) {
      return returnValue = element.success.call(_this, _this.getInput()) && returnValue;
    });
    return returnValue;
  };

  return Validator;

})();

sectionCounter = 1;

Section = (function() {

  function Section() {
    this.insertBefore = __bind(this.insertBefore, this);

    this.appendTo = __bind(this.appendTo, this);

    this.addOption = __bind(this.addOption, this);

    this.info = __bind(this.info, this);

    this.header = __bind(this.header, this);
    this.element = document.createElement("section");
    this.headerElement = document.createElement("h3");
    this.infoElement = document.createElement("p");
    this.infoElement.setAttribute("class", "info");
    this.header("Section " + (sectionCounter++));
    this.info("");
    this.options = [];
  }

  Section.prototype.header = function(header) {
    if (typeof header === "undefined") {
      return this._header;
    } else if (typeof header !== "string") {
      throw new Error("Option#header parameter \"header\" must be a string!");
      return;
    }
    this._header = header;
    this.headerElement.textContent = header;
    return this;
  };

  Section.prototype.info = function(info) {
    if (typeof info === "undefined") {
      return this._info;
    } else if (typeof info !== "string") {
      throw new Error("Option#info parameter \"info\" must be a string!");
      return;
    }
    this._info = info;
    this.infoElement.innerHTML = info;
    return this;
  };

  Section.prototype.addOption = function(option) {
    if (typeof option === "undefined") {
      throw new Error("Option#addOption requires an Option object as a parameter!");
    } else {
      this.options.push(option);
    }
    return this;
  };

  Section.prototype.appendTo = function(container) {
    var option, reference, _i, _len, _ref;
    _ref = this.options;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      option = _ref[_i];
      option.appendTo(this.element);
    }
    reference = this.options.length > 0 ? this.options[0].element : null;
    this.element.insertBefore(this.infoElement, reference);
    this.element.insertBefore(this.headerElement, this.infoElement);
    container.appendChild(this.element);
    return this;
  };

  Section.prototype.insertBefore = function(reference, parent) {
    var option, _i, _len, _ref;
    _ref = this.options;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      option = _ref[_i];
      option.appendTo(this.element);
    }
    reference = this.options.length > 0 ? this.options[0].element : null;
    this.element.insertBefore(this.infoElement, reference);
    this.element.insertBefore(this.headerElement, this.infoElement);
    parent.insertBefore(this.element, reference);
    return this;
  };

  return Section;

})();

optionCounter = 0;

Option = (function() {

  function Option() {
    this.appendTo = __bind(this.appendTo, this);

    this.info = __bind(this.info, this);

    this.default_value = __bind(this.default_value, this);

    this.setAttributes = __bind(this.setAttributes, this);

    this.type = __bind(this.type, this);

    this.id = __bind(this.id, this);

    this.title = __bind(this.title, this);
    this.element = document.createElement("div");
    this.element.setAttribute("class", "option");
    this.label = document.createElement("label");
    this.input = document.createElement("input");
    this.infoElement = document.createElement("p");
    this.infoElement.setAttribute("class", "info");
    this.title("Option " + (optionCounter++));
    this.id("option_" + (optionCounter++));
    this.info("");
    this.validator = new Validator();
  }

  Option.prototype.title = function(title) {
    if (typeof title === "undefined") {
      return this._title;
    } else if (typeof title !== "string") {
      throw new Error("Option#title parameter \"title\" must be a string!");
      return;
    }
    this._title = title;
    this.label.textContent = title;
    return this;
  };

  Option.prototype.id = function(id) {
    if (typeof id === "undefined") {
      return this._id;
    } else if (typeof id !== "string") {
      throw new Error("Option#id parameter \"id\" must be a string!");
      return;
    }
    this._id = id;
    this.element.setAttribute("id", "" + id + "_wrapper");
    this.input.setAttribute("id", id);
    this.label.setAttribute("for", id);
    return this;
  };

  Option.prototype.type = function(type) {
    if (typeof type === "undefined") {
      return this._type;
    } else if (typeof type !== "string") {
      throw new Error("Option#type parameter \"type\" must be a string!");
      return;
    }
    this._type = type;
    switch (type) {
      case "toggle":
        this.input.setAttribute("type", "checkbox");
        break;
      case "choice":
        this.input.setAttribute("type", "radio");
        break;
      case "textbox":
        this.input.setAttribute("type", "text");
        break;
      case "number":
        this.input.setAttribute("type", "number");
        break;
      case "slider":
        this.input.setAttribute("type", "range");
        break;
      case "password":
        this.input.setAttribute("type", "password");
        break;
      default:
        this.input.setAttribute("type", "text");
    }
    return this;
  };

  Option.prototype.setAttributes = function(attributes) {
    var attr;
    if (typeof attributes !== "object") {
      throw new Error("Option#setAttribute requires an object as a parameter!");
    }
    for (attr in attributes) {
      if (attributes.hasOwnProperty(attr)) {
        this.input.setAttribute(attr, attributes[attr]);
      }
    }
    return this;
  };

  Option.prototype.default_value = function(default_value) {
    if (typeof default_value === "undefined") {
      return this._default_value;
    }
    this._default_value = default_value;
    switch (this._type) {
      case "toggle":
        this.input.checked = true;
        break;
      default:
        this.input.value = default_value;
    }
    return this;
  };

  Option.prototype.info = function(info) {
    if (typeof info === "undefined") {
      return this.info;
    } else if (typeof info !== "string") {
      throw new Error("Option#info parameter \"info\" must be a string!");
      return;
    }
    this._info = info;
    this.infoElement.innerHTML = info;
    return this;
  };

  Option.prototype.appendTo = function(container) {
    this.element.appendChild(this.infoElement);
    this.element.insertBefore(this.input, this.infoElement);
    this.input.insertAdjacentHTML("afterend", " ");
    this.element.insertBefore(this.label, this.input);
    this.label.insertAdjacentHTML("afterend", ": ");
    container.appendChild(this.element);
    return this;
  };

  return Option;

})();

toggleCounter = 1;

Toggle = (function(_super) {

  __extends(Toggle, _super);

  function Toggle() {
    this.appendTo = __bind(this.appendTo, this);

    this.addOption = __bind(this.addOption, this);

    this.addSection = __bind(this.addSection, this);
    this.element = document.createElement("div");
    this.element.setAttribute("class", "toggle");
    this.label = document.createElement("label");
    this.input = document.createElement("input");
    this.infoElement = document.createElement("p");
    this.infoElement.setAttribute("class", "info");
    this.options = [];
    this.sections = [];
    this.type("toggle");
    this.title("Toggle " + (toggleCounter++));
    this.id("toggle_" + (toggleCounter++));
  }

  Toggle.prototype.addSection = function(section) {
    if (typeof section === "undefined") {
      throw new Error("Option#addSection requires a Section object as a parameter!");
    } else {
      this.sections.push(section);
    }
    return this;
  };

  Toggle.prototype.addOption = function(option) {
    if (typeof option === "undefined") {
      throw new Error("Option#addOption requires an Option object as a parameter!");
    } else {
      this.options.push(option);
    }
    return this;
  };

  Toggle.prototype.appendTo = function(container) {
    var option, section, top, _i, _j, _len, _len1, _ref, _ref1;
    top = document.createElement("div");
    top.setAttribute("class", "titlebar");
    top.appendChild(this.label);
    top.appendChild(this.input);
    this.element.appendChild(top);
    this.element.appendChild(this.infoElement);
    container.appendChild(this.element);
    _ref = this.options;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      option = _ref[_i];
      option.appendTo(this.element);
    }
    _ref1 = this.sections;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      section = _ref1[_j];
      section.appendTo(this.element);
    }
    return this;
  };

  return Toggle;

})(Option);

renderOptions = function(options_json, container) {
  var option, option2, option2_json, option_json, section, section_json, submit_btn, toggle, toggle_json, toggles, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3;
  toggles = [];
  container.innerHTML = "";
  _ref = options_json.toggles;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    toggle_json = _ref[_i];
    toggle = new Toggle();
    toggle.title(toggle_json.title).id(toggle_json.id).type(toggle_json.type).default_value(toggle_json.default_value).info(toggle_json.info).input.addEventListener("change", toggle_json.on_change, false);
    _ref1 = toggle_json.options;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      option_json = _ref1[_j];
      option = new Option();
      option.title(option_json.title).id(option_json.id).type(option_json.type).default_value(option_json.default_value).info(option_json.info).setAttributes(option_json.attributes);
      option.validator.setInput(option_json.validation_input);
      option.validator.defineRules(option_json.validation_rules);
      option.validator.setResponses(option_json.validation_responses);
      option.input.addEventListener("change", option_json.on_change, false);
      toggle.addOption(option);
    }
    _ref2 = toggle_json.sections;
    for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
      section_json = _ref2[_k];
      section = new Section();
      section.header(section_json.header).info(section_json.info);
      _ref3 = section_json.options;
      for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
        option2_json = _ref3[_l];
        option2 = new Option();
        option2.title(option2_json.title).id(option2_json.id).type(option2_json.type).default_value(option2_json.default_value).info(option2_json.info).setAttributes(option2_json.attributes);
        option2.validator.setInput(option2_json.validation_input);
        option2.validator.defineRules(option2_json.validation_rules);
        option2.validator.setResponses(option2_json.validation_responses);
        option2.input.addEventListener("change", option2_json.on_change, false);
        section.addOption(option2);
      }
      toggle.addSection(section);
    }
    toggle.appendTo(container);
    toggles.push(toggle);
  }
  submit_btn = document.getElementById("save");
  submit_btn.addEventListener("click", function(e) {
    return options_json.on_submit(toggles);
  }, false);
  return toggles;
};

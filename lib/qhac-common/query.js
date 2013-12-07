// Aliases for common DOM traversal functions



HTMLElement.prototype.find = HTMLElement.prototype.querySelectorAll;

HTMLElement.prototype.attr = HTMLElement.prototype.getAttribute;

HTMLElement.prototype.findClass = HTMLElement.prototype.getElementsByClassName;

HTMLElement.prototype.findTag = HTMLElement.prototype.getElementsByTagName;

NodeList.prototype.splice = function (idx) {
    var newList = [];

    for (var i = idx; i < this.length; i++) {
        newList[newList.length] = this[i];
    }

    return newList;
};

NodeList.prototype.map = function (f) {
    var newList = [];

    for (var i = 0; i < this.length; i++) {
        newList[i] = f(this[i]);
    }

    return newList;
};

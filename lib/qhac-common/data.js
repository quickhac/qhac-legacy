/** Map through all properties that belong to an object, returning an array.. */
var mapOwnProperties = function (obj, f) {
	if (typeof f !== 'function') return;

    var newList = [];

    for (var k in obj)
        if (Object.prototype.hasOwnProperty.call(obj, k))
            newList[newList.length] = f(k, obj[k]);

    return newList;
};

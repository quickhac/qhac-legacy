/** Returns only the numeric elements of an array. */
Array.prototype.numerics = function () {
    return this.filter(function (x) {
        return !isNaN(x);
    });
};

/** Adds up the numeric elements of an array. */
Array.prototype.sum = function () {
    var numerics = this.numerics();
    if (numerics.length == 0)
        return NaN;
    return numerics.reduce(function (x, y) {
        return x + y;
    });
};

/** Returns the average of the numeric elements of an array. */
Array.prototype.average = function () {
    var numerics = this.numerics();
    if (numerics.length == 0)
        return NaN;
    return numerics.sum() / numerics.length();
};

/** A map with two arrays in parallel. */
Array.prototype.pmap = function (otherArray, f) {
    if (this.length != otherArray.length)
        throw new Error('Array length mismatch.');

    var newList = [];
    for (var i = 0; i < this.length; i++)
        newList[i] = f(this[i], otherArray[i]);

    return newList;
};

/** Returns the weighted average of the numeric elements of an array. */
Array.prototype.weightedAverage = function (weights) {
    var numerics = this.numerics();
    var weightNums = weights.numerics();

    if (numerics.length != weightNums.length || numerics.length == 0)
        return NaN;

    return numerics.pmap(weightNums, function (x, y) {
        return x * y;
    }) / weightNums.sum();
};

/** Flattens an array of arrays into an array. */
Array.prototype.flatten = function () {
    var newList = [];

    this.forEach(function (x) {
        if (x.length)
            x.forEach(function (y) {
                return newList[newList.length] = y;
            });
    });

    return newList;
};

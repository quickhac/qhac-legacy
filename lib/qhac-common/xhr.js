/// <reference path='data.ts'/>
/** A helper class for making XMLHttpRequests. */
var XHR = (function () {
    /** Creates a new XHR and returns itself for chaining */
    function XHR(method, url) {
        if (method !== 'GET' && method !== 'POST')
            throw new Error('Unsupported HTTP request type: ' + method);

        this._xhr = new XMLHttpRequest();
        this._method = method;
        this._url = url;
        return this;
    }
    /** Calls 'f' with arguments if it is a function, otherwise does nothing. */
    XHR._maybeCall = function (f, _this, args) {
        if (typeof f === 'function')
            return f.apply(_this, args);
    };

    /** Encodes a parameter from a key/value pair. */
    XHR._encodeParameter = function (key, value) {
        // null -> empty string
        if (value === null)
            value = '';

        // encode
        return encodeURIComponent(key) + '=' + encodeURIComponent(value);
    };

    /** Handles state changes in the backing XHR */
    XHR._stateChangeHandler = function (_this) {
        return function () {
            if (_this._xhr.readyState === 4) {
                if (_this._xhr.status === 200) {
                    XHR._maybeCall(_this._success, _this._xhr, [_this._xhr.responseText, _this._xhr.responseXML]);
                }
            }
        };
    };

    /** Cretaes a parameter string from a hash of parameters. */
    XHR._createParamsString = function (params) {
        if (typeof params === 'undefined')
            return '';
        return mapOwnProperties(params, XHR._encodeParameter).join('&');
    };

    /** Sends a GET request with the specified parameters. */
    XHR.prototype._sendGet = function () {
        // only add ? if params exist
        var params = XHR._createParamsString(this._params);
        if (params !== '')
            params = '?' + params;
        this._xhr.open('GET', this._url + params, true);
        this._xhr.onreadystatechange = XHR._stateChangeHandler(this);
        this._xhr.send(null);
    };

    /** Sends a POST request with the specified parameters. */
    XHR.prototype._sendPost = function () {
        // open url
        this._xhr.open('Post', this._url, true);
        this._xhr.onreadystatechange = XHR._stateChangeHandler(this);

        var paramString = XHR._createParamsString(this._params);

        // send the proper header information along with the request
        this._xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        // send params
        this._xhr.send(paramString);
    };

    /** Sets the callback for when the request succeeds. */
    XHR.prototype.success = function (f) {
        this._success = f;
        return this;
    };

    /** Sets the callback for when the request fails. */
    XHR.prototype.fail = function (f) {
        this._xhr.onerror = function (ev) {
            return XHR._maybeCall(f, this, [ev]);
        };
        return this;
    };

    /** Sets the parameters to be passed to the server. */
    XHR.prototype.params = function (params) {
        this._params = params;
        return this;
    };

    /** Sends an XHR */
    XHR.prototype.send = function () {
        if (this._method === 'GET')
            this._sendGet();
        else
            this._sendPost();
    };
    return XHR;
})();

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var proto_1 = require("./proto");
var Error_1 = require("./Error");
var Client = /** @class */ (function () {
    function Client(host, wsHost) {
        this.host = host;
        this.wsHost = wsHost;
        this.debug = true;
    }
    Client.prototype.doRequest = function (r) {
        var _this = this;
        var host = r.host != null ? r.host : this.host;
        return new Promise(function (resolve, reject) {
            var xmlhttp = new XMLHttpRequest();
            var uri = host + _this.uri_query(r.path, r.params);
            xmlhttp.open(r.method, uri, true);
            xmlhttp.responseType = 'arraybuffer';
            xmlhttp.onreadystatechange = function (e) {
                if (xmlhttp.readyState != 4 || xmlhttp.status == 0) {
                    return;
                }
                if (_this.debug) {
                    console.log("response(" + r.method + "," + host + r.path + "): ", xmlhttp.status);
                }
                if (xmlhttp.status != r.code) {
                    if (xmlhttp.response == null || xmlhttp.response.byteLength == 0) {
                        return reject(new Error_1.Error({
                            kind: Error_1.SDKKind.BadStatusCode,
                            code: xmlhttp.status
                        }));
                    }
                    var r_1;
                    try {
                        var err = proto_1.errors.ProtoError.decode(new Uint8Array(xmlhttp.response));
                        var payload = void 0;
                        if (err.payload != null) {
                            var X = proto_1.errors[err.payload.type_url.split('.').pop()];
                            payload = X.decode(err.payload.value);
                        }
                        r_1 = new Error_1.Error({
                            kind: err.kind,
                            code: err.code,
                            payload: payload
                        });
                    }
                    catch (e) {
                        r_1 = new Error_1.Error({
                            kind: Error_1.SDKKind.BadStatusCode,
                            code: xmlhttp.status,
                            payload: new TextDecoder().decode(xmlhttp.response)
                        });
                    }
                    return reject(r_1);
                }
                if (r.response == null) {
                    if (xmlhttp.response == null || xmlhttp.response.length == 0) {
                        console.log("WARNING: response is not used", xmlhttp.response);
                    }
                    return resolve();
                }
                var resp;
                try {
                    resp = r.response(new Uint8Array(xmlhttp.response));
                }
                catch (e) {
                    return reject(new Error_1.Error({
                        kind: Error_1.SDKKind.BadResponse,
                        payload: { error: e, response: xmlhttp.response }
                    }));
                }
                resolve(resp);
            };
            xmlhttp.onerror = function (e) {
                reject(new Error_1.Error({
                    kind: Error_1.SDKKind.NetworkException,
                    payload: { error: e }
                }));
            };
            var body = null;
            if (_this.debug) {
                console.log("request(" + r.method + "," + host + r.path + ")");
            }
            if (r.request != null) {
                body = r.request();
            }
            try {
                if (r.before != null) {
                    r.before(xmlhttp, body);
                }
            }
            catch (e) {
                return reject(new Error_1.Error({
                    kind: Error_1.SDKKind.SDKInternalError,
                    payload: { error: e },
                }));
            }
            xmlhttp.send(body);
        });
    };
    Client.prototype.uri_query = function (url, params) {
        if (params == null) {
            return url;
        }
        var uriParams = Object.keys(params).map(function (key) {
            var x = key + "=";
            return ((params[key].constructor === Array) ?
                x + params[key].map(encodeURIComponent).join("&" + x) :
                x + encodeURIComponent(params[key]));
        }).join("&");
        if (uriParams.length == 0) {
            return url;
        }
        return url + "?" + uriParams;
    };
    return Client;
}());
exports.Client = Client;
//# sourceMappingURL=HTTP.js.map
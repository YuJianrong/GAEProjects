var HTTP = new Object;
// This is a list of XMLHttpRequest-creation factory functions to try
HTTP._factories = [
    function() { return new XMLHttpRequest(); },
    function() { return new ActiveXObject("Msxml2.XMLHTTP"); },
    function() { return new ActiveXObject("Microsoft.XMLHTTP"); }
];

// When we find a factory that works, store it here.
HTTP._factory = null;

// Create and return a new XMLHttpRequest object.
//
// The first time we're called, try the list of factory functions until
// we find one that returns a non-null value and does not throw an
// exception. Once we find a working factory, remember it for later use.
//
HTTP.newRequest = function() {
    if (HTTP._factory != null) return HTTP._factory();

    for(var i = 0; i < HTTP._factories.length; i++) {
        try {
            var factory = HTTP._factories[i];
            var request = factory();
            if (request != null) {
                HTTP._factory = factory;
                return request;
            }
        }
        catch(e) {
            continue;
        }
    }
    // If we get here, none of the factory candidates succeeded,
    // so throw an exception now and for all future calls.
    HTTP._factory = function() {
        throw new Error("XMLHttpRequest not supported");
    }
    HTTP._factory(); // Throw an error
}

HTTP.post = function(url, values, callback, errorHandler ) {
    var request = HTTP.newRequest();
    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            if (request.status == 200) {
                callback(request.responseXML);
            }
            else {
                if (errorHandler) 
                    errorHandler(request.status, request.statusText);
                else 
                    callback(null);
            }
        }
    }
    request.open("POST", url);
    request.setRequestHeader("Content-Type",
                             "application/x-www-form-urlencoded");
    request.send("data="+encodeURIComponent(values));
    return request;
};

HTTP.post_Sync = function(url, values, errorHandler ) {
    var request = HTTP.newRequest();
    request.open("POST", url, false);
    request.setRequestHeader("Content-Type",
                             "application/x-www-form-urlencoded");
    request.send("data="+encodeURIComponent(values));

    if (request.status !== 200) {
        if (errorHandler) 
            errorHandler(request.status, request.statusText, request.responseText);
        else 
            callback(null);
        return null;
    }
    return request.responseXML;
};

HTTP.get_Sync = function(url, values, errorHandler ) {
    var request = HTTP.newRequest();
    request.open("GET", url, false);
    request.setRequestHeader("Content-Type",
                             "application/x-www-form-urlencoded");
    request.send("data="+encodeURIComponent(values));

    if (request.status !== 200) {
        if (errorHandler) 
            errorHandler(request.status, request.statusText, request.responseText);
        else 
            callback(null);
        return null;
    }
    return request.responseXML;
};


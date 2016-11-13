function loadShaderFile(url, data, callback, errorCallback) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);

    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            if (request.status == 200) {
                callback(request.responseText, data)
            } else {
                errorCallback(url);
            }
        }
    };

    request.send(null);    
}

function loadShaderFiles(urls, callback, errorCallback) {
    var numUrls = urls.length;
    var numComplete = 0;
    var result = [];

    function partialCallback(text, urlIndex) {
        result[urlIndex] = text;
        numComplete++;

        if (numComplete == numUrls) {
            callback(result);
        }
    }

    for (var i = 0; i < numUrls; i++) {
        loadShaderFile(urls[i], i, partialCallback, errorCallback);
    }
}
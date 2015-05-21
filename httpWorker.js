//simple XHR request in pure JavaScript
function load(url, callback) {
    var xhr;

    if (typeof XMLHttpRequest !== 'undefined') xhr = new XMLHttpRequest();
    else {
        var versions = ["MSXML2.XmlHttp.5.0",
            "MSXML2.XmlHttp.4.0",
            "MSXML2.XmlHttp.3.0",
            "MSXML2.XmlHttp.2.0",
            "Microsoft.XmlHttp"
        ]

        for (var i = 0, len = versions.length; i < len; i++) {
            try {
                xhr = new ActiveXObject(versions[i]);
                break;
            } catch (e) {}
        } // end for
    }

    xhr.onreadystatechange = ensureReadiness;

    function ensureReadiness() {
        if (xhr.readyState < 4) {
            return;
        }

        if (xhr.status !== 200) {
            return;
        }

        // all is well	
        if (xhr.readyState === 4) {
            callback(xhr);
        }
    }

    xhr.open('GET', url, true);
    xhr.send('');
	
	//this is for post request
	//xhr.open("POST", url, true);
	//xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
	//xhr.send(someStuff);
	
}



self.onmessage = function(e) {

    var data = e.data;
    if (typeof(data) === "undefined") return;

    //and here is how you use it to load a json file with ajax
    load(data.path, function(xhr) {
        self.postMessage(xhr.responseText);
    });

};


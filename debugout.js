/**
 * debugout generates a text file from your logs, which can be timestamp and downloaded. 
 * This can sychronously show console logs, debugs, info, warn, errors while saving the date in string format to 
 * your text file. 
 *
 * Works with multiple arguments pass, just like any other console. Currently in Chrome it supports DOM elements
 *
 * BUG:
 * In IE, when a DOM element is passed, it might cause a script error. 
 *  
 * 
 */

(function(window) {

    var opts = {
            filename: 'debugout.txt',
            tailNumLines: '100', //not created
            localStorage: false, //not created
            useTimeStamp: true,
            showConsoles: false,
        },
        output = "", //set the string of the output
        slice = [].slice,
        worker = null,
        isArray = Array.isArray;

    var debugout = function() {
        opts = baseExtend(opts, slice.call(arguments, 1), false);
    }


    debugout.prototype.log = consoleLog('log')
    debugout.prototype.error = consoleLog('error')
    debugout.prototype.warn = consoleLog('warn')
    debugout.prototype.info = consoleLog('info')
    debugout.prototype.debug = function() {
        var fn = consoleLog('debug');

        return function() {
            if (debug) {
                fn.apply(self, arguments);
            }
        };

    }




    /**
     * Print the logs into a file, which it will aler the browser download
     * @param  {[type]} filename [description]
     * @return {[type]}          [description]
     */
    debugout.prototype.print = function(filename) {
        var file = "data:text/plain;charset=utf-8,",
            filename = arguments.length ? arguments[0] : opts.filename,
            logFile = this.getLog();

        if (!logFile) return;

        if (window.ActiveXObject || "ActiveXObject" in window) { //for window

            var ifrm = document.createElement("IFRAME");
            ifrm.setAttribute("id", "myFrame");
            ifrm.style.display = "none";

            document.body.appendChild(ifrm) //oh yeah IE dont support base64 hyperlink
            setTimeout(function() {
                ifrm = (ifrm.contentWindow) ? ifrm.contentWindow : (ifrm.contentDocument.document) ? ifrm.contentDocument.document : ifrm.contentDocument;
                ifrm.document.open("text/html");
                ifrm.document.write(logFile);
                ifrm.document.close();
                ifrm.focus()
                ifrm.document.execCommand('SaveAs', true, filename);
                setTimeout(function() {
                    document.body.removeChild(ifrm) //oh yeah IE dont support base64 hyperlink
                }, 1)
            }, 1)

        } else {
            var encoded = encodeURIComponent(logFile);
            file += encoded;
            var a = document.createElement('a');
            a.href = file;
            a.target = '_blank';
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
        }

    }



    /**
     * Return log into string
     * @return {[type]} [description]
     */
    debugout.prototype.getLog = function() {
        return output;
    }


    function buildLog() {

        var args = [],
            timeStamp = "";

        if (opts.useTimeStamp) {
            var d = new Date();
            timeStamp = "\[" + String(d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear() + ":" + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds()) + "\]:";
        }

        for (var i in arguments) {
            if (typeof(arguments[i]) === "string") {
                args.push(arguments[i])
            } else {
                if (!arguments[i].parentNode) {
                    args.push(JSON.stringify(arguments[i]));
                } else {
                    try {
                        args.push(String(arguments[i].outerHTML));
                    } catch (e) {
                        args.push(JSON.stringify(e));
                    }
                }
            }
        }


        output += timeStamp + args.join(",") + "\r\n";

    }


    function baseExtend(dst, objs, deep) {
        var h = dst.$$hashKey;

        for (var i = 0, ii = objs.length; i < ii; ++i) {
            var obj = objs[i];
            if (!isObject(obj) && !isFunction(obj)) continue;
            var keys = Object.keys(obj);
            for (var j = 0, jj = keys.length; j < jj; j++) {
                var key = keys[j];
                var src = obj[key];

                if (deep && isObject(src)) {
                    if (!isObject(dst[key])) dst[key] = isArray(src) ? [] : {};
                    baseExtend(dst[key], [src], true);
                } else {
                    dst[key] = src;
                }
            }
        }

        return dst;
    }


    function isObject(value) {
        // http://jsperf.com/isobject4
        return value !== null && typeof value === 'object';
    }

    function isFunction(value) {
        return typeof value === 'function';
    }

    function formatError(arg) {
        if (arg instanceof Error) {
            if (arg.stack) {
                arg = (arg.message && arg.stack.indexOf(arg.message) === -1) ? 'Error: ' + arg.message + '\n' + arg.stack : arg.stack;
            } else if (arg.sourceURL) {
                arg = arg.message + '\n' + arg.sourceURL + ':' + arg.line;
            }
        }
        return arg;
    }


    function consoleLog(type) {

        var console = eval(window.console) || {},
            logFn = console[type] || console.log || noop,
            hasApply = false;

        // Note: reading logFn.apply throws an error in IE11 in IE8 document mode.
        // The reason behind this is that console.log has type "object" in IE8...
        try {
            hasApply = !!logFn.apply;
        } catch (e) {}

        if (hasApply) {
            return function() {
                var args = [];

                for (var i in arguments) {
                    args.push(formatError(arguments[i]));

                }


                buildLog.apply(this, args)

                if (!opts.showConsoles) return;
                return logFn.apply(console, args);
            };
        }

        buildLog.apply(this, arguments)
        if (!opts.showConsoles) return;
        // we are IE which either doesn't have window.console => this is noop and we do nothing,
        // or we are IE where console.log doesn't have apply so we log at least first 2 args
        return function(arg1, arg2) {
            logFn(arg1, arg2 == null ? '' : arg2);
        };
    }


    //tie this to the window
    window.bugout = new debugout();

})(window)

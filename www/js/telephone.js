//has tests
var telephone = {
    canonicalize: function(telNo) {
        log.trace("canonicalizing");
        var result = telNo.replace(new RegExp("\\D*","g"),'');

        if (result.startsWith('00')) {
            result = result.substr(2,result.length);
        }

        if (result.startsWith('44') || result.startsWith('0') || result.length <= 4) {
            if (result.startsWith('44')) {
                result = result.substr(2,result.length);
            }
            if (result.startsWith('0')) {
                result = result.substr(1, result.length);
            }
            result = "44".concat(result);
        }
        log.trace("about to canonicalized");
        return result;
    }
};
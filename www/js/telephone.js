//has tests
var telephone = {
    canonicalize: function(telNo) {
        var result = telNo.replace(/\D*/g,'');

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
        return result;
    }
};
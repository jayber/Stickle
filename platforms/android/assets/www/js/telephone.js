//has tests
var telephone = {

    startsWith: function(str, target) {
      return str.indexOf(target) == 0;
    },

    canonicalize: function(telNo) {
        var result = telNo.replace(new RegExp("\\D*","g"),'');

        if (telephone.startsWith(result,'00')) {
            result = result.substr(2,result.length);
        }

        if (telephone.startsWith(result, '44') || telephone.startsWith(result, '0') || result.length <= 4) {
            if (telephone.startsWith(result, '44')) {
                result = result.substr(2,result.length);
            }
            if (telephone.startsWith(result, '0')) {
                result = result.substr(1, result.length);
            }
            result = "44".concat(result);
        }
        return result;
    }
};
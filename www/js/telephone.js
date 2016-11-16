//has tests
var telephone = {
    canonicalize: function(telNo) {
        var countryCode = "GB";
        if (userHandler.countryCode) {
            countryCode = userHandler.countryCode;
        }
        log.trace("country code is: "+countryCode);
        return canonicalForm(telNo, countryCode);
    }
};
function polyFillMobileAPIs() {
    
    ContactFindOptions = function () {
    };
    
    if (navigator.contacts === undefined) {
        navigator.contacts = {
            fieldType: {displayName: "displayName", name: "name", phoneNumbers: "phoneNumbers"},
            find: function (fields, success, failure, options) {
                success([{
                    displayName: "test",
                    stickler: false,
                    phoneNumbers: [{type: "mobile", value: "07791879023"}]
                }, {
                    displayName: "test2",
                    stickler: true,
                    phoneNumbers: [{type: "mobile", value: "08991872567"}, {type: "home", value: "02035678906"}]
                }, {
                    displayName: "(mobile) Test Dev",
                    stickler: true,
                    phoneNumbers: [{type: "mobile", value: "1111"}]
                }, {
                    displayName: "(mobile) Test App",
                    stickler: true,
                    phoneNumbers: [{type: "mobile", value: "6666"}]
                }])
            }
        };
    }
}
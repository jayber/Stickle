function polyFillMobileAPIs() {

    ContactFindOptions = function () {
    };

    Connection = function () {};

    if (navigator.contacts === undefined) {
        navigator.contacts = {
            fieldType: {displayName: "displayName", name: "name", phoneNumbers: "phoneNumbers"},
            find: function (fields, success, failure, options) {
                success([{
                    displayName: "test",
                    stickler: false,
                    phoneNumbers: [{type: "mobile", value: "07799416709"}]
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
                    phoneNumbers: [{type: "mobile", value: "3333"}]
                }])
            }
        };
    }

    if (window.plugins === undefined) {
        window.plugins = {
            CallNumber: {
                callNumber: function (success, failure, number) {
                    success();
                }
            }
        }
    }

    if (typeof PushNotification === 'undefined') {
        PushNotification = {
            init: function (data) {
                return {
                    on: function (name, funct) {
                        funct({
                            registrationId: "test-push-regid"
                        });
                    }
                }
            }
        };
    }
}
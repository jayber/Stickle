function polyFillMobileAPIs() {

    ContactFindOptions = function () {
    };

    Connection = function () {};

    if (navigator.contacts === undefined) {
        navigator.contacts = {
            fieldType: {displayName: "displayName", name: "name", phoneNumbers: "phoneNumbers"},
            find: function (fields, success, failure, options) {
                success([{
                    displayName: "Kilgore Trout",
                    stickler: false,
                    phoneNumbers: [{type: "mobile", value: "07797814997"}]
                }, {
                    displayName: "Clay Easton",
                    stickler: true,
                    phoneNumbers: [{type: "mobile", value: "08991872567"}, {type: "home", value: "02035678906"}]
                }, {
                    displayName: "East Bay Ray",
                    stickler: true,
                    phoneNumbers: [{type: "mobile", value: "2222"}]
                    //phoneNumbers: [{type: "mobile", value: "0278355602"}]
                }, {
                    displayName: "Tony Hancock",
                    stickler: true,
                    phoneNumbers: [{type: "mobile", value: "01418885620"}]
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
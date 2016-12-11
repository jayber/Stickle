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
                    displayName: "Alba Veronica",
                    stickler: false,
                    phoneNumbers: [{type: "mobile", value: "07678006123"}]
                }, {
                    displayName: "Canada Goose",
                    stickler: false,
                    phoneNumbers: [{type: "mobile", value: "07799887123"}]
                }, {
                    displayName: "Hilary Campion",
                    stickler: false,
                    phoneNumbers: [{type: "mobile", value: "07777895546"}]
                }, {
                    displayName: "Roseanne Hillmore",
                    stickler: false,
                    phoneNumbers: [{type: "mobile", value: "07891178261"}]
                }, {
                    displayName: "Charlie Bright",
                    stickler: false,
                    phoneNumbers: [{type: "mobile", value: "07712996181"}]
                }, {
                    displayName: "Octavia Ballantine",
                    stickler: false,
                    phoneNumbers: [{type: "mobile", value: "07797814997"}]
                }, {
                    displayName: "Vladimir Kundalini",
                    stickler: false,
                    phoneNumbers: [{type: "mobile", value: "07789087614"}]
                }, {
                    displayName: "Clay Easton",
                    stickler: true,
                    phoneNumbers: [{type: "mobile", value: "08991872567"}, {type: "home", value: "02035678906"}]
                } ,{
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
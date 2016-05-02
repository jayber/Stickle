var contactsProcessor = {

    populateContacts: function (model, $resource) {
        var fields = [''];
        var options = new ContactFindOptions();
        options.filter = "";
        options.multiple = true;
        options.desiredFields = [navigator.contacts.fieldType.displayName,
            navigator.contacts.fieldType.name,
            navigator.contacts.fieldType.phoneNumbers];
        navigator.contacts.find(fields,
            function (contacts) {
                model.contacts = [];
                model.contactsMap = {};
                contactsProcessor.processContacts(contacts, model, $resource)
            },
            function (err) {
                log.error("Error", err);
            }, options);
    },

    processContacts: function (contacts, model, $resource) {
        var cleanContacts = contactsProcessor.filterOnPhoneAndSortByNameAlphabet(contacts);

        model.$apply(function () {
            cleanContacts.forEach(function (contact) {
                contactsProcessor.processContact(contact, model);
            });
        });
    },

    filterOnPhoneAndSortByNameAlphabet: function (contacts) {
        return contacts.filter(function (contact) {
            return contact.phoneNumbers != null
        }).sort(function (a, b) {
            if (a.displayName < b.displayName)
                return -1;
            else if (a.displayName > b.displayName)
                return 1;
            else
                return 0;
        });
    },

    processContact: function (contact, model) {
        contact = contactsProcessor.dedupePhoneNumbers(contact);
        contact.stickler = false;
        contactsProcessor.storeAndDisplayIfNew(contact, model);
    },

    dedupePhoneNumbers: function (contact) {
        if (contact.phoneNumbers.length > 1) {
            var newNumbers = [];
            contact.phoneNumbers.forEach(function (pnum) {
                if (!newNumbers.some(function (currentValue) {
                        return pnum.value == currentValue.value && pnum.type == currentValue.type;
                    })) {
                    newNumbers.push(pnum);
                }
            });
            contact.phoneNumbers = newNumbers;
        }
        return contact;
    },

    storeAndDisplayIfNew: function (contact, model) {
        model.contacts.push(contact);
        model.contactsMap[contact.phoneNumbers[0].value] = contact;
    },

    makeCall: function () {
        window.plugins.CallNumber.callNumber(function () {
            alert('success');
        }, function () {
            alert('error');
        }, 0);
    }
};

var userHandler = {

    phoneNumberRegisteredKey: "registered",
    userIdKey: "userId",
    phoneNumberRegistered: false,
    phoneNumberKey: "phonenumber",
    validationMessage: "<span class='validationMessagePrompt'>enter valid phone number</span>",
    
    stickle: function (contact) {
        log.trace("stickling: " + contact.displayName + "; stickled: " + contact.stickled);
        if (contact.stickled) {
            context.stickleOn(userHandler.phoneNumber, contact.phoneNumbers[0].value);
        } else {
            context.stickleOff(userHandler.phoneNumber, contact.phoneNumbers[0].value);
        }
    },
    
    phonePrompter: function ($ionicPopup, $resource) {
        return function () {
            userHandler.promptPhone($ionicPopup,
                userHandler.phoneNumber,
                false,
                function (input) {
                    try {
                        log.debug("Input: " + input);
                        userHandler.registerOnServer($resource);
                    } catch (err) {
                        log.error("Error", err);
                    }
                })
        };
    },

    promptPhone: function ($ionicPopup, defaultVal, inValid, registerCallback) {
        return $ionicPopup.prompt({
            title: 'Phone Number',
            inputType: 'tel',
            inputPlaceholder: 'enter mobile phone number',
            defaultText: defaultVal,
            subTitle: inValid ? userHandler.validationMessage : null,
            maxLength: 12
        }).then(function (input) {
            if (input !== undefined) {
                if (input.length < 4) {
                    userHandler.promptPhone($ionicPopup, input, true);
                } else {
                    if (input !== userHandler.phoneNumber) {
                        userHandler.phoneNumber = input;
                        window.localStorage.setItem(userHandler.phoneNumberKey, input);
                        window.localStorage.setItem(userHandler.phoneNumberRegisteredKey, "false");
                        if (registerCallback !== undefined) {
                            registerCallback(input);
                        }
                    }
                }
            } else if (defaultVal === "") {
                userHandler.promptPhone($ionicPopup, "", true);
            }
        });
    },

    logon: function ($ionicPopup, $timeout, $resource) {
        var promise = $timeout();
        userHandler.phoneNumber = window.localStorage.getItem(userHandler.phoneNumberKey);
        if (userHandler.phoneNumber == null || userHandler.phoneNumber.length < 4) {
            promise = this.promptPhone($ionicPopup, "", false);
        }

        userHandler.phoneNumberRegistered = window.localStorage.getItem(userHandler.phoneNumberRegisteredKey) == "true";
        if (!userHandler.phoneNumberRegistered) {
            promise.then(function () {
                try {
                    userHandler.registerOnServer($resource);
                } catch (err) {
                    log.error("Error", err);
                }
            });
        }
    },

    registerOnServer: function ($resource) {
        var User = $resource('http://:server/api/user/:phoneNum', {
            server: context.serverUrl,
            phoneNum: "@phoneNum"
        });
        log.debug("attempting to register");
        User.save({phoneNum: userHandler.phoneNumber}, function (res) {
            window.localStorage.setItem(userHandler.phoneNumberRegisteredKey, "true");
            window.localStorage.setItem(userHandler.userIdKey, res.userId);
            userHandler.phoneNumberRegistered = true;
            userHandler.userId = res;
            log.debug("registered!");
        }, context.errorReportFunc);
    }
};
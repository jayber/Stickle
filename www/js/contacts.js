var contactsHandler = {

    populateContacts: function (model, $resource) {
        var contactsDeferred = jQuery.Deferred();
        model.contacts = [];
        model.contactsMap = {};
        model.stickles = {};
        var fields = [''];
        var options = new ContactFindOptions();
        options.filter = "";
        options.multiple = true;
        options.desiredFields = [navigator.contacts.fieldType.displayName,
            navigator.contacts.fieldType.name,
            navigator.contacts.fieldType.phoneNumbers];
        navigator.contacts.find(fields,
            function (contacts) {
                contactsHandler.processContacts(contacts, model, $resource);
                contactsDeferred.resolve();
            },
            function (err) {
                log.error("Error", err);
            }, options);
        return contactsDeferred;
    },

    processContacts: function (contacts, model, $resource) {
        var cleanContacts = contactsHandler.filterOnPhoneAndSortByNameAlphabet(contacts);

        model.$apply(function () {
            cleanContacts.forEach(function (contact) {
                contactsHandler.processContact(contact, model);
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
        contact = contactsHandler.dedupePhoneNumbers(contact);
        contact.stickler = false;
        contactsHandler.storeAndDisplayIfNew(contact, model);
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

    makeCall: function (contact) {
        window.plugins.CallNumber.callNumber(function () {
            log.debug('successfully called '+ contact.phoneNumbers[0].value);
        }, function () {
            log.error('error calling ' + contact.phoneNumbers[0].value);
        }, contact.phoneNumbers[0].value);
    }
};

var userHandler = {

    displayNameKey: "displayName",
    userIdKey: "userId",
    phoneNumberKey: "phonenumber",

    registerOnServer: function ($resource, phoneNumber, displayName) {
        var User = $resource('http://:server/api/user/:phoneNum', {
            server: context.serverUrl,
            phoneNum: "@phoneNum"
        });
        log.debug("attempting to register");
        return User.save({phoneNum: phoneNumber}, {displayName: displayName},function (res) {
            window.localStorage.setItem(userHandler.userIdKey, res.userId);
            window.localStorage.setItem(userHandler.phoneNumberKey, phoneNumber);
            log.debug("registered!");
        }, context.errorReportFunc).$promise;
    }
};
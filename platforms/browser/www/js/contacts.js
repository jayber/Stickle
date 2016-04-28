
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
                log.error("Error",err);
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
        }).
            sort(function (a, b) {
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
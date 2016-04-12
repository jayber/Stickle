angular.module('stickle', ['ionic'])

    .controller('stickleCtrl', function ($scope) {
        $scope.contacts = [];
        ionic.Platform.ready(function () {
            contactProcessor.populateContacts($scope);
        });
    });
var count = true;
var contactProcessor = {

    checkContactsStatus: function (model) {
            model.contacts.forEach(function (thing, index) {
                thing.stickler = count;
                count = !count;
            });
    },

    populateContacts: function (model) {
        var fields = [''];
        var options = new ContactFindOptions();
        options.filter = "";
        options.multiple = true;
        options.desiredFields = [navigator.contacts.fieldType.displayName,
            navigator.contacts.fieldType.name,
            navigator.contacts.fieldType.phoneNumbers];
        navigator.contacts.find(fields,
            function (contacts) {
                contactProcessor.processContacts(contacts, model)
            },
            function (contactError) {
                context.print('error finding contacts');
            }, options);
    },

    processContacts: function (contacts, model) {
        var cleanContacts = contactProcessor.filterOnPhoneAndSortByNameAlphabet(contacts);

        model.$apply(function () {
            cleanContacts.forEach(function (contact) {
                contactProcessor.processContact(contact, model);
            });
        });

        model.$apply(function () {
            contactProcessor.checkContactsStatus(model);
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
        contact = contactProcessor.dedupePhoneNumbers(contact);
        contactProcessor.storeAndDisplayIfNew(contact, model);
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
        context.hideContactsLoading();
    },

    makeCall: function () {
        window.plugins.CallNumber.callNumber(function () {
            alert('success');
        }, function () {
            alert('error');
        }, 0);
    }
};

var context = {
    contactsElement: $('#contacts'),
    errorsElement: $('#errors'),

    print: function (error) {
        context.errorsElement.show();
        context.errorsElement.append(error);
    },

    hideContactsLoading: function () {
        $('.loading').hide();
    }
};
var app = {

    initialize: function () {
        this.bindEvents();
    },

    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function () {
        $.Deferred(app.populateContacts());
    },

    populateContacts: function () {
        var fields = [''];
        var options = new ContactFindOptions();
        options.filter="";
        options.multiple=true;
        options.desiredFields=[navigator.contacts.fieldType.displayName,
            navigator.contacts.fieldType.name,
            navigator.contacts.fieldType.phoneNumbers];
        navigator.contacts.find(fields,
            function (contacts) {
                var cleanContacts = app.filterOnPhoneAndSortByNameAlphabet(contacts);
                cleanContacts.forEach(function (contact) {
                    $.Deferred(app.processContact(contact));
                })
            }, function(contactError) {
            context.alert('error finding contacts');
        }, options);
    },

    makeCall: function () {
        window.plugins.CallNumber.callNumber(function () {
            alert('success');
        }, function () {
            alert('error');
        }, 0);
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

    processContact: function (contact) {
        contact = this.dedupePhoneNumbers(contact);
        context.storeAndDisplayIfNew(contact);
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
    }
};

var context = {
    contactsElement: $('#contacts'),
    errorsElement: $('#errors'),

    alert: function(error) {
        context.errorsElement.show();
        context.errorsElement.append(error);
    },

    storeAndDisplayIfNew: function(contact) {
        context.hideContactsLoading();
        var contactHtml = context.render('contactTemplate', contact);
        context.contactsElement.append(contactHtml);
    },

    hideContactsLoading: function() {
        $('.loading').hide();
    },

    render: function (tmpl_name, tmpl_data) {
        if (!context.tmpl_cache) {
            context.tmpl_cache = {};
        }

        if (!context.tmpl_cache[tmpl_name]) {
            var tmpl_string = document.getElementById(tmpl_name).innerHTML;

            context.tmpl_cache[tmpl_name] = Handlebars.compile(tmpl_string);
        }

        return context.tmpl_cache[tmpl_name](tmpl_data);
    }
};
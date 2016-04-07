
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
        app.makeCall();
        var fields = [''];
        navigator.contacts.find(fields,
            function (contacts) {
                var cleanContacts = app.filterAndSort(contacts);
                $('.loading').hide();
                var element = $('#contacts');
                cleanContacts.forEach(function (contact) {
                    $.Deferred(app.renderCleanContact(contact, element));
                })
            });
    },

     makeCall: function () {
        window.plugins.CallNumber.callNumber(function(){alert('success');}, function(){alert('error');}, 0);
     },

    renderCleanContact: function (contact, parentElement) {
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
        parentElement.append(render('contactTemplate', contact))
    },

    filterAndSort: function (contacts) {
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


function render(tmpl_name, tmpl_data) {
    if (!render.tmpl_cache) {
        render.tmpl_cache = {};
    }

    if (!render.tmpl_cache[tmpl_name]) {
        var tmpl_string = document.getElementById(tmpl_name).innerHTML;

        render.tmpl_cache[tmpl_name] = Handlebars.compile(tmpl_string);
    }

    return render.tmpl_cache[tmpl_name](tmpl_data);
}
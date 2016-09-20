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

    inviteSms: function (model) {
        return function (contact) {
            SMS.sendSMS(contact.phoneNumbers[0].value, "Hi there, I'm using Stickle and think you might like it. Check it out:\n" +
            "http://play.google.com/store/apps/details?id=co.stickle", function () {
                userInterfaceHandler.showPopover(model, "Invited \"" + contact.displayName + "\".");
            }, function () {
                userInterfaceHandler.showPopover(model, "Error inviting \"" + contact.displayName + "\".");
            });
        }
    },

    filterOnPhoneAndSortByNameAlphabet: function (contacts) {
        return contacts.filter(function (contact) {
            return contact.phoneNumbers != null
        }).sort(function (a, b) {
            if ((a.displayName || "").toLowerCase() < (b.displayName || "").toLowerCase())
                return -1;
            else if ((a.displayName || "").toLowerCase() > (b.displayName || "").toLowerCase())
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
        var newNumbers = [];
        contact.phoneNumbers.forEach(function (pnum) {
            if (!newNumbers.some(function (currentValue) {
                    return pnum.value == currentValue.value && pnum.type == currentValue.type;
                })) {
                pnum.canonical = telephone.canonicalize(pnum.value);
                newNumbers.push(pnum);
            }
        });
        contact.phoneNumbers = newNumbers;

        return contact;
    },

    storeAndDisplayIfNew: function (contact, model) {
        model.contacts.push(contact);
        model.contactsMap[contact.phoneNumbers[0].canonical] = contact;
    },

    makeCall: function (model, $ionicScrollDelegate) {
        return function (contact) {
            userInterfaceHandler.showPopover(model, "calling...");
            window.plugins.CallNumber.callNumber(function () {
                log.debug('successfully called ' + contact.phoneNumbers[0].value);
                contactsHandler.completeStickle(contact, model, $ionicScrollDelegate);
            }, function () {
                log.error('error calling ' + contact.phoneNumbers[0].value);
            }, contact.phoneNumbers[0].value);
        }
    },

    completeStickle: function (contact, model, $ionicScrollDelegate) {
        var status = "completed";
        socketHandler.ws.emit("stickle", {
            to: contact.phoneNumbers[0].canonical,
            status: status
        });
        contactsHandler.setContactStatusAndDisplay(contact, status, model, false, $ionicScrollDelegate);
    },

    moveContactToTop: function (contact, model, key, $ionicScrollDelegate) {
        if (model.stickles[key] == null) {
            model.stickles[key] = contact;
            contact.hidden = true;
        }
        $ionicScrollDelegate.scrollTop();
    },

    removeContactFromTop: function (contact, model, key) {
        if (model.stickles[key] != null) {
            delete model.stickles[key];
            contact.hidden = false;
        }
    },

    setContactStatusAndDisplay: function (contact, status, model, inbound, $ionicScrollDelegate) {
        var key = (inbound ? "in" : "out") + contact.phoneNumbers[0].canonical;

        if (inbound) {
            var existingContact = model.stickles[key];
            if (existingContact != null) {
                contact = existingContact;
            }
        }

        if (status === "rejected" || status === "closed" || status === "completed") {
            contact.stickleStatus = null;
            contact.inbound = false;
            contact.stickled = false;
            contactsHandler.removeContactFromTop(contact, model, key);
        } else {
            contact.inbound = inbound;
            contact.stickleStatus = status;
            contactsHandler.moveContactToTop(contact, model, key, $ionicScrollDelegate);
        }

    },

    stickleResponseHandler: function (status, model, $ionicScrollDelegate) {
        var translation = {
            accepted: "Ready to be called by",
            "un-accepted": "Not ready to be called by",
            rejected: "Declined from"
        };
        return function (contact) {
            log.debug(status + ": " + contact.displayName + " - " + contact.phoneNumbers[0].value);
            try {
                socketHandler.ws.emit("stickle-response", {
                    origin: contact.phoneNumbers[0].canonical,
                    status: status
                });
                userInterfaceHandler.showPopover(model, translation[status] + " \"" + contact.displayName + "\".");
                contactsHandler.setContactStatusAndDisplay(contact, status, model, true, $ionicScrollDelegate);
            } catch (err) {
                userInterfaceHandler.showPopover(model, "Oops, there was an error. Please try again.");
            }
        }
    },

    stickleHandler: function (model, $ionicScrollDelegate) {
        return function (contact) {
            log.debug("stickling: " + contact.displayName + "; stickled: " + contact.stickled);
            var status = contact.stickled ? "open" : "closed";
            try {
                socketHandler.ws.emit("stickle", {
                    to: contact.phoneNumbers[0].canonical,
                    status: status
                });
                userInterfaceHandler.showPopover(model, "\"" + contact.displayName + "\" " + (contact.stickled ? "stickled" : "un-stickled") + ".");
            } catch (err) {
                userInterfaceHandler.showPopover(model, "Oops, there was an error. Please try again.");
                status = contact.stickled ? "closed" : "open";
            }
            contactsHandler.setContactStatusAndDisplay(contact, status, model, false, $ionicScrollDelegate);
        }
    },

    getOrCreateContact: function (model, key, displayName) {
        var contact = model.contactsMap[key];
        if (contact == null) {
            contact = {
                phoneNumbers: [{type: "mobile", value: key}],
                displayName: displayName
            }
        }
        return contact;
    }
};


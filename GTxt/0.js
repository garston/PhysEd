GTxt = {};
GTxt.DOUBLE_SEPARATOR = '||';
GTxt.SEPARATOR = '|';

function clearShortIds () {
    GASton.Database.hydrate(GTxt.Contact).forEach(c => c.shortId = c.hasShortId() ? -c.shortId : 0);
}

function doGet() {
    return HtmlService.createHtmlOutput('<span style="font-size: 500px">' + GTxt.Config.soleInstance().toggleForwardToPhysicalPhone() + '</span>');
}

function go() {
    GTxt.ContactPopulator.execute();

    var config = GTxt.Config.soleInstance();
    GTxt.MissedCallEnabler.changeEnabled(config);
    GTxt.MonkeyInTheMiddle.forwardTexts(config);
    GTxt.SenderMonkey.sendTextsFromEmails(config);

    if(!config.forwardToPhysicalPhone){
        config.quickReplyContactGuid = '';
    }
}

function populateContacts() {
    GTxt.ContactPopulator.execute(true);
}


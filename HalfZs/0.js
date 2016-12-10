HalfZs = {};

function processTransactions() {
    var processedStrings = [];
    var notProcessedStrings = [];
    var sharingInfos = GASton.Database.hydrate(HalfZs.SharingInfo);

    GmailApp.search('label:' + HalfZs.Const.CHASE_LABEL).forEach(function(thread){
        thread.getMessages().
            filter(function(message){return !message.isInTrash()}).
            forEach(function(message){
                var transactionInfo = /([0-9]+[.][0-9][0-9]) at (.+) has been authorized on 0?([0-9]+)[/][0-9]+[/]([0-9]+)/.exec(message.getPlainBody());
                var amount = transactionInfo[1];
                var chaseFullName = transactionInfo[2];
                var month = transactionInfo[3];
                var year = transactionInfo[4];

                var sharingInfo = _findSharingInfo(chaseFullName, sharingInfos);
                if(sharingInfo){
                    _newSharedTransaction(month, year, amount, sharingInfo, processedStrings);
                }else{
                    notProcessedStrings.push([month, year, chaseFullName, '$' + amount].join(' '));
                }

                message.moveToTrash();
            });
    });

    var now = new Date();
    var receivedTodaySearchStr = ' after:' + JSUtil.DateUtil.toSearchString(now);

    var xcelThread = GmailApp.search('subject:"Account Notification: Your Xcel Energy statement is ready to view"' + receivedTodaySearchStr)[0];
    if(xcelThread) {
        _processMessageReceivedToday(_findSharingInfo('Xcel', sharingInfos), 'Amount Due:', xcelThread.getMessages()[0].getBody(), processedStrings);
    }

    GmailApp.search('from:service@paypal.com subject:"You sent a payment"' + receivedTodaySearchStr).forEach(function(thread){
        thread.getMessages().forEach(function(message){
            var messageBody = message.getBody();
            var sharingInfo = JSUtil.ArrayUtil.find(sharingInfos, function(sharingInfo){ return JSUtil.StringUtil.contains(messageBody, sharingInfo.prettyName); });
            if(sharingInfo) {
                _processMessageReceivedToday(sharingInfo, 'You sent a payment for', messageBody, processedStrings);
            }
        });
    });

    if(processedStrings.length || notProcessedStrings.length){
        GASton.MailSender.sendToIndividual('HalfZs ' + JSUtil.DateUtil.toPrettyString(now), JSUtil.ArrayUtil.flatten([
            'Processed:', processedStrings, '', 'Not Processed:', notProcessedStrings, '', SpreadsheetApp.getActiveSpreadsheet().getUrl()
        ]).join('<br/>'), Session.getActiveUser().getEmail());
    }
}

function _findSharingInfo(name, sharingInfos) {
    return JSUtil.ArrayUtil.find(sharingInfos, function (sharingInfo) {
        return JSUtil.StringUtil.contains(name.toLowerCase(), (sharingInfo.chaseName || sharingInfo.prettyName).toLowerCase());
    });
}

function _newSharedTransaction(month, year, iPayed, sharingInfo, processedStrings) {
    var sharedTransaction = JSUtil.ArrayUtil.find(GASton.Database.hydrate(HalfZs.SharedTransaction), function(sharedTransaction){ return sharedTransaction.month === ''; });
    sharedTransaction.month = month;
    sharedTransaction.year = year;
    sharedTransaction.what = sharingInfo.prettyName;
    sharedTransaction.iPayed = iPayed;
    sharedTransaction.percentOwed = sharingInfo.splitPercent;
    GASton.Database.persist(HalfZs.SharedTransaction, sharedTransaction);

    processedStrings.push([month, year, sharingInfo.prettyName, '$' + iPayed, (sharingInfo.splitPercent * 100) + '%'].join(' '));
}

function _processMessageReceivedToday(sharingInfo, textBeforeAmountDue, messageBody, processedStrings) {
    _newSharedTransaction(
        new Date().getMonth() + 1, new Date().getFullYear(),
        new RegExp(textBeforeAmountDue + ' [$]([0-9]+[.][0-9][0-9])').exec(messageBody)[1],
        sharingInfo, processedStrings
    );
}
PhysEd.InBasedThread = function(thread){
    this.thread = thread;
    this.mailingListEmail = thread.getMessages()[0].getReplyTo();
    this.sportName = thread.getFirstMessageSubject().replace(/ [a-z]+[!]*$/i, '').replace('Full Court', 'Basketball');
};

PhysEd.InBasedThread.sendInitialEmail = function(sportMailingList, dayOfWeek){
    var sport = JSUtil.ArrayUtil.find(GASton.Database.hydrate(PhysEd.Sport), function(sport){ return sport.guid === sportMailingList.sportGuid; });
    GASton.MailSender.sendToList(
        (sport.name === 'Basketball' ? 'Full Court ' + JSUtil.DateUtil.dayOfWeekString(dayOfWeek) : sport.name + ' Tomorrow') + this._generateRandomExclamations(),
        '',
        JSUtil.ArrayUtil.find(GASton.Database.hydrate(PhysEd.MailingList), function(mailingList){ return mailingList.guid === sportMailingList.mailingListGuid; }).email
    );
};

PhysEd.InBasedThread.prototype.sendPlayerCountEmail = function(playerStatusParser, introLines, endLines) {
    if(playerStatusParser.inPlayers.length) {
        var bodyLines = introLines.
            concat(JSUtil.ArrayUtil.compact([
                this._toPlayerNames('In', playerStatusParser.inPlayers),
                this._toPlayerNames('Maybe', playerStatusParser.maybePlayers),
                this._toPlayerNames('Out', playerStatusParser.outPlayers),
                this._toPlayerNames('Unknown', playerStatusParser.unknownPlayers)
            ])).
            concat('').
            concat(endLines);
        GASton.MailSender.replyAll(this.thread, bodyLines.join('<br/>'), this.mailingListEmail);
    }
};

PhysEd.InBasedThread._generateRandomExclamations = function(){
    var maxExclamations = 5;
    var num = Math.floor(Math.random() * (maxExclamations + 1));
    return JSUtil.ArrayUtil.range(num).reduce(function(str){ return str + '!'; }, '');
};

PhysEd.InBasedThread.prototype._toPlayerNames = function(categoryDisplayString, players) {
    if(players.length){
        var playerStrings = players.map(PhysEd.Transformers.personToDisplayString);
        return categoryDisplayString + ' (' + playerStrings.length + '): ' + playerStrings.join(', ');
    }
};

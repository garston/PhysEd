PhysEd.InBasedThread = function(thread){
    this.thread = thread;
    this.playerStatusParser = new PhysEd.PlayerStatusParser(thread);

    this.sportName = this.thread.getFirstMessageSubject().replace(/ [a-z]+[!]*$/i, '');
    if(this.sportName === PhysEd.InBasedThread.BASKETBALL_PRETTY_NAME) {
        this.sportName = PhysEd.InBasedThread.BASKETBALL_STORED_NAME;
    }
};

PhysEd.InBasedThread.BASKETBALL_PRETTY_NAME = 'Full Court';
PhysEd.InBasedThread.BASKETBALL_STORED_NAME = 'Basketball';

PhysEd.InBasedThread.sendInitialEmail = function(sportName, dayWord, email){
    MailSender.send(sportName + ' ' + dayWord + this._generateRandomExclamations(), '', email);
};

PhysEd.InBasedThread.prototype.getSport = function() {
    return Database.hydrateBy(PhysEd.Sport, ['name', this.sportName]);
};

PhysEd.InBasedThread.prototype.sendPlayerCountEmail = function(additionalPlayerStatusParser) {
    MailSender.replyAll(this.thread, ArrayUtil.compact([
        this._toPlayerNames('inPlayers', 'In', additionalPlayerStatusParser),
        this._toPlayerNames('maybePlayers', 'Maybe', additionalPlayerStatusParser),
        this._toPlayerNames('outPlayers', 'Out', additionalPlayerStatusParser),
        this._toPlayerNames('unknownPlayers', 'Unknown', additionalPlayerStatusParser)
    ]).join('<br/>'), this.thread.getMessages()[0].getReplyTo());
};

PhysEd.InBasedThread._generateRandomExclamations = function(){
    var maxExclamations = 5;
    var num = Math.floor(Math.random() * (maxExclamations + 1));
    return ArrayUtil.reduce(ArrayUtil.range(num), function(str){
        return str + '!';
    }, '');
};

PhysEd.InBasedThread.prototype._toPlayerNames = function(playerStatusParserCategoryName, categoryDisplayString, additionalPlayerStatusParser) {
    var playerStatusParsers = ArrayUtil.compact([this.playerStatusParser, additionalPlayerStatusParser]);
    var players = ArrayUtil.reduce(playerStatusParsers, function(players, playerStatusParser){
        return players.concat(playerStatusParser[playerStatusParserCategoryName]);
    }, []);
    if(players.length){
        var playerStrings = ArrayUtil.unique(ArrayUtil.map(players, PhysEd.Transformers.personToDisplayString));
        return categoryDisplayString + ' (' + playerStrings.length + '): ' + playerStrings.join(', ');
    }
};

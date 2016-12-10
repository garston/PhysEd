PhysEd.Side = function(month, day, year, leagueGuid, score, playerEmails) {
    this.guid = JSUtil.GuidUtil.generate();
    this.month = month;
    this.day = day;
    this.year = year;
    this.leagueGuid = leagueGuid;
    this.score = score;

    playerEmails = playerEmails || [];
    JSUtil.ArrayUtil.times(PhysEd.Side.MAX_PLAYERS, function(i){
        this['playerEmail' + i] = playerEmails[i] || '';
    }, this);
};

PhysEd.Side.MAX_PLAYERS = 14;

PhysEd.Side.prototype.getPeople = function(){
    this.people = this.people || this.getPlayerEmails().map(function(email){
        return JSUtil.ArrayUtil.find(GASton.Database.hydrate(PhysEd.Person), function(person){ return person.email === email; }) || new PhysEd.Person(email);
    });

    return this.people;
};

PhysEd.Side.prototype.getPlayerEmails = function() {
    return JSUtil.ArrayUtil.compact(JSUtil.ArrayUtil.range(PhysEd.Side.MAX_PLAYERS).map(function(i){ return this['playerEmail' + i]; }, this));
};

PhysEd.Side.__firstRow = 2;
PhysEd.Side.__props = function() {
    var propsToCol = ['guid', 'month', 'day', 'year', 'leagueGuid', 'score'];
    JSUtil.ArrayUtil.times(this.MAX_PLAYERS, function(i){
        propsToCol.push('playerEmail' + i);
    });
    return propsToCol;
};
PhysEd.Side.__tableName = 'GAME_RECORDER';
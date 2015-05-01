HalfZs.SharingInfo = function(prettyName, splitPercent, chaseName) {
    this.prettyName = prettyName;
    this.splitPercent = splitPercent;
    this.chaseName = chaseName;
};

HalfZs.SharingInfo.__tableName = function(){ return HalfZs.Const.SHARING_INFO_TABLE_NAME; };
HalfZs.SharingInfo.__firstRow = 2;
HalfZs.SharingInfo.__propsToCol = {
    prettyName: 1,
    splitPercent: 2,
    chaseName: 3
};

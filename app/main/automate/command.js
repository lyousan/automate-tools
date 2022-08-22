class Command {
    commandName;
    targetName;
    methodName;
    paramsType;
    params;

    constructor(targetName, methodName, paramsType, params) {
        this.targetName = targetName;
        this.methodName = methodName;
        this.paramsType = paramsType;
        this.params = params;
    }
}

module.exports = {
    Command
}

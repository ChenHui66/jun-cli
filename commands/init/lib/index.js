'use strict';
const Command = require("@jun-cli/command")
const log = require("@jun-cli/log")
class initCommand extends Command {
    init() {
        this.projectName = this._argv[0] || '';
        this.force = !!this._cmd.force;
        log.verbose('projectName:', this.projectName)
        log.verbose('force:', this.force)
    }
    exec() {

    }
}

function init(argv) {
    console.log('开始执行业务代码')
    new initCommand(argv)
}

module.exports = init
module.exports.initCommand = initCommand;

'use strict';
const Package = require('@jun-cli/package')
const log = require('@jun-cli/log')
const SETTINGS = {
    init: '@jun-cli/init'
}

function exec(...rest) {
    let targetPath = process.env.CLI_TARGET_PATH
    const homePath = process.env.CLI_HOME_PATH
    //log.verbose(targetPath)
    //log.verbose(homePath)
    //console.log('rest:',rest)
    if (!targetPath) {

    }
    const cmdObj = rest[rest.length - 1]
    const cmdName = cmdObj.name()
    const packageName = SETTINGS[cmdName]
    const packageVersion = 'latest'
    const opts = {
        targetPath,
        packageName,
        packageVersion
    }

    const pkg = new Package(opts)
    const rootFilePath = pkg.getRootFilePath()
    console.log(rootFilePath)
}

module.exports = exec;

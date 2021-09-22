'use strict';

function init(projectName, cmdObj) {
    console.log(1111)
    console.log('init', projectName, cmdObj.force, process.env.CLI_TARGET_PATH, '_____')
}

module.exports = init;

'use strict';
const semver = require('semver')
const colors = require('colors/safe')
const log = require('@jun-cli/log')
const {isObject } = require('@jun-cli/utils')
const LOWEST_NODE_VERSION = '14.0.0'

class Command {
    constructor(argv) {
        console.log('command constructor', argv)
        if (!argv) {
            throw new Error('参数不能为空！')
        }
        if(!Array.isArray(argv)) {
            throw new Error('必须为数组！')
        }
        if(argv.length < 1) {
            throw new Error('参数列表为空!')
        }
        this._argv = argv
        let runner = new Promise((resolve, reject) => {
            let chain = Promise.resolve();
            chain = chain.then(() => {
                this.checkNodeVersion()
            })
            chain = chain.then(() => {
                this.initArgs()
            })
            chain = chain.then(() => {
                this.init()
            })
            chain = chain.then(() => {
                this.exec()
                })
            chain.catch((err) => {
                log.error(err.message)
            })
        })
    }

    initArgs() {
        this._cmd = this._argv[this._argv.length - 1]
        this._argv = this._argv.slice(0, this._argv.length - 1)

    }

    // 检查node版本号
    checkNodeVersion() {
        const currentVersion = process.version
        if (!semver.gte(currentVersion, LOWEST_NODE_VERSION)) {
            throw new Error(colors.red(`jun-cli需要安装v${LOWEST_NODE_VERSION}以上的node.js版本`))
        }
    }

    init() {
        throw new Error('init必须实现')
    }

    exec() {
        throw new Error('exec必须实现')
    }

}

module.exports = Command;


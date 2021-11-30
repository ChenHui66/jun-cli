'use strict';
const path = require('path')
const cp = require('child_process')
const Package = require('@jun-cli/package')
const log = require('@jun-cli/log')
const SETTINGS = {
    init: '@imooc-cli/init'
}

const CACHE_DIR = 'dependencies'

async function exec(...rest) {
    let targetPath = process.env.CLI_TARGET_PATH
    const homePath = process.env.CLI_HOME_PATH
    let storeDir = ''
    let pkg
    log.verbose('targetPath', targetPath)
    log.verbose('homePath', homePath)

    const cmdObj = rest[rest.length - 1]
    const cmdName = cmdObj.name()
    const packageName = SETTINGS[cmdName]
    const packageVersion = 'latest'

    if (!targetPath) {
        targetPath = path.resolve(homePath, CACHE_DIR) // 生成缓存路径
        storeDir = path.resolve(targetPath, 'node_modules')
        log.verbose('targetPath:', targetPath)
        log.verbose('storeDir:', storeDir)
        pkg = new Package({
            targetPath,
            storeDir,
            packageName,
            packageVersion
        })
        if (await pkg.exists()) {
            // 更新package
            console.log('更新package。。。')
            await pkg.update()
        } else {
            // 安装package
            await pkg.install()
        }
    } else {
        pkg = new Package({
            targetPath,
            packageName,
            packageVersion
        })
    }
    const rootFilePath = pkg.getRootFilePath()
    if (rootFilePath) {
        try {
            // 在当前进程调用
            // require(rootFilePath)(rest)
            // 在子进程中调用
            const cmd = rest[rest.length - 1]
            const o = Object.create(null) // 创建一个没原型链的对象
            Object.keys(cmd).forEach(key => {
                if (cmd.hasOwnProperty(key) && !key.startsWith('_') && key !== 'parent') {
                    o[key] = cmd[key]
                }
            })
            rest[rest.length - 1] = o
            const code = `require('${rootFilePath}')(${JSON.stringify(rest)})`
            const child = spawn('node', ['-e', code], {
                cwd: process.cwd(),
                stdio: 'inherit'
            })
            // 可用 stdio 这个属性替代，直接和父进程反馈信息
            // child.stdout.on('data', chunk => {
            // })
            // child.stderr.on('data', chunk => {
            // })
            child.on('error', err => {
                log.error(err.message)
                process.exit(1)
            })
            child.on('exit', e => {
                log.verbose('命令执行成功:' + e)
                process.exit(e)
            })
        } catch (e) {
            log.error(e.message)
        }

    }
}

function spawn(command, args, options) {
    const win32 = process.platform === 'win32'
    const cmd = win32 ? 'cmd' : command
    const cmdArgs = win32 ? ['/c'].concat(command, args) : args
    return cp.spawn(cmd, cmdArgs, options || {})
}

module.exports = exec;

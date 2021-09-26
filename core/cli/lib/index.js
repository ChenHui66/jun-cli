#! /usr/bin/env node
'use strict';
const path = require('path')
const pkg = require('../package.json')
const log = require('@jun-cli/log')
const {LOWEST_NODE_VERSION, DEFAULT_CLI_HOME} = require('./const')
const colors = require('colors/safe')
const semver = require('semver')
const userHome = require('user-home')
const pathExists = require('path-exists').sync
const commander = require('commander')
const init = require('@jun-cli/init')
const exec = require('@jun-cli/exec')
let args, config

const program = new commander.Command()

async function core() {
    try {
        await prepare()
        registerCommand()
    } catch (err) {
        log.error(err.message)
    }
}

// 检查node版本号
function checkNodeVersion() {
    const currentVersion = process.version
    if (!semver.gte(currentVersion, LOWEST_NODE_VERSION)) {
        throw new Error(colors.red(`jun-cli需要安装v${LOWEST_NODE_VERSION}以上的node.js版本`))
    }
}

// 检查本项目的版本号
function checkPkgVersion() {
    log.info('cli', pkg.version)
}

// 检查是否root账户启动
function checkRoot() {
    const rootCheck = require('root-check')
    rootCheck()
}

// 检查用户的主目录
function checkUserHome() {
    if (!userHome || !pathExists(userHome)) {
        throw new Error(colors.red(`当前登陆用户不存在`))
    }
}

// 检查环境变量
function checkEnv() {
    const dotEnv = require('dotenv')
    const dotenvPath = path.resolve(userHome, '.env')

    if (pathExists(dotenvPath)) {
        dotEnv.config({
            path: dotenvPath
        })
    }
    creatDefaultConfig()
}

// 创建默认的环境变量
function creatDefaultConfig() {
    const cliConfig = {
        home: userHome
    }
    if (process.env.CLIHOME) {
        cliConfig['cliHome'] = path.join(userHome, process.env.CLI_HOME)
    } else {
        cliConfig['cliHome'] = path.join(userHome, DEFAULT_CLI_HOME)
    }
    process.env.CLI_HOME_PATH = cliConfig.cliHome
}

// 检查是否需要更新
async function checkGlobalUpdate() {
    const currentVersion = pkg.version
    const npmName = pkg.name
    const {getNpmSemverVersion} = require('@jun-cli/get-npm-info')
    const lastVersion = await getNpmSemverVersion(currentVersion, npmName)
    if (lastVersion && semver.gt(lastVersion, currentVersion)) {
        log.warn(colors.yellow(`请手动更新${npmName}，当前版本是${currentVersion}，最新版本是${lastVersion}，更新命令：npm install -g ${npmName}`))
    }
}

function registerCommand() {
    program
        .name(Object.keys(pkg.bin)[0]) // 配置 脚手架的名字
        .usage('<command> [options]') // 配置 教手架的使用结构 说明
        .version(pkg.version)
        .option('-d, --debug', '是否开启调试模式', false)
        .option('-tp, --targetPath <targetPath>','是否指定本地调试文件路径', '')
    // 注册命令init
    program
        .command('init [projectName]')
        .option('-f --force', '是否强制初始化项目')
        .action(exec)
        // .action((projectName, cmdObj) => {
        //     console.log('init', projectName, cmdObj.force)
        // })
    // 开启debug模式
    program.on('option:debug', function() {
        if(program.debug) {
            process.env.LOG_LEVEL = 'verbose'
        } else {
            process.env.LOG_LEVEL = 'info'
        }
        log.level = process.env.LOG_LEVEL
    })

    // 指定targetpath 通过属性事件的监听，在执行业务逻辑init之前便把targetPath存入环境变量，方便其他进程拿取
    program.on('option:targetPath', function() {
        process.env.CLI_TARGET_PATH = program.targetPath;
    })


    // 对未知命令的监听
    program.on('command:*', function (obj) {
        const availableCommands = program.commands.map(cwd => cwd.name())
        console.log(colors.red('未知的命令：' + obj[0]))
        if(availableCommands.length > 0) {
            console.log(colors.red('可用命令：' + availableCommands.join(',')))
        }
    })

    program.parse(process.argv)
    // 这种判断兼容jun-cli -d  也可以输出帮助文案（program.argv去判断不支持）
    if (program.args && program.args.length < 1) {
        program.outputHelp()
        // 显示一个空行 看起来更舒服
        console.log()
    }
}

async function prepare() {
    checkPkgVersion()
    checkNodeVersion()
    checkRoot()
    checkUserHome()
    checkEnv()
    await checkGlobalUpdate()
}

module.exports = core;
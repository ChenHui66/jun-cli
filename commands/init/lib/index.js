'use strict';
const fs = require('fs')
const inquirer = require('inquirer')
const fse = require('fs-extra')
const semver = require('semver')
const Command = require("@jun-cli/command")
const log = require("@jun-cli/log")

const TYPE_PROJECT = 'project'
const TYPE_COMPONENT = 'component'

class initCommand extends Command {
    init() {
        this.projectName = this._argv[0] || '';
        this.force = !!this._cmd.force;
        log.verbose('projectName:', this.projectName)
        log.verbose('force:', this.force)
    }

    async exec() {
        try {
            // 准备阶段
            const ret = await this.prepare()
            if (ret) {
                // 下载摸板
                // 安装摸板
            }
        } catch (e) {
            log.error(e.message)
        }
    }

    async prepare() {
        // 1. 判断当前目录是否为空
        if (!this.isCwdEmpty()) {
            let ifContinue = false
            // 询问是否继续创建
            if (!this.force) {
                ifContinue = (await inquirer.prompt({
                    type: 'confirm',
                    name: 'ifContinue',
                    default: false, // 默认不创建
                    message: '当前文件不为空，是否继续创建项目？'
                })).ifContinue
                if (!ifContinue) return
            }
            // 2. 是否启动强制更新
            if (ifContinue || this.force) {
                // 给用户做二次确认
                const {confirmDelete} = inquirer.prompt({
                    type: 'confirm',
                    name: 'confirmDelete',
                    default: false,
                    message: '是否确认清空当前目录？'
                })
                if (confirmDelete) {
                    // 清空当前目录
                    fse.emptyDirSync()
                }
            }
        }

        return this.getProjectInfo()
    }

    async getProjectInfo() {
        // 选择创建项目或组件
        const {type} = await inquirer.prompt({
            type: 'list',
            name: type,
            message: '请选择初始化类型',
            default: TYPE_PROJECT,
            choices: [{
                name: '项目',
                value: TYPE_PROJECT
            }, {
                name: '组件',
                value: TYPE_COMPONENT
            }]
        })

        if (type === TYPE_PROJECT) {
            // 获取项目的基本信息
            const o = await inquirer.prompt([{
                type: 'input',
                name: 'projectName',
                message: '请输入项目名称',
                default: '',
                validate: function (v) {
                    // 1. 输入的首字母字符必须为英文字符
                    // 2. 尾字母字符必须为英文或数字
                    // 3. 字符仅仅允许’-_‘
                    const done = this.async();
                    setTimeout(function() {
                        if (!/^[a-zA-Z]+([-][a-zA-Z][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/.test(v)) {
                            done('请输入合法的项目名称');
                            return;
                        }
                        done(null, true);
                    }, 0);
                },
                filter: function (v) {
                    return v
                }
            }, {
                type: 'input',
                name: 'projectVersion',
                message: '请输入项目版本号',
                default: '1.0.0',
                validate: function (v) {
                    const done = this.async();
                    setTimeout(function() {
                        if (!(!!semver.valid(v))) {
                            done('请输入合法的项目版本号');
                            return;
                        }
                        done(null, true);
                    }, 0);
                },
                filter: function (v) {
                    if(!!semver.valid(v)) {
                        return semver.valid(v)
                    } else {
                        return v
                    }

                }
            }])
        } else if (type === TYPE_COMPONENT) {

        }
        // return 项目的基本信息（Object）
    }

    isCwdEmpty() {
        const localPath = process.cwd()
        let fileList = fs.readdirSync(localPath)
        // 文件过滤的逻辑
        fileList = fileList.filter(file => (
            !file.startsWith('.') && ['node_modules'].indexOf(file) < 0
        ))
        return !fileList || fileList.length <= 0
    }
}

function init(argv) {
    console.log('开始执行业务代码')
    new initCommand(argv)
}

module.exports = init
module.exports.initCommand = initCommand;

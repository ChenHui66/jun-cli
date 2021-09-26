'use strict';
const path = require('path')
const {isObject} = require('@jun-cli/utils')
const pkgDir = require('pkg-dir').sync
const formatPath = require('@jun-cli/format-path')

class Package {
    constructor(options) {
        if (!options) {
            throw new Error('Package类的参数不能为空！')
        }
        if (!isObject(options)) {
            throw new Error('Package类的参数必须为对象！')
        }
        // package的路径
        this.targetPath = options.targetPath
        // package的name
        this.name = options.packageName
        // package的version
        this.packageVersion = options.packageVersion
    }

    // 判断当前package是否存在
    exists() {

    }

    // 安装package
    install() {

    }

    // 更新package
    update() {

    }

    // 获取包的入口文件的路径
    getRootFilePath() {
        // 1. 获取package.json所在目录 pkg-dir
        const dir = pkgDir(this.targetPath)
        if (dir) {
            // 2. 读取package.json require()
            const pkgFile = require(path.resolve(dir, 'package.json'))
            // 3. 读取main/lib 属性的值得到入口的path
            if(pkgFile && pkgFile.main) {
                // 4. 路径的兼容（macOs/windows）
                return formatPath(path.resolve(dir, pkgFile.main))
            }
        }
        return null


    }
}

module.exports = Package



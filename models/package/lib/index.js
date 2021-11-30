'use strict';
const path = require('path')
const {isObject} = require('@jun-cli/utils')
const pkgDir = require('pkg-dir').sync
const npminstall = require('npminstall')
const pathExists = require('path-exists').sync
const fse = require('fs-extra')
const formatPath = require('@jun-cli/format-path')
const {getDefaultRegistry, getNpmLatestVersion} = require('@jun-cli/get-npm-info')

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
        // 缓存package的路径
        this.storeDir = options.storeDir
        // package的name
        this.packageName = options.packageName
        // package的version
        this.packageVersion = options.packageVersion
        // package缓存目录前缀
        this.cacheFilePathPrefix = this.packageName.replace('/', '_')

    }

    async prepare() {
        if (this.storeDir && !pathExists(this.storeDir)) {
            fse.mkdirsSync(this.storeDir)
        }
        if (this.packageVersion === 'latest') {
            this.packageVersion = await getNpmLatestVersion(this.packageName)
        }
    }

    // 拼接包的缓存路径
    get cacheFilePath() {
        return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`)
    }

    getSpecificCacheFilePath(packageVersion) {
        return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${packageVersion}@${this.packageName}`)
    }

    // 判断当前package是否存在
    async exists() {
        if (this.storeDir) {
            await this.prepare()
            return pathExists(this.cacheFilePath)
        } else {
            return pathExists(this.targetPath)
        }
    }

    // 安装package
    async install() {
        await this.prepare()
        return npminstall({
            root: this.targetPath,
            storeDir: this.storeDir,
            registry: getDefaultRegistry(), // 默认源
            pkgs: [{
                name: this.packageName,
                version: this.packageVersion
            }]
        })
    }

    // 更新package
    async update() {
        await this.prepare()
        // 获取最新的版本号
        const latestPackageVersion = await getNpmLatestVersion(this.packageName)
        // 查询最新的版本号对应的路径是否存在
        const latestFilePath = this.getSpecificCacheFilePath(latestPackageVersion)
        // 如果不存在，则直接安装最新的版本号
        if (!pathExists(latestFilePath)) {
            await npminstall({
                root: this.targetPath,
                storeDir: this.storeDir,
                registry: getDefaultRegistry(), // 默认源
                pkgs: [{
                    name: this.packageName,
                    version: latestPackageVersion
                }]
            })
            this.packageVersion = latestPackageVersion
        }
    }

    // 获取包的入口文件的路径
    getRootFilePath() {
        function _getRootFile(targetPath) {
            // 1. 获取package.json所在目录
            const dir = pkgDir(targetPath);
            if (dir) {
                // 2. 读取package.json
                const pkgFile = require(path.resolve(dir, 'package.json'));
                // 3. 寻找main/lib
                if (pkgFile && pkgFile.main) {
                    // 4. 路径的兼容(macOS/windows)
                    return formatPath(path.resolve(dir, pkgFile.main));
                }
            }
            return null;
        }

        if (this.storeDir) {
            return _getRootFile(this.cacheFilePath);
        } else {
            return _getRootFile(this.targetPath);
        }
    }
}

module.exports = Package



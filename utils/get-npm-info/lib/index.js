'use strict';
const axios = require('axios')
const urlJoin = require('url-join')
const semver = require('semver')

async function getNpmInfo(npmName, registry) {
    if(!npmName) {
        return null
    }
    const registry_ = registry || getDefaultRegistry()
    const npmInfoUrl = urlJoin(registry_, npmName)
    try{
        const res = await axios.get(npmInfoUrl)
        if(res.status === 200) {
            return res.data
        }
    return null
    }catch (err) {
        return Promise.reject(err)
    }

}
function getDefaultRegistry(isOriginal = false) {
    return isOriginal ? 'https://registry.npmjs.org' : 'https://registry.npm.taobao.org'
}
async function getNpmVersion(npmName) {
    const data = await getNpmInfo(npmName)
    if(data) {
        return Object.keys(data.versions)
    } else {
        return []
    }
}

function getSemverVersions(baseVersion, versions) {
    return versions.filter(version => semver.satisfies(version, `^{baseVersion}`)).sort((a,b) => semver.gt(b,a))
}

async function getNpmSemverVersion(baseVersion, npmName, registry) {
    const versions = await getNpmVersion(npmName, registry)
    const newVersion = getSemverVersions(baseVersion, versions)
    if(newVersion && newVersion.length > 0) {
        return newVersion[0]
    }
}

module.exports = {
    getNpmInfo,
    getNpmVersion,
    getNpmSemverVersion
};

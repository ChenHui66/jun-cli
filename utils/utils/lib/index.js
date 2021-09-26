'use strict';

// 判断数据类型是否为 object
function isObject(o) {
    return Object.prototype.toString.call(o) === '[object Object]'
}

module.exports = {
    isObject
};

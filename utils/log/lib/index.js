'use strict';
const log = require('npmlog')
log.level = process.env?.LOG_LEVEL ?? 'info'; // 判断debug模式
log.heading = 'jun-cli'; // 修改前缀
log.addLevel('sucess', 2000, {fg: 'green', bold: true}); // 添加自定义命令

module.exports = log;

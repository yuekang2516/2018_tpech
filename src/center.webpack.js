const context = require.context('./center/', true, /^(.*\.(js$))[^.]*$/igm);
const modules = context.keys();

// sort them
const sortedModules = modules.slice().sort((a, b) => {
  // by directory depth
  const diff = a.match(/\//g).length - b.match(/\//g).length;
  if (diff !== 0) return diff;

  // if depth is the same, sort alphabetically to make it stable
  const result1 = (a > b ? 1 : 0);
  const result2 = a < b ? -1 : result1;
  return result2;
});

// execute them
sortedModules.forEach((key) => {
  context(key);
});

// // 載入共用的Directive
// const directives = require.context('./common/directives/', true, /^(.*\.(js$))[^.]*$/igm);
// directives.keys().forEach((key) => {
//   directives(key);
// });

// // 載入共用的 Service
// const services = require.context('./common/services/', true, /^(.*\.(js$))[^.]*$/igm);
// services.keys().forEach((key) => {
//   services(key);
// });

// 載入共用的 common 物件
const common = require.context('./common/', true, /^(.*\.(js$))[^.]*$/igm);
common.keys().forEach((key) => {
  common(key);
});

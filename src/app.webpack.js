const req = require.context('./app/', true, /^(?!.*spec.js)((.*\.(js$))[^.]*$)/igm);
req.keys().forEach((key) => {
  req(key);
});

// 載入共用的Directive
const directives = require.context('./common/', true, /^(?!.*spec.js)((.*\.(js$))[^.]*$)/igm);
directives.keys().forEach((key) => {
  directives(key);
});

// 載入共用的 Service
// const services = require.context('./common/services/', true, /^(.*\.(js$))[^.]*$/igm);
// services.keys().forEach((key) => {
//  services(key);
// });

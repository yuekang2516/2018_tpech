var req = require.context('./test_app/', true, /.spec$/);
req.keys().forEach(function (key) {
  req(key);
});

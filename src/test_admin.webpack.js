var req = require.context('./test_admin/', true, /.spec$/);
req.keys().forEach(function (key) {
  req(key);
});

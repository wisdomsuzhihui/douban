'use strict';

var MovieIndex = require('../app/controllers/movie/movie_index'),
  User = require('../app/controllers/user/user'),


  multipart = require('connect-multiparty'), // 处理文件上传中间件
  multipartMiddleware = multipart();

module.exports = function (app) {
  app.use(function (req, res, next) {
    // 将session中保存的用户名存储到本地变量中
    app.locals.user = req.session.user;
    next();
  })
  /*============== 公共路由 ==============*/

  /*============== 用户信息 ==============*/
  // 用户注册路由
  app.post('/user/signup', User.signup)

  // 用户登陆路由
  app.get('/user/signin', User.signin);

  // 用户登出路由
  app.get('/logout', User.logout)



  /*============== 电影网站路由 ==============*/
  // 电影主页路由
  app.get('/', MovieIndex.index);
}
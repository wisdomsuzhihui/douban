'use strict';

var MovieIndex = require('../app/controllers/movie/movie_index')

module.exports = function (app) {

  /*============== 公共路由 ==============*/

  /*============== 电影网站路由 ==============*/
  // 电影主页路由
  app.get('/', MovieIndex.index);
}
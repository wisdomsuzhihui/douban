'use strict';

var mongoose = require('mongoose'),
  User = mongoose.model('User'), // 用户数据模型
  // ccap = require('ccap')(), // 加载验证码模块
  captcha; // 申明验证码变量


/* 用户注册及登录框中验证码生成器控制器 */
exports.captcha = function (req, res) {
  if (req.url === '/favicon.ico') {
    return res.end('');
  }
  var ary = ccap.get();
  captcha = ary[0]; // 生成验证码
  res.end(captcha);
};

/* 用户注册控制器 */
exports.signup = function (req, res) {
  var user = req.body.user, // 获取post请求中的用户数据
    //格式： name=laosu&password=123456&confirm-password=123456
    _user = {};
  user = user.split('&');
  for (var i = 0; i < user.length; i++) {
    var p = user[i].indexOf('='),
      name = user[i].substring(0, p),
      value = user[i].substring(p + 1);
    _user[name] = value;
  }

  var _name = _user.name || '',
    _captcha = _user.captcha || ''; // 验证码

  User.findOne({
    name: _name
  }, function (err, user) {
    if (err) {
      console.log(err);
    }
    // 如果用户名已存在
    if (user) {
      return res.json({
        data: 0
      })
    } else {
      // 验证码存在
      if (!captcha) {
        // if (_captcha.toLowerCase() !== captcha.toLowerCase()) {
        if (!_captcha) {
          res.json({
            data: 1
          }); // 输入的验证码不相等
        } else {
          // 数据库中没有该用户名，将其数据生成新的用户数据并保存至数据库
          user = new User(_user);
          user.save(function (err, user) {
            if (err) {
              console.log(err);
            }
            req.session.user = user; // 将当前登录用户名保存到session中
            return res.json({ // 注册成功
              data: 2
            });
          })
        }
      }
    }
  })




}

/* 用户注册页面渲染控制器 */

/* 用户登录控制器 */
exports.signin = function (req, res) {
  var user = req.query.user || '', // 获取get请求中的用户数据
    _user = {};
  console.log(user)
  user = user.split('&');

  for (var i = 0; i < user.length; i++) {
    var p = user[i].indexOf('='),
      name = user[i].substring(0, p),
      value = user[i].substring(p + 1);
    _user[name] = value;
  }
  var _name = _user.name || '',
    _password = _user.password || '',
    _captcha = _user.captcha || '';
  User.findOne({
    name: _name
  }, function (err, user) {
    if (err) {
      console.log(err);
    }
    if (!user) { // 用户不存在
      return res.json({
        data: 0
      })
    }
    // 使用user实例方法对用户名密码进行比较
    user.comparePassword(_password, function (err, isMatch) {
      if (err) {
        console.log(err);
      }
      // 密码匹配
      if (isMatch) {
        if (!captcha) {
          if (!_captcha) {
            res.json({
              data: 2 // 输入的验证码不相等
            });
          } else {
            req.session.user = user; // 将当前登录用户名保存到session中
            return res.json({
              data: 3 // 登录成功
            })
          }
        }
      } else {
        // 账户名和密码不匹配
        return res.json({
          data: 1
        });
      }
    })

  })
}

/* 用户登出控制器 */
exports.logout = function (req, res) {
  delete req.session.user
  res.redirect('/')
}
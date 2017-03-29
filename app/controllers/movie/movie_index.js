'use strict';

/* 与首页进行交互 */
var mongoose = require('mongoose'),
  Movie = mongoose.model('Movie'), // 电影数据模型
  Category = mongoose.model('Category'), // 电影分类模型
  City = mongoose.model('City'), // 引入电影院模型
  CityCategory = mongoose.model('CityCategory'), // 电影院分类模型
  CityProgramme = mongoose.model('CityProgramme'); // 电影院分类股归类

/* 电影首页控制器 */
exports.index = function (req, res) {
  var _galleryName = req.query.galleryName, // 获取正在上映和即将上映播放标题名
    _fliterName = req.query.fliterName, // 选电影/选电视剧区电影分类标题名称
    _cityName = req.query.cityName, // 电影院所在城市
    _searchName = req.query.search; // 影院搜索框输入的电影院名称

  // 如果是电影院搜索框中发送了Ajax请求
  if (_cityName) {
    // 通过城市名查找该城市对应的电影院
    City.findOne({
        name: _cityName
      })
      .exec(function (err, searchResults) {
        if (err) {
          console.log(err);
        }
        var results = [];
        if (searchResults) {
          var searchCinemas = searchResults.cinemas; // 获取该城市的电影院列表
          if (_searchName) {
            // 通过循环将输入的影院名与该城市所有的电影院进行对比，返回匹配成功的影院
            // 其中匹配成功的如[ '广州', index: 0, input: '广州飞扬影城正佳店' ]所示
            searchCinemas.forEach(function (each) {
              if (each.match(_searchName) && each.match(_searchName).input) {
                results.push(each);
              }
            });
            // 返回该城市对应的全部电影院列表
          } else {
            results = searchCinemas;
          }
          res.json(results);
        }
      });
  } else if (_fliterName) {
    // 如果是选电影/选电视剧区发送的分类切换请求
    Category
      .findOne({
        name: _fliterName
      })
      .populate({
        paht: 'movies',
        select: 'title poster'
      })
      .exec(function (err, category) {
        if (err) {
          console.log(err);
        }
        res.json({
          data: category
        });
      });
  } else if (_galleryName) {
    // 顶部正在上映和即将上映电影展示区切换
    Category
      .findOne({
        name: _galleryName
      })
      .populate({
        path: 'movies',
        select: 'title poster'
      })
      .exec(function (err, category) {
        if (err) {
          console.log(err);
        }
        res.json({
          data: category
        });
      });
  } else {
    // 没有发送上面请求的则渲染豆瓣电影主页
    Category
      .find({})
      .populate({
        path: 'movies',
        select: 'title poster'
      })
      .exec(function (err, categories) {
        if (err) {
          console.log(err);
        }
        City.find({})
          .exec(function (err, cinemas) {
            if (err) {
              console.log(err);
            }
            CityProgramme.find({})
              .populate('cityCategories', 'name')
              .exec(function (err, cityProgrammeList) {
                if (err) {
                  console.log(err);
                }
                CityCategory.find({})
                  .populate('cities', 'name')
                  .populate('cityProgramme', 'name')
                  .exec(function (err, cityCategoryList) {
                    if (err) {
                      console.log(err);
                    }
                    res.render('movie/movie_index', {
                      title: '豆瓣电影首页',
                      logo: 'movie',
                      categories: categories,
                      cinemas: cinemas,
                      cityProgrammeList: cityProgrammeList,
                      cityCategoryList: cityCategoryList
                    });
                  });
              });
          });
      });
  }
};
module.exports = function (router) {
    'use strict'

    var searchService = require('../dataService/search');

    router.get('/search?*', function (req, res, next) {
        var longitude = req.query.lon;
        var latitude = req.query.lat;
        var bloodGroup = req.query.bg;
        var distance = req.query.d;

        searchService.search(bloodGroup, longitude, latitude, distance, function (err, data) {
            if (err) {
                next(err);
            } else {
                res.json(data);

            }
        });
    });
    
    router.post('/search', function (req, res, next) {
//        console.log(req.body);
        
        var longitude = req.body.lon;
        var latitude = req.body.lat;
        var bloodGroup = req.body.bg;
        var distance = req.body.d;

        searchService.search(bloodGroup, longitude, latitude, distance, function (err, data) {
            if (err) {
                next(err);
            } else {
                res.json(data);

            }
        });
    });
}
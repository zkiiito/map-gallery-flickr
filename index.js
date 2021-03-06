'use strict';

var express = require('express'),
    Flickr = require('flickrapi'),
    fJSON = require("fbbk-json"),
    fs = require('fs'),
    config = require('./config'),
    infoCache = {},
    photoCache = {};

Flickr[config.authenticate ? 'authenticate' : 'tokenOnly'](config.flickrOptions, function (err, flickr) {
    if (err) {
        console.log(err);
        return;
    }

    var app = express();
    app.disable('x-powered-by');

    app.use('/MapGallery', express.static(__dirname + '/node_modules/MapGallery'));
    app.use('/assets', express.static(__dirname + '/assets'));

    app.get('/', function (req, res) {
        res.sendFile(__dirname + '/index.html');
    });

    app.get('/:setId([0-9]+)', function (req, res) {
        var setId = req.params.setId;
        //clear the cache if you have to
        if (req.query.cc) {
            photoCache[setId] = undefined;
            infoCache[setId] = undefined;
        }

        getPhotosetInfo(flickr, setId, function (err, photoset) {
            if (err) {
                console.log(err);
                return res.send(err.toString());
            }

            getAllPhotos(flickr, setId, 1, [], function (err, allPhotos) {
                if (err) {
                    console.log(err);
                    return res.send(err.toString());
                }

                fs.readFile(__dirname + '/index.html', {encoding: 'utf-8'}, function (err, data) {
                    if (!err) {
                        var isHd = getHdParam(req);
                        var dataUrl = '/data/' + setId + '?hd=' + (isHd ? 1 : 0);

                        var clientIndexHtml = data.replace('MapGallery/scripts/demo.js', dataUrl);
                        clientIndexHtml = clientIndexHtml.replace(/<title>(.*)<\/title>/, '<title>MapGallery - ' + photoset.title._content + '</title>');
                        clientIndexHtml = clientIndexHtml.replace('{{og-title}}', 'MapGallery - ' + photoset.title._content);
                        clientIndexHtml = clientIndexHtml.replace('{{og-description}}', photoset.description._content);
                        clientIndexHtml = clientIndexHtml.replace('{{og-image}}', photoset.primaryPhotoUrl);
                        clientIndexHtml = clientIndexHtml.replace('data-isflickr="0"', 'data-isflickr="1"');
                        clientIndexHtml = clientIndexHtml.replace('{{google-maps-api-key}}', (config.googleOptions.maps_api_key ? ('?key=' + config.googleOptions.maps_api_key) : ''));

                        if (allPhotos.some((photo) => {
                            return photo.ispublic > 0;
                        })) {
                            clientIndexHtml = clientIndexHtml.replace('{{flickr-url}}', photoset.url);

                        } else {
                            clientIndexHtml = clientIndexHtml.replace('data-ispublic="1"', 'data-ispublic="0"');
                        }

                        res.send(clientIndexHtml);
                    }
                });
            });
        });
    });

    app.get('/data/:setId([0-9]+)', function (req, res) {
        getAllPhotos(flickr, req.params.setId, 1, [], function (err, allPhotos) {
            if (err) {
                console.log(err);
                return res.send(err.toString());
            }
            var isHd = getHdParam(req);
            transformPhotos(allPhotos, isHd, function (err, transformedPhotos) {
                if (err) {
                    res.send(JSON.stringify({error: err}));
                }
                res.send('MapGallery.initialize(' + JSON.stringify(transformedPhotos) + ');');
            });
        });
    });

    app.listen(config.port, function () {
        console.log('MapGallery listening at ' + config.port);
    });

});

function getHdParam(req) {
    return req.query.hd === undefined ? true : parseInt(req.query.hd, 10) > 0;
}

function getPhotosetInfo(filckr, setId, callback) {
    if (infoCache[setId]) {
        console.log('cache hit: ' + setId);
        return callback(null, infoCache[setId]);
    }

    filckr.photosets.getInfo({
        photoset_id: setId,
        authenticated: config.authenticate
    }, function (err, data) {
        if (err) {
            if (err.toString().indexOf('user_id') < 0) {
                return callback(err);
            }
            return;
        }

        data.photoset.primaryPhotoUrl = 'https://farm' + data.photoset.farm + '.staticflickr.com/' + data.photoset.server + '/' + data.photoset.primary + '_' + data.photoset.secret + '_b.jpg';
        data.photoset.url = 'https://www.flickr.com/photos/' + data.photoset.owner + '/sets/' + data.photoset.id;

        infoCache[setId] = data.photoset;
        callback(null, data.photoset);
    });
}

function getAllPhotos(flickr, setId, page, allPhotos, callback) {
    if (photoCache[setId]) {
        console.log('cache hit: ' + setId);
        return callback(null, photoCache[setId]);
    }

    page = page || 1;
    allPhotos = allPhotos || [];
    flickr.photosets.getPhotos({
        photoset_id: setId,
        extras: 'url_h, url_l, description',
        page: page,
        authenticated: config.authenticate
    }, function (err, data) {
        if (err) {
            if (err.toString().indexOf('user_id') < 0) {
                return callback(err);
            }
            return;
        }

        allPhotos = allPhotos.concat(data.photoset.photo);

        if (data.photoset.pages > page) {
            getAllPhotos(flickr, setId, page + 1, allPhotos, callback);
        } else {
            photoCache[setId] = allPhotos;
            callback(null, allPhotos);
        }
    });
}

function transformPhotos(photos, hdEnabled, callback) {
    var res = [];

    photos.forEach(function (photo) {
        if (photo.description._content !== '') {
            try {
                var desc = fJSON.parse(photo.description._content.replace(/&quot;/g, '"'));
                if (Array.isArray(desc)) {
                    res = res.concat(desc);
                } else {
                    res.push(desc);
                }
            } catch (err) {
                console.log(err, photo.description._content);
            }
        }
        res.push((hdEnabled && photo.url_h) ? photo.url_h : photo.url_l);
    });

    callback(null, res);
}

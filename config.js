'use strict';

var config = {
    flickrOptions: {
        api_key: process.env.FLICKR_KEY || 'YOURFLICKRKEY',
        secret: process.env.FLICKR_SECRET || 'YOURFLICKRSECRET',
        user_id: process.env.FLICKR_USER_ID,
        access_token: process.env.FLICKR_ACCESS_TOKEN,
        access_token_secret: process.env.FLICKR_ACCESS_TOKEN_SECRET
    },
    googleOptions: {
        maps_api_key: process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyCybAvGJ5QJC1vy5e6vCYPiB7EwmBut0R4'
    },
    authenticate: process.env.FLICKR_USER_ID !== undefined,
    port: process.env.PORT || 8000
};

module.exports = config;
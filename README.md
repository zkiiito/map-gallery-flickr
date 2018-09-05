# MapGallery for Flickr

See the documentation for MapGallery [here](https://github.com/zkiiito/MapGallery).

## Instructions

First, you must add the map directions to the description field of your images on flickr, like this:

```
{"from":"New York JFK","to":"Rome","speed":70000,"mode":"FLYING"}
```


1. Download and unzip the .zip file or clone the repo.
2. npm install
3. set up config.js with your [flickr api key](https://www.flickr.com/services/apps/create/apply) and [google maps key](https://developers.google.com/maps/documentation/javascript/get-api-key)
4. npm start
5. open http://localhost:8000/[flickrSetId] in your browser

## Options

from: string, starting position  
to: string, destination  
speed: integer, indicating travel speed  
mode: string, if it equals FLYING, it's a line on the map. otherwise, a driving road is calculated by google.  
waypoints: array, see [here](https://developers.google.com/maps/documentation/javascript/examples/directions-waypoints)

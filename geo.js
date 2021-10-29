export function calcDistance(lat1, lon1, lat2, lon2) 
    {
      var R = 6371; // km
      var dLat = toRad(lat2-lat1);
      var dLon = toRad(lon2-lon1);
      var lat1 = toRad(lat1);
      var lat2 = toRad(lat2);

      var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      var d = R * c;
      return d;
    }

    // Converts numeric degrees to radians
    function toRad(Value) 
    {
        return Value * Math.PI / 180;
    }


    //converts and object containing "_latitude and _longitude" into geoJSON feature
  export function ConvertToGeoJSON(item){

      var ret = {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Point",
          coordinates: [
             parseFloat(item._longitude), parseFloat(item._latitude) 
          ]
        }
      }

      return ret;
  }

  export function ConvertDataToGeoJSON(data){
    var features = [];
    data.map(item=>{
      features.push(ConvertToGeoJSON(item))
    })
    var ret = {"type":"FeatureCollection","features":features};
    return ret;
  }
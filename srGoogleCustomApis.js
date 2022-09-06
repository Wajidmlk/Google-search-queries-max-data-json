const axios = require('axios');

const API_KEY = "";
const SEARCH_API_KEY = "";

const getNearestLocations = (data) => {
  const {northeast, southwest,  } = data;
  const NORTHEAST_LAT = northeast.lat;
  const NORTHEAST_LNG = northeast.lng;
  const SOUTHWEST_LAT = southwest.lat;
  const SOUTHWEST_LNG = southwest.lng;
  const DESIRED_GRID_LENGTH = 2;  // start with 3 to get a 3x3 grid and so on...
  
  let output = [];
  let epsilon = 0.0000001;  // because JavaScript and math don't get along
  let intermediate_grid_length = DESIRED_GRID_LENGTH - 1;
  
  let lat_step_size = ( NORTHEAST_LAT - SOUTHWEST_LAT ) / intermediate_grid_length;
  let lng_step_size = ( NORTHEAST_LNG - SOUTHWEST_LNG ) / intermediate_grid_length;
  
  for (let lat = SOUTHWEST_LAT; lat <= NORTHEAST_LAT + epsilon; lat += lat_step_size) {
      for (let lng = SOUTHWEST_LNG; lng <= NORTHEAST_LNG + epsilon; lng += lng_step_size) {
          output.push(lat + '%2C' + lng);
      }
  }
  
  return output;
}
const searchPlaces = async(location, keyword, radius = 5000) => {
  const {data} = await axios.get(
  `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&keyword=${keyword}&key=${API_KEY}`  
  );
  return data;
}
const getAreaLatLngByName = async(name) => {
  let result = {status: "FAILED", message: "unknown error"};
  const {data} = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${name.replace(" ", "+")}&sensor=false&key=${API_KEY}` 
  );
  if(data?.status === "OK" ) {
    if(data.results.length > 0) {
      result = {status: "OK", data: data.results[0].geometry.bounds};
    } else {
      result = {status: "FAILED", message: "no places found"};
    }
  }
    return (result);
}
const getPlaceDetailsById = async(place_id) => {
  let result = {status: "FAILED", message: "unknown error"};
  const {data} = await axios.get(
    `https://maps.googleapis.com/maps/api/place/details/json?placeid=${place_id}&key=${API_KEY}`
  );
  if(data?.status === "OK" ) {
    const { formatted_address, formatted_phone_number, name, website, types } = data.result;
      result = {status: "OK", data: {formatted_address, formatted_phone_number, name, website, types}};
  }
    return (result);
}

const getSearchedPage = async(search, engine, pageNo) => {
  const {data} = await axios.get(
    `https://www.googleapis.com/customsearch/v1?key=${SEARCH_API_KEY}&q=${search}&cx=${engine}&start=${pageNo}`  
   )
  return data;
}

module.exports = {
  searchPlaces,
  getPlaceDetailsById,
  getAreaLatLngByName,
  getNearestLocations,
  getSearchedPage,
};
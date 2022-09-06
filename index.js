const express = require('express');
const { getLocationsByArea, getPagesBySearch } = require('./GoogleCustomApis');
const hostname = "127.0.0.1";
const app = express()

//GET http://127.0.0.1:3000/getPlacesByArea/new%20york/bars

//GET http://127.0.0.1:3000/getRelaventSearchedPages/815fc35786ee44371/superman/3

app.get('/getPlacesByArea/:address/:find', async (req, res) => {
  getLocationsByArea(req, res)});

app.get('/getRelaventSearchedPages/:engine/:search/:limit', async (req, res) => {
  getPagesBySearch(req, res)});

app.listen(3000, hostname, function() {
    console.log(`Server running at http://${hostname}:${3000}/`);
 });

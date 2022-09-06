const { getAreaLatLngByName, getNearestLocations, searchPlaces, getPlaceDetailsById, getSearchedPage } = require("./srGoogleCustomApis");

const getLocationsByArea = async( req, res ) => {
  const find = req.params?.find || "";
  const address = req.params?.address || "";
  if(!address|| !find) return res.status(404).send({message: "Not all params are set in request"});

  const LocationsPlaceIds = [];
  const placesDetails = [];
    
    const cityData = await getAreaLatLngByName(address);
    if(cityData.status !== "OK") return res.status(404).send(cityData.message);

    const locations = getNearestLocations(cityData.data);
    if(locations.length === 0) return res.status(404).send({message: "No nearby locations found"});

    await Promise.all(
      locations.map(async (loc) => {
        const places = await searchPlaces(loc, find, 5000);
        if(places && places.status !== "ZERO_RESULTS") {
          places.results.forEach(({place_id}) => {
            if(LocationsPlaceIds.indexOf(place_id) === -1)
              LocationsPlaceIds.push(place_id);
          });
        }
    }),);

    await Promise.all(
      LocationsPlaceIds.map(async (place_id) => {
        const placeInfo = await getPlaceDetailsById(place_id);
        if(placeInfo?.status === "OK") {
          placesDetails.push(placeInfo.data);
        }
      }),);


  return res.json(placesDetails.length > 0 ? placesDetails : {message: "No relevent data"});
}

const getPagesBySearch = async( req, res ) => {

  const search = req.params?.search || "";
  const engine = req.params?.engine || "";
  const limit = req.params?.limit || 10;

  if(!search || !engine) return res.status(404).send({message: "Not all params are set in request"});
  const dataSet = [];

  try {
    let pageNo = '1';
    for(let x = 0; x < limit; x++) {
      const page = await getSearchedPage(search, engine, pageNo);
      if(!page)  return res.status(404).send({message: "unknown Error"});
      dataSet.push(...page.items);
      const nextPage = page.queries?.nextPage;
      if( nextPage && nextPage.length > 0 ) {
        pageNo = nextPage[0].startIndex;
      }else {
        break;
      }
    }
    return res.json(dataSet);
  }
  catch (err) {
   next(err)
 }
}

module.exports = {getLocationsByArea, getPagesBySearch};


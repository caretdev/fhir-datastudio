function getFieldsPractitioner(request, fields) {
  var types = cc.FieldType;

  fields
    .newDimension()
    .setId('city')
    .setName('City')
    .setType(types.CITY);

  fields
    .newDimension()
    .setId('region')
    .setName('Region')
    .setType(types.REGION);

  fields
    .newDimension()
    .setId('cityRegion')
    .setName('CityRegion')
    .setType(types.TEXT);

  return fields;
}

function getPractitioner(request, requestedFields) {
  var data = []
  try {
    var values = {}
    var query = ``
    var apiResponse = fetchDataFromApi(request, 'Practitioner', query);
    do {
      if (apiResponse.issue) {
        cc.newUserError()
          .setDebugText('Error fetching data from API. Exception details: ' + e)
          .setText(
            apiResponse.issue[0].details.text
          )
          .throwException();
      }
      if (apiResponse.entry) {
        apiResponse.entry.forEach(function (entry) {
          var resource = entry.resource;
          var address = resource.address[0];
          var city = address.city;
          var region = address.state;
          var country = address.country;
          var cityRegion = `${city}, ${region}, ${country} `

          var info = [city, region, cityRegion].join('|');

          values[info] = (values[info] || 0) + 1;
        });
      }

      var next = apiResponse.link.find(el => el.relation === 'next');
      if (next) {
        apiResponse = fetchDataFromUrl(request, next.url);
      }
    } while (next)

    data = Object.keys(values).map(function (info) {
      [city, region, cityRegion] = info.split('|');
      count = values[info];
      return formatData(requestedFields, { city, region, cityRegion, count });
    });
  } catch (e) {
    cc.newUserError()
      .setDebugText('Error fetching data from API. Exception details: ' + e)
      .setText(
        'The connector has encountered an unrecoverable error. Please try again later, or file an issue if this error persists.'
      )
      .throwException();
  }

  return data
}

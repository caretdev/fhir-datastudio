function getFieldsEncounter(request, fields) {
  var types = cc.FieldType;

  fields
    .newDimension()
    .setId('practitioner')
    .setName('Practitoner')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('provider')
    .setName('Provider')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('status')
    .setName('Status')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('day')
    .setName('Date')
    .setType(types.YEAR_MONTH_DAY);

  return fields;
}


function getEncounter(request, requestedFields) {
  const getPractitioner = (encounter) => {
    var value = "";
    if (encounter.participant) {
      value = encounter.participant.find(el => el.hasOwnProperty('individual')).individual.display
    }
    return value;
  }
  console.log(request);
  var data = []
  try {
    var values = {}
    var query = '';
    if (request.dateRange) {
      query += `&date=le${request.dateRange.endDate}&date=ge${request.dateRange.startDate}`
    }
    var apiResponse = fetchDataFromApi(request, 'Encounter', query);
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
          var resource = entry.resource
          var date = (resource.period.start || resource.period.end).split('T')[0];
          var practitioner = getPractitioner(resource);
          var provider = resource.serviceProvider.display;
          var status = resource.status;

          var info = [date, practitioner, provider, status].join('|');

          values[info] = (values[info] || 0) + 1;
        });
      }

      var next = apiResponse.link.find(el => el.relation === 'next');
      if (next) {
        apiResponse = fetchDataFromUrl(request, next.url);
      }
    } while (next)

    data = Object.keys(values).map(function (info) {
      [day, practitioner, provider, status] = info.split('|');
      count = values[info];
      return formatData(requestedFields, { day, practitioner, provider, status, count });
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

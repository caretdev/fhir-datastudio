var cc = DataStudioApp.createCommunityConnector();

// https://developers.google.com/datastudio/connector/reference#getdata
function getData(request) {
  var requestedFields = getFields(request).forIds(
    request.fields.map(function (field) {
      return field.name;
    })
  );

  var data = [];
  switch (request.configParams.resource) {
    case 'Encounter':
      data = getEncounter(request, requestedFields)
      break;
    case 'Patient':
      data = getPatient(request, requestedFields)
      break;
    case 'Practitioner':
      data = getPractitioner(request, requestedFields)
      break;
  }

  return {
    schema: requestedFields.build(),
    rows: data
  };
}

function formatData(requestedFields, data) {
  var row = requestedFields.asArray().map(function (requestedField) {
    var value = data[requestedField.getId()] || '';
    switch (requestedField.getId()) {
      case 'day':
        return value.replace(/-/g, '');
      case 'dateTime':
        return value.split('+')[0].replace(/[^\d]/g, '');
      default:
        return value;
    }
  });
  return { values: row };
}

/**
 * Gets response for UrlFetchApp.
 *
 * @param {Object} request Data request parameters.
 * @returns {string} Response text for UrlFetchApp.
 */
function fetchDataFromApi(request, resource, query) {
  var url = [
    request.configParams.endpoint,
    '/',
    resource,
    '?',
    query
  ].join('');

  var params = {
    muteHttpExceptions: true,
    headers: {
      'x-api-key': request.configParams.apikey
    }
  }
  var response = UrlFetchApp.fetch(url, params);
  return JSON.parse(response);
}

function fetchDataFromUrl(request, url) {
  var params = {
    headers: {
      'x-api-key': request.configParams.apikey
    }
  }
  var response = UrlFetchApp.fetch(url, params);
  return JSON.parse(response);
}


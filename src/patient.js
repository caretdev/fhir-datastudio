function getFieldsPatient(request, fields) {
  var types = cc.FieldType;

  if (request.configParams.resourceId) {
    fields
      .newDimension()
      .setId('bodyWeight')
      .setName('Body Weight')
      .setType(types.NUMBER);

    fields
      .newDimension()
      .setId('bodyHeight')
      .setName('Body Height')
      .setType(types.NUMBER);

    fields
      .newDimension()
      .setId('bmi')
      .setName('BMI')
      .setType(types.NUMBER);

    fields
      .newDimension()
      .setId('claim')
      .setName('Claim')
      .setType(types.CURRENCY_USD);

    fields
      .newDimension()
      .setId('dateTime')
      .setName('Date Time')
      .setType(types.YEAR_MONTH_DAY_SECOND);

    return fields;
  }

  fields
    .newDimension()
    .setId('gender')
    .setName('Gender')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('age')
    .setName('Age')
    .setType(types.NUMBER);

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
    .setId('maritalStatus')
    .setName('Marital Status')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('language')
    .setName('Language')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('cityRegion')
    .setName('CityRegion')
    .setType(types.TEXT);

  return fields;
}

function getPatient(request, requestedFields) {
  if (request.configParams.resourceId) {
    if (requestedFields.getFieldById('claim')) {
      return getPatientClaim(request, requestedFields)
    }
    return getPatientObservation(request, requestedFields)
  }

  const getAge = (patient) => {
    var birthday = new Date(patient.birthDate);
    var ageDifMs = Date.now() - birthday.getTime();
    var ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }
  const getLanguage = (patient) => {
    if (!patient.communication || !patient.communication.length) {
      return "";
    }
    var language = (patient.communication.length > 1 ?
      patient.communication.find(el => el.preffered) || patient.communication[0]
      : patient.communication[0]).language;
    return language.text || language.coding[0].display;
  }
  var data = []
  try {
    var values = {}
    var query = ``
    var apiResponse = fetchDataFromApi(request, 'Patient', query);
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
          var gender = resource.gender;
          var age = getAge(resource);
          var address = resource.address[0];
          var city = address.city;
          var region = address.state;
          var country = address.country;
          var cityRegion = `${city}, ${region}, ${country} `
          var maritalStatus = resource.maritalStatus ? resource.maritalStatus.text : '';
          var language = getLanguage(resource);

          var info = [gender, age, city, region, cityRegion, maritalStatus, language].join('|');

          values[info] = (values[info] || 0) + 1;
        });
      }

      var next = apiResponse.link.find(el => el.relation === 'next');
      if (next) {
        apiResponse = fetchDataFromUrl(request, next.url);
      }
    } while (next)

    data = Object.keys(values).map(function (info) {
      [gender, age, city, region, cityRegion, maritalStatus, language] = info.split('|');
      count = values[info];
      return formatData(requestedFields, { gender, age, city, region, cityRegion, maritalStatus, language, count });
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


function getPatientObservation(request, requestedFields) {
  var data = []
  try {
    var query = `patient=${request.configParams.resourceId}`
    var valueField = 'value';
    if (requestedFields.getFieldById('bodyWeight')) {
      query += '&code=29463-7';
      valueField = 'bodyWeight';
    } else if (requestedFields.getFieldById('bodyHeight')) {
      query += '&code=8302-2';
      valueField = 'bodyHeight';
    } else if (requestedFields.getFieldById('bmi')) {
      query += '&code=39156-5';
      valueField = 'bmi';
    }
    query += '&_sort=-date'

    var apiResponse = fetchDataFromApi(request, 'Observation', query);
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
          var dateTime = resource.effectiveDateTime;
          var value = resource.valueQuantity.value;

          Logger.log({ dateTime, [valueField]: value })
          data.push(formatData(requestedFields, { dateTime, [valueField]: value }))
        });
      }

      var next = apiResponse.link.find(el => el.relation === 'next');
      if (next) {
        apiResponse = fetchDataFromUrl(request, next.url);
      }
    } while (next)

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

function getPatientClaim(request, requestedFields) {
  var data = []
  try {
    var query = `patient=${request.configParams.resourceId}`
    query += '&_sort=-created'

    var apiResponse = fetchDataFromApi(request, 'Claim', query);
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
          var dateTime = resource.created;
          var claim = resource.total.value;

          data.push(formatData(requestedFields, { dateTime, claim }))
        });
      }

      var next = apiResponse.link.find(el => el.relation === 'next');
      if (next) {
        apiResponse = fetchDataFromUrl(request, next.url);
      }
    } while (next)

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
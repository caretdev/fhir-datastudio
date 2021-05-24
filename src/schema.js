function getFields(request) {
  var fields = cc.getFields();
  var types = cc.FieldType;
  var aggregations = cc.AggregationType;

  // Common
  var countMetric = fields
    .newMetric()
    .setId('count')
    .setName('Count')
    .setType(types.NUMBER)
    .setAggregation(aggregations.SUM);

  fields.setDefaultMetric(countMetric.getId());

  switch (request.configParams.resource) {
    case 'Encounter':
      fields = getFieldsEncounter(request, fields)
      break;
    case 'Patient':
      fields = getFieldsPatient(request, fields)
      break;
    case 'Practitioner':
      fields = getFieldsPractitioner(request, fields)
      break;
  }

  return fields;
}

// https://developers.google.com/datastudio/connector/reference#getschema
function getSchema(request) {
  return { schema: getFields(request).build() };
}

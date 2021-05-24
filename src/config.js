// https://developers.google.com/datastudio/connector/reference#getconfig
function getConfig() {
  var config = cc.getConfig();

  config
    .newTextInput()
    .setId('endpoint')
    .setName('FHIR Endpoint')
    .setHelpText(
      'Enter the complete URL for FHIR Endpoint'
    );

  config
    .newTextInput()
    .setId('apikey')
    .setName('API-KEY')
    .setHelpText(
      'Enter API Token to access to FHIR'
    );

  config
    .newSelectSingle()
    .setId('resource')
    .setName('Resource')
    .addOption(config.newOptionBuilder().setLabel('Patient').setValue('Patient'))
    .addOption(config.newOptionBuilder().setLabel('Practitioner').setValue('Practitioner'))
    .addOption(config.newOptionBuilder().setLabel('Encounter').setValue('Encounter'))
    .setHelpText(
      'Select FHIR resource'
    );

  config
    .newTextInput()
    .setId('resourceId')
    .setName('Resource Id')
    .setAllowOverride(true)
    .setIsDynamic(true)
    .setHelpText(
      'Enter Id for FHIR resource'
    );

  config.setDateRangeRequired(false);

  return config.build();
}

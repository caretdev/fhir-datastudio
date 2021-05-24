# FHIR Data Studio Connector

Community connector to [Google Data Studio](https://datastudio.google.com/), with an ability to collect some information from FHIR server.

## Demo

Demo report with some data available here: https://datastudio.google.com/s/m-aPsHhT_iY

![Demo Report](https://raw.githubusercontent.com/caretdev/fhir-datastudio/main/img/report.png)

## Set up this connector for personal use

- Visit [Google Apps Script](https://script.google.com/) and create a new project.
- In the Apps Script development environment.
  - In Project Settings, tick `Show "appsscript.json" manifest file in editor`
  - Return to Editor replace of the content of file `appsscript.json` with the content of the `src/appsscript.json` file from the repository
  - For every .js file under src, you will need to create a file in Apps Scripts, then copy over the content from the repository.
  - Press `Deploy` -> `New Deployment` fill the description and press `Deploy` button
  - Copy `Deployment ID`
- Log in to [Google Data Studio](https://datastudio.google.com/)
  - Create new Data Source using `Build Your Own` connector.
  - Paste `Deployement ID` and press `Validate`
  - Should validate the connector, and give a tile for futher configuration

### Configuration

This connector requires you to enter the FHIR endpoint and AccessToken. In addition you have to choose the Resource, at the moment it supports only `Patient`, `Encounter` and `Practitioner`. Optionally for `Patient` possible to set `Resource Id`.

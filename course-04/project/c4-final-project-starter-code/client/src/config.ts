// api Id. Added to this file once sls deployed.
const apiId = '3hp41919x9'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map. For example:
  // domain: 'dev-nd9990-p4.us.auth0.com',
  domain: 'dev-mvy2g2d1cw7tgk8r.us.auth0.com',
  clientId: 'l8VcS78AJhx1LZuciW6AHadenECkCPJM',
  callbackUrl: 'http://localhost:3000/callback'
}

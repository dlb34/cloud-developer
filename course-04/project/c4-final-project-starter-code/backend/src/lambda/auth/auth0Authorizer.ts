import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const myLogger = createLogger('auth');

const jwksUrl = 'https://dev-mvy2g2d1cw7tgk8r.us.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  myLogger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    myLogger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    myLogger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token: string = getToken(authHeader);
  const jwt: Jwt = decode(token, { complete: true }) as Jwt;
  const cert: string = await getCert(jwt.header.kid);
  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload;
}

function getToken(authHeader: string): string {
  if (!authHeader) 
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

async function getCert(headerKid: string): Promise<string> {
  const getJwks = await Axios.get(jwksUrl, { 
    headers: { "Accept-Encoding": "gzip,deflate,compress" } 
  });

  const signingKeys = getJwks.data.keys
    .filter(key => key.use === 'sig'
                && key.kty === 'RSA'
                && key.kid
                && ((key.x5c && key.x5c.length) || (key.n && key.e))
    ).map(key => {
      return { kid: key.kid, nbf: key.nbf, publicKey: certToPEM(key.x5c[0]) };
    });
  

  if (!signingKeys.length) {
    throw new Error('The JWKS endpoint did not contain any signing keys');
  }
  
  const key = signingKeys.find(k => k.kid === headerKid);
  
  return key.publicKey;
}

function certToPEM(cert: string): string {
  cert = cert.match(/.{1,64}/g).join('\n');
  cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;
  return cert;
}
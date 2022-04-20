import { applicationDefault, cert, initializeApp } from 'firebase-admin/app';
import fs from 'fs';
import path from 'path';
/**
 * Return credentials based on hosting platform.
 * Will return applicationDefault if running on supported GCP projects
 * Or returns cert based credential using getServiceAccountKey module loaded lazily
 *
 * NOTES ON USING GCP:
 * Set GCP=true when using Google's infra, to use Google Application Default Credentials
 * Which are available by default so we do not need to get service key.
 * By default GCP provides "GOOGLE_APPLICATION_CREDENTIALS" env var, but this strat 1 out of 2
 * Thus using custom "GCP" env var to ensure availability
 * Refer to https://cloud.google.com/docs/authentication/production#providing_credentials_to_your_application
 */
export function getCredentials() {
  return process.env.GCP || process.env.GOOGLE_APPLICATION_CREDENTIALS || Boolean(applicationDefault())
    ? applicationDefault()
    : cert(getServiceAccountKey());
}

/**
 * When running on non-gcp cloud provider infra, use this to read service account key either from ENV or file
 * @function getServiceAccountKey
 * @returns {Object} service account key object
 */
export function getServiceAccountKey(): Object {
  // If env var for default credentials set, and is a JSON string, parse and return
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS && process.env.GOOGLE_APPLICATION_CREDENTIALS.charAt(0) === '{')
    return JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);

  // If inside env var, and is a JSON string, parse and return
  if (process.env.serviceAccountKey && process.env.serviceAccountKey.charAt(0) === '{')
    return JSON.parse(process.env.serviceAccountKey);

  /**
   * Else usually when running service locally
   *
   * Use path specified in env var to find service account key file,
   * Else assuming in node_modules dir, traverse up to get file that should be placed in root dir
   */
  const serviceAccountFilePath =
    process.env.serviceAccountKeyPath || path.join(process.cwd(), 'serviceAccountKey.json');

  // Inner import of fs module as only used conditionally
  // Use require to load and parse file into an object
  if (fs.existsSync(serviceAccountFilePath)) return require(serviceAccountFilePath);
  else throw new Error(`Service Account Key not at: "${serviceAccountFilePath}"`);
}

/**
 * Module wrapper around firebase-admin to initialize it with the
 * appropriate credentials based on the current platform it is on.
 * @author JJ
 * @module Firebase Admin initializeApp function
 */
export function initializeGCPWrappers(options = {}) {
  try {
    return initializeApp({
      ...options,
      credential: getCredentials(),
    });
  } catch (error) {
    console.error(error);

    // @todo Might potentially cut off un-finished stdout/stderr processes
    process.exit(1);
  }
}

export function awesomeFn() {
  return 'Hello';
}

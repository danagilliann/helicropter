/**
 * NodeJs Server-Side Example for Fine Uploader S3.
 * Maintained by Widen Enterprises.
 *
 * This example:
 *  - handles non-CORS environments
 *  - handles delete file requests assuming the method is DELETE
 *  - Ensures again the file size does not exceed the max (after file is in S3)
 *  - signs policy documents (simple uploads) and REST requests
 *    (chunked/multipart uploads)
 *
 * Requirements:
 *  - express 3.3.5+ (for handling requests)
 *  - crypto 0.0.3+ (for signing requests)
 *  - Amazon Node SDK 1.5.0+ (only if utilizing the AWS SDK for deleting files or otherwise examining them)
 *
 * Notes:
 *
 *  Change `expectedMinSize` and `expectedMaxSize` from `null` to integers
 *  to enable policy doc verification on size. The `validation.minSizeLimit`
 *  and `validation.maxSizeLimit` options **must** be set client-side and
 *  match the values you set below.
 *
 */

var express = require('express');
var bodyParser = require('body-parser');
var crypto = require('crypto');
var aws = require('aws-sdk');
var path = require('path');

var app = express();
var clientSecretKey = process.env.CLIENT_SECRET_KEY;

console.log(clientSecretKey);

// Set these two values to match your environment
var expectedBucket = 'helicropter-tmp-bucket';

// CHANGE TO INTEGERS TO ENABLE POLICY DOCUMENT VERIFICATION ON FILE SIZE
// (recommended)
var expectedMinSize = 0;
var expectedMaxSize = 8388608;
// EXAMPLES DIRECTLY BELOW:
//expectedMinSize = 0,
//expectedMaxSize = 15000000,

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));
app.use('/vendor', express.static(path.join(__dirname, '..', 'node_modules')));
app.use('/dist', express.static(path.join(__dirname, '..', 'dist')));

app.listen(8000);

// Handles all signature requests and the success request FU S3 sends after the file is in S3
// You will need to adjust these paths/conditions based on your setup.
app.post('/s3handler', function(req, res) {
  if (req.query.success !== undefined) {
    verifyFileInS3(req, res);
  }
  else {
    signRequest(req, res);
  }
});

// Handles the standard DELETE (file) request sent by Fine Uploader S3.
// Omit if you don't want to support this feature.
app.delete('/s3handler/*', function(req, res) {
  deleteFile(req.query.bucket, req.query.key, function(err) {
    if (err) {
      console.log('Problem deleting file: ' + err);
      res.status(500);
    }

    res.end();
  });
});

// Signs any requests.  Delegate to a more specific signer based on type of request.
function signRequest(req, res) {
  if (req.body.headers) {
    signRestRequest(req, res);
  }
  else {
    signPolicy(req, res);
  }
}

// Signs multipart (chunked) requests.  Omit if you don't want to support chunking.
function signRestRequest(req, res) {
  var stringToSign = req.body.headers,
    signature = crypto.createHmac('sha1', clientSecretKey)
  .update(stringToSign)
  .digest('base64');

  console.log(stringToSign);

  var jsonResponse = {
    signature: signature
  };

  res.setHeader('Content-Type', 'application/json');

  if (isValidRestRequest(stringToSign)) {
    res.end(JSON.stringify(jsonResponse));
  }
  else {
    res.status(400);
    res.end(JSON.stringify({invalid: true}));
  }
}

// Signs 'simple' (non-chunked) upload requests.
function signPolicy(req, res) {
  var base64Policy = new Buffer(JSON.stringify(req.body)).toString('base64'),
    signature = crypto.createHmac('sha1', clientSecretKey)
  .update(base64Policy)
  .digest('base64');

  var jsonResponse = {
    policy: base64Policy,
    signature: signature
  };

  res.setHeader('Content-Type', 'application/json');

  if (isPolicyValid(req.body)) {
    res.end(JSON.stringify(jsonResponse));
  }
  else {
    res.status(400);
    res.end(JSON.stringify({invalid: true}));
  }
}

// Ensures the REST request is targeting the correct bucket.
// Omit if you don't want to support chunking.
function isValidRestRequest(headerStr) {
  return new RegExp('\/' + expectedBucket + '\/.+$').exec(headerStr) != null;
}

// Ensures the policy document associated with a 'simple' (non-chunked) request is
// targeting the correct bucket and the min/max-size is as expected.
// Comment out the expectedMaxSize and expectedMinSize variables near
// the top of this file to disable size validation on the policy document.
function isPolicyValid(policy) {
  var bucket, parsedMaxSize, parsedMinSize, isValid;

  console.log(policy);

  policy.conditions.forEach(function(condition) {
    if (condition.bucket) {
      bucket = condition.bucket;
    }
    else if (condition instanceof Array && condition[0] === 'content-length-range') {
      parsedMinSize = condition[1];
      parsedMaxSize = condition[2];
    }
  });

  isValid = bucket === expectedBucket;

  // If expectedMinSize and expectedMax size are not null (see above), then
  // ensure that the client and server have agreed upon the exact same
  // values.
  if (expectedMinSize != null && expectedMaxSize != null) {
    isValid = isValid && (parsedMinSize === expectedMinSize.toString())
    && (parsedMaxSize === expectedMaxSize.toString());
  }

  return isValid;
}

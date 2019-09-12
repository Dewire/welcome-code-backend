# Välkommen hit - backend
This is the source code for the backend api of Välkommen hit.

## Development

Before running the application the dependencies need to be installed:
```
yarn install
```
To use a local _in memory_ database the __serverless-dynamodb-local__ plugin needs to install a database. This is done by running:
```
sls dynamodb install
```

Start the database instance seperate from sls offline by running:
```
sls dynamodb start --migrate
```

To start serverless offline:
```
AWS_OFFLINE=true AWS_REGION=eu-west-1 (all other env variables) serverless offline start
```
Add `--inMemory --migrate` to run the database in the same command/process.
```
AWS_OFFLINE=true AWS_REGION=eu-west-1 (all other env variables) serverless offline start --inMemory --migrate
```

## Build
```
sls package
```

## Deployment
To deploy prebuild package:
```
sls deploy --package .serveless
```
or to build and deploy at the same time:
```
sls deploy
```

## Environment Variables
-   __AWS_OFFLINE__ _true/false_, (Use true in development)
-   __DEBUG__ _regex_, `DEBUG=*` will show all logs. `DEBUG=dynamoose` will show only dynamoose logs. (etc, nice to have to see logs for third party librarys).
-   __ENC_PASS__ _password_ (Password used for encryption of map credentials to use against lantmäteriet)
-   __BOOLI_API_KEY__ Booli API key
-   __BOOLI_CALLER_ID__ Booli caller id
-   __USER_POOL__
-   __APP_CLIENT_ID__

## Debugging
checking logs in aws:
```
serverless logs --stage {stageName} --function {function}
```
e.g.
```
sls logs --stage dev --function getStartPageData```

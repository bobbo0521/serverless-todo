# Serverless To-Do API

Create a todo application using the serverless framework

[Inspired by Hans Melo](https://github.com/pmuens/serverless-book/blob/master/06-serverless-by-example/02-a-serverless-todo-application.md#creating-todos)

## Technologies

* [node.js](https://nodejs.org/en/)
* [serverless framework](https://serverless.com/)

## Creating Serverless `todo` service

```bash
serverless create --template aws-nodejs --name todo
```

## Creating DynamoDB Table

Define the DynamoDB table in `serverless.yml`

```yml
resources:
  Resources:
    TodoTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: todos
        AttributeDefinitions:
          - AttributeName: Id
            AttributeType: S
        KeySchema:
          - AttributeName: Id
            KeyType: HASH
        ProvisionedThroughput:
          ReadCapacityUnits: 1
          WriteCapacityUnits: 1
```

### IAM Role statements

When `serverless` deploys a Lambda function it attaches an IAM role with a policy that defines the resources your functions are allowed to interact with. 

In the _provider_ section of `serverless.yml` add the following policy. 

```yml
provider:
  name: aws
  runtime: nodejs8.10
  iamRoleStatements:
    - Effect: "Allow"
      Action: 
        - dynamodb:DescribeTable
        - dynamodb:Query
        - dynamoDb:Scan
        - dynamoDb:GetItem
        - dynamoDb:PutItem
        - dynamoDb:UpdateItem
        - dynamoDb:DeleteItem
      Resource: 
        - {Fn::GetAtt: ["TodoTable","Arn"]}
```
## Setting up dependancies

We are going to use npm to install an external library called `uuid`. This will allow us to generate a unique identifier for `todos` when they are created. 

```bash
npm init -y
npm install uuid
```

_NOTE: we will also be using the `aws-sdk` package, however Lambda functions automatically have access to the SDKs so there is no need to install them locally._

## Creating todos

### 1. Writing the code

Create a new file `src/create/createHandler.js` with the following code:

```javascript
'use strict'
const AWS = require('aws-sdk')
AWS.config.update({region:process.env.AWS_REGION})
const DynamoDB = new AWS.DynamoDB.DocumentClient()
const uuid = require('uuid/v4')

class CreateHandler{
    async process(event){
        try{
            const body = JSON.parse(event.body);
            return await Save(body.name);
        }
        catch(error){
            console.log(error);
            throw error;
        }
    }
}

async function Save(name){
    const params = {
        TableName: "todos",
        Item:{
            Id: uuid(),
            Name: name
        }
    }

    return await DynamoDB.put(params).promise().then(res => params.Item);
}

module.exports = new CreateHandler();
```

The entry point will be the `process` function in `CreateHandler`, which takes `event` as a parameter. This will be the event passed to our Lambda function from API Gateway (in this case it will be a POST event). We will convert the `body` of the event to a JSON object, and pass the `name` property to the `Save` function. 

The `Save` function handles the actual DynamoDB interaction and returns the full todo object. 

While I don't have any validation or error handling, I prefer this pattern because each function is contained and therefore better suited for unit testing. 

Next create a new file `src/create/index.js` with the following contents:

```javascript
const handler = require('./createHandler');
module.exports.handler = async(event,context) => {
    try{
        const result = await handler.process(event);
        return{
            statusCode: 200,
            body: JSON.stringify(result)
        }
    }
    catch(error){
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Something went wrong",
                requestId: context.awsRequestId
            })
        }
    }
}
```

In this file we are importing our `CreateHandler` class that we created previously. The sole responsibility of this file is to handle the request from API Gateway and return a relevant JSON response. 

### 2. Add our function to `serverless.yml`

Now that we've created our function we need to tell serverless what it is, and how it will be accessed. Update `serverless.yml` with the following:

```yml
functions:
  create:
    handler: src/create/index.handler
    events:
      - http:
          path: /todo
          method: post
```

Here we are doing two-ish things:
1. Defining the handler (which is how Lambda knows what code to execute)
2. Adding an API Gateway endpoint with a path, and defining the HTTP method

### 3. Deploy our new function

Now let's deploy our service and see it in action! 

```bash
serverless deploy
```

I prefer to use [Postman](https://www.getpostman.com/) for testing my APIs, but you can use whatever tool you wish. 

```bash
curl -H "Content-Type: application/json" -X POST -d '{ "name" : "My first todo" }' <your-endpoint-url>
```

That's it! You've just deployed your first serverless application. Other functions can be found in this repository. 
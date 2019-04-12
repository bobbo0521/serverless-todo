'use strict'
const AWS = require('aws-sdk')
AWS.config.update({region:process.env.AWS_REGION})
const DynamoDB = new AWS.DynamoDB.DocumentClient()

class DeleteHandler{
    async process(event){
        try{
            const {id} = event.pathParameters;
            await Delete(id);
            return {"message":`${id} deleted`}
        }
        catch(error){
            console.log(error);
            throw "Something went wrong"
        }
    }
}

async function Delete(id){
    const params = {
        TableName: 'todos',
        Key:{
            Id: id
        }
    }
    return await DynamoDB.delete(params).promise();
}

module.exports = new DeleteHandler();
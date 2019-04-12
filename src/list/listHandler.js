const AWS = require('aws-sdk')
AWS.config.update({region:process.env.AWS_REGION})
const DynamoDB = new AWS.DynamoDB.DocumentClient();

class ListHandler{
    async process(event){
        try{
            return await List();
        }
        catch(error){
            console.log(error);
            throw "Something went wrong"
        }
    }
}

async function List(){
    const params = {
        TableName: "todos"
    }

    return await DynamoDB.scan(params).promise();
}

module.exports = new ListHandler();
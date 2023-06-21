import * as AWS from 'aws-sdk';
// changed to require as imprting AWSXRAY caused errors
const AWSXRay = require('aws-xray-sdk')
// import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger';
import { TodoItem } from '../models/TodoItem';
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS);
const docClient = new XAWS.DynamoDB.DocumentClient();

const myLogger = createLogger('TodosAccess');

export class TodosAccess {
    constructor(
        private readonly todosTable = process.env.TODOS_TABLE
    ) { }
    
     // Get all TODO items for a user
    async getTodos(userId: string): Promise<TodoItem[]> {
        myLogger.debug('getToDos function called');
        const tableName = this.todosTable

        const params = {
            TableName: tableName,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        };
  
        const result = await docClient.query(params).promise();
  
        return result.Items as TodoItem[];
    }
    
    // Create a new TODO item
    async createTodo(todoItem: TodoItem): Promise<TodoItem> {
        myLogger.debug('createTodo function called');
        const tableName = this.todosTable

        await docClient.put({
            TableName: tableName,
            Item: todoItem
        }).promise();
  
        return todoItem as TodoItem;
    }

    // Update a TODO item
    async updateTodo(todoId: string, userId: string, TodoUpdate: TodoUpdate): Promise<TodoItem> {
        myLogger.debug('updateTodo function called');
        const tableName = this.todosTable

        const params = {
            TableName: tableName,
            Key: {
                todoId: todoId,
                userId: userId                
            },
            UpdateExpression: "set #todoName = :todoName, dueDate = :dueDate, done = :done",
            ExpressionAttributeNames: { '#todoName': "name" },
            ExpressionAttributeValues: {
                ":todoName": TodoUpdate.name,
                ":dueDate": TodoUpdate.dueDate,
                ":done": TodoUpdate.done
            },
            ReturnValues: "ALL_NEW"
        };

        const result = await docClient.update(params).promise();

        return result.Attributes as TodoItem;
    }

    // Delete a TODO item
    async deleteTodo(todoId: string, userId: string): Promise<any> {
        console.log("deleteTodo function called");
        const tableName = this.todosTable

        const params = {
            TableName: tableName,
            Key: {
                todoId: todoId,
                userId: userId                
            },
        };

        return await docClient.delete(params).promise();
    }

    // Update the attachment URL for a TODO item
    async updateAttachmentForTodo(todoId: string, userId: string, attachmentUrl: string): Promise<TodoItem> {
        myLogger.debug('updateAttachmentForTodo function called');
        const tableName = this.todosTable

        const params = {
            TableName: tableName,
            Key: {
                todoId: todoId,
                userId: userId                
            },
            UpdateExpression: "set attachmentUrl = :url",
            ExpressionAttributeValues: {
                ":url": attachmentUrl
            },
            ReturnValues: "ALL_NEW"
        };

        const result = await docClient.update(params).promise();

        return result.Attributes as TodoItem;
    }
}
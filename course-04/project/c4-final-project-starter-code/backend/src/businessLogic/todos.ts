import { TodosAccess } from '../dataLayer/todosAcess';
import { AttachmentUtils } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
import { createLogger } from '../utils/logger';
import * as uuid from 'uuid'
// import * as createError from 'http-errors'
// TODO: Implement businessLogic

const myLogger = createLogger("todos");
const todoAccess = new TodosAccess();
const attachmentUtils = new AttachmentUtils();

export async function createTodo(createTodoRequest: CreateTodoRequest, userId: string): Promise<TodoItem> {
    // Log the creation of a new todo
    myLogger.info("create to do function called");

    // Generate a unique todoId using UUID
    const todoId = uuid.v4();

    // Get the current timestamp for the createdAt field
    const createdAt = new Date().toISOString();

    // Extract the name and dueDate from the createTodoRequest
    const name = createTodoRequest.name;
    const dueDate = createTodoRequest.dueDate;

    // Create a new TodoItem object
    const newItem: TodoItem = {} as TodoItem;
    newItem.userId = userId;
    newItem.todoId = todoId;
    newItem.createdAt = createdAt;
    newItem.name = name;
    newItem.dueDate = dueDate;
    newItem.done = false;

    return await todoAccess.createTodo(newItem);
}

export async function getTodos(userId: string): Promise<any> {
    myLogger.info("getTodos function called");

    return await todoAccess.getTodos(userId);
}

export async function deleteTodo(todoId: string, userId: string) {
    myLogger.info("deleteTodo function called");

    await todoAccess.deleteTodo(todoId, userId);
}

export async function updateTodo(todoId: string, userId: string, model: UpdateTodoRequest) {
    myLogger.info("updateTodo function called")

    await todoAccess.updateTodo(todoId, userId, model);
}

export async function generatePresignedUrl(todoId: string, userId: string): Promise<string> {
    myLogger.info("generatingPresignedUrl function called");

    // Construct the database URL
    const databaseUrl: string = `https://${process.env.ATTACHMENT_S3_BUCKET}.s3.amazonaws.com/${todoId}`;

    // Generate the pre-signed URL for the attachment using the attachmentUtils object
    const attachmentUrl:string = attachmentUtils.generateSignedUrl(todoId);

    await todoAccess.updateAttachmentForTodo(todoId, userId, databaseUrl);

    return attachmentUrl;
}
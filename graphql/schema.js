const { buildSchema } = require('graphql');


module.exports = buildSchema(`
    type Answer {
        id: String,
        answer: String,
    }

    type Question {
        _id: ID!
        question: String!
        type: String!
        answers: [Answer]
    }

    type Form {
        _id: ID!
        title: String!
        content: String!
        creator: User!
        createdAt: String!
        updatedAt: String!
        questions: [Question!]!
    }

    type User {
        _id: ID!
        name: String!
        email: String!
        password: String
        status: String!
        forms: [Form!]!
    }

    type AuthData {
        token: String!
        userId: String!
    }

    type FormData {
        forms: [Form!]!
        totalForms: Int!
    }

    input UserInputData {
        email: String!
        name: String!
        password: String!
    }

    input QuestionAnswer {
        id: String,
        answer: String,
    }

    input QuestionInput {
        question: String!
        formType: String!
        answers: [QuestionAnswer]
    }

    input FormInputData {
        title: String!
        content: String!
        questions: [QuestionInput]
    }

    type UserData {
        users: [User!]!
        totalUsers: Int
    }

    type RootQuery {
        login(email: String!, password: String!): AuthData!
        forms(page: Int): FormData!
        form(id: ID!): Form!
        user: User!
        users: UserData!
    }

    type RootMutation {
        createUser(userInput: UserInputData): User!
        createForm(formInput: FormInputData): Form!
        updateForm(id: ID!, formInput: FormInputData): Form!
        deleteForm(id: ID!): Boolean
        updateStatus(status: String!): User!
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);

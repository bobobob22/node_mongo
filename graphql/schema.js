const { buildSchema } = require('graphql');


module.exports = buildSchema(`
    type Answer {
        id: String,
        answer: String,
    }

    type Solver {
        name: String!,
        email: String!,
        number: String!,
    }

    type Question {
        _id: ID!
        question: String!
        formType: String
        answers: [Answer]
    }

    type Form {
        _id: ID!
        title: String!
        content: String
        creator: User
        createdAt: String!
        updatedAt: String!
        questions: [Question!]!
        parentId: String
    }

    type User {
        _id: ID!
        name: String!
        email: String!
        password: String
        status: String!
        forms: [Form!]!
        addedForms: [String]
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
        parentId: String
    }

    type UserData {
        users: [User!]!
        totalUsers: Int
    }

    type RootQuery {
        login(email: String!, password: String!): AuthData!
        forms(page: Int): FormData!
        form(id: ID!): Form!
        addedForms(page: Int, name: String): FormData!
        addedForm(id: ID!): Form!
        availableForms(page: Int): FormData!
        user: User!
        users: UserData!
    }

    type RootMutation {
        createUser(userInput: UserInputData): User!
        createForm(formInput: FormInputData): Form!
        saveForm(formInput: FormInputData): Form!
        updateForm(id: ID!, formInput: FormInputData): Form!
        deleteForm(id: ID!): Boolean
        updateStatus(status: String!): User!
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);

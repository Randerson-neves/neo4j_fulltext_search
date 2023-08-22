"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const faker_1 = require("@faker-js/faker");
const neo4j_driver_1 = __importDefault(require("neo4j-driver"));
const driver = neo4j_driver_1.default.driver('neo4j://localhost:7687', neo4j_driver_1.default.auth.basic('neo4j', 'laura-monaco-product-short-cobra-8958'));
function insertGroups() {
    return __awaiter(this, void 0, void 0, function* () {
        const session = driver.session();
        try {
            for (let i = 0; i < 1500; i++) {
                const groupId = i + 1;
                let groupTitle = faker_1.faker.company.name();
                yield session.run('CREATE (n:Group {id: $id, title: $title})', { id: groupId, title: groupTitle });
            }
        }
        finally {
            session.close();
        }
    });
}
function insertUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        const session = driver.session();
        try {
            for (let i = 0; i < 10000; i++) {
                const userId = i + 1;
                const userName = faker_1.faker.person.firstName();
                yield session.run('CREATE (n:User {id: $id, name: $name})', { id: userId, name: userName });
                for (let j = 0; j < 15; j++) {
                    yield session.run(`
                MATCH (u:User {id: $userId}), (g:Group)
                WITH u, g
                ORDER BY rand()
                LIMIT 1
                MERGE (u)-[:BELONGS_TO]->(g)
                `, { userId });
                }
            }
        }
        finally {
            session.close();
        }
    });
}
// Execute as funções em sequência
insertGroups().then(() => {
    return insertUsers();
}).then(() => {
    driver.close();
}).catch(error => {
    console.error("Erro ao inserir dados:", error);
    driver.close();
});
// // Associar artigos a grupos
// for (let i = 0; i < 50000; i++) {
//     const articleId = i+1;
//     const articleTitle = faker.lorem.sentence();
//     const articleContent = faker.lorem.paragraphs(4);
//     session.run('CREATE (a:Article {id: $id, title: $title, content: $content})', {
//         id: articleId,
//         title: articleTitle,
//         content: articleContent,
//     });
//     // Associar o artigo a 30 grupos aleatórios
//     for (let j = 0; j < 30; j++) {
//         session.run(`
//             MATCH (a:Article {id: $articleId}), (g:Group)
//             WITH a, g
//             ORDER BY rand()
//             LIMIT 1
//             MERGE (a)-[:ASSOCIATED_WITH]->(g)
//         `, { articleId });
//     }
// }

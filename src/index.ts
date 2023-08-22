import { faker } from '@faker-js/faker';
import neo4j from 'neo4j-driver';

const driver = neo4j.driver('neo4j://localhost:7687', neo4j.auth.basic('neo4j', 'laura-monaco-product-short-cobra-8958'));

async function insertGroups() {
    const session = driver.session();
    try {
        for (let i = 0; i < 1500; i++) {
            const groupId = i+1;
            let groupTitle = faker.company.name();
            await session.run('CREATE (n:Group {id: $id, title: $title})', { id: groupId, title: groupTitle });
        }
    } finally {
        session.close();
    }
}

async function insertUsers() {
    const session = driver.session();
    try {
        for (let i = 0; i < 10000; i++) {
            const userId = i+1;
            const userName = faker.person.firstName();
            await session.run('CREATE (n:User {id: $id, name: $name})', { id: userId, name: userName });
            
            for (let j = 0; j < 15; j++) {
                await session.run(`
                MATCH (u:User {id: $userId}), (g:Group)
                WITH u, g
                ORDER BY rand()
                LIMIT 1
                MERGE (u)-[:IN_GROUP]->(g)
                `, { userId });
            }
        }
    } finally {
        session.close();
    }
}

async function insertArticles() {
    const session = driver.session();
    try {
        for (let i = 0; i < 50000; i++) {
            const articleId = i+1;
            const articleTitle = faker.lorem.sentence();
            const articleContent = faker.lorem.paragraphs(4);
            
            await session.run('CREATE (a:Article {id: $id, title: $title, content: $content})', {
                id: articleId,
                title: articleTitle,
                content: articleContent,
            });

            // Associar o artigo a 30 grupos aleatórios
            for (let j = 0; j < 30; j++) {
                await session.run(`
                    MATCH (a:Article {id: $articleId}), (g:Group)
                    WITH a, g
                    ORDER BY rand()
                    LIMIT 1
                    MERGE (a)-[:ASSOCIATED_WITH]->(g)
                `, { articleId });
            }
        }
    } finally {
        session.close();
    }
}


insertGroups()
    .then(() => {
        return insertUsers();
    })
    .then(() => {
        return insertArticles();
    })
    .then(() => {
        driver.close();
    })
    .catch(error => {
        console.error("Erro ao inserir dados:", error);
        driver.close();
    });
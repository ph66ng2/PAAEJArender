const db = require('./database');

async function createTables() {
  try {
    console.log('⏳ Iniciando a criação das tabelas...');

    // 1. Tabela AVATAR
    await db.query(`
      CREATE TABLE IF NOT EXISTS avatar (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        preco INT NOT NULL
      );
    `);

    // 2. Tabela CURSOS
    await db.query(`
      CREATE TABLE IF NOT EXISTS cursos (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL
      );
    `);

    // 3. Tabela MODULOS
    await db.query(`
      CREATE TABLE IF NOT EXISTS modulos (
        id SERIAL PRIMARY KEY,
        curso_id INT,
        nome VARCHAR(100) NOT NULL,
        FOREIGN KEY (curso_id) REFERENCES cursos(id)
      );
    `);

    // 4. Tabela AULAS
    await db.query(`
      CREATE TABLE IF NOT EXISTS aulas (
        id SERIAL PRIMARY KEY,
        modulo_id INT,
        titulo VARCHAR(150) NOT NULL,
        conteudo TEXT,
        ordem INT,
        FOREIGN KEY (modulo_id) REFERENCES modulos(id)
      );
    `);

    // 5. Tabela QUESTIONARIOS
    await db.query(`
      CREATE TABLE IF NOT EXISTS questionarios (
        id SERIAL PRIMARY KEY,
        aula_id INT,
        FOREIGN KEY (aula_id) REFERENCES aulas(id)
      );
    `);

    // 6. Tabela QUESTOES
    await db.query(`
      CREATE TABLE IF NOT EXISTS questoes (
        id SERIAL PRIMARY KEY,
        questionario_id INT,
        enunciado TEXT NOT NULL,
        alternativa_a VARCHAR(255),
        alternativa_b VARCHAR(255),
        alternativa_c VARCHAR(255),
        alternativa_d VARCHAR(255),
        alternativa_e VARCHAR(255),
        correta CHAR(1),
        FOREIGN KEY (questionario_id) REFERENCES questionarios(id)
      );
    `);

    // 7. Tabela USUARIOS
    await db.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        senha VARCHAR(255) NOT NULL,
        moedas INT DEFAULT 0,
        avatar_id INT,
        FOREIGN KEY (avatar_id) REFERENCES avatar(id)
      );
    `);

    // 8. Tabela PROGRESSO_USUARIO
    await db.query(`
      CREATE TABLE IF NOT EXISTS progresso_usuario (
        usuario_id INT,
        aula_id INT,
        concluido BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (usuario_id, aula_id),
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
        FOREIGN KEY (aula_id) REFERENCES aulas(id)
      );
    `);

    // 9. Tabela RESPOSTAS_USUARIO
    await db.query(`
      CREATE TABLE IF NOT EXISTS respostas_usuario (
        usuario_id INT,
        questao_id INT,
        resposta CHAR(1),
        correta BOOLEAN,
        PRIMARY KEY (usuario_id, questao_id),
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
        FOREIGN KEY (questao_id) REFERENCES questoes(id)
      );
    `);

    // 10. Tabela PERSONALIZACOES_COMPRADAS
    // Nota: Transformei o ENUM em VARCHAR para evitar complexidade no Postgres
    await db.query(`
      CREATE TABLE IF NOT EXISTS personalizacoes_compradas (
        usuario_id INT,
        tipo VARCHAR(50),
        item_id INT,
        PRIMARY KEY (usuario_id, tipo, item_id),
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
      );
    `);

    console.log('✅ Todas as tabelas foram criadas com sucesso!');
    process.exit(0); // Encerra o script com sucesso
  } catch (err) {
    console.error('❌ Erro ao criar tabelas:', err);
    process.exit(1); // Encerra com erro
  }
}

createTables();
CREATE DATABASE paeeja;
USE paeeja;

CREATE TABLE avatar (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    preco INT NOT NULL
);

CREATE TABLE cursos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL
);

CREATE TABLE modulos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    curso_id INT,
    nome VARCHAR(100) NOT NULL,
    FOREIGN KEY (curso_id) REFERENCES cursos(id)
);

CREATE TABLE aulas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    modulo_id INT,
    titulo VARCHAR(150) NOT NULL,
    conteudo TEXT,
    ordem INT,
    FOREIGN KEY (modulo_id) REFERENCES modulos(id)
);

CREATE TABLE questionarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aula_id INT,
    FOREIGN KEY (aula_id) REFERENCES aulas(id)
);

CREATE TABLE questoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
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

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    moedas INT DEFAULT 0,
    avatar_id INT,
    FOREIGN KEY (avatar_id) REFERENCES avatar(id)
);

CREATE TABLE progresso_usuario (
    usuario_id INT,
    aula_id INT,
    concluido BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (usuario_id, aula_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (aula_id) REFERENCES aulas(id)
);

CREATE TABLE respostas_usuario (
    usuario_id INT,
    questao_id INT,
    resposta CHAR(1),
    correta BOOLEAN,
    PRIMARY KEY (usuario_id, questao_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (questao_id) REFERENCES questoes(id)
);

CREATE TABLE personalizacoes_compradas (
    usuario_id INT,
    tipo ENUM('avatar'),
    item_id INT,
    PRIMARY KEY (usuario_id, tipo, item_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

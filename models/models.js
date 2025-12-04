const db = require('../database');

async function criarUsuario(nome, email, senha) {
  // POSTGRES: Usa $1, $2... e RETURNING id para devolver o ID criado
  const { rows } = await db.query(
    'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING id', 
    [nome, email, senha]
  );
  return rows[0].id;
}

async function buscarPorEmailSenha(email, senha) {
  const { rows } = await db.query(
    'SELECT * FROM usuarios WHERE email = $1 AND senha = $2', 
    [email, senha]
  );
  if (rows.length === 0) return null;
  return rows[0];
}

async function buscarNomeUsuario(email) {
  const { rows } = await db.query(
    'SELECT nome FROM usuarios WHERE email = $1', 
    [email]
  );
  if (rows.length === 0) return null;
  return rows[0].nome;
}

async function buscarCapas() {
  const { rows } = await db.query("SELECT id, nome, preco FROM avatar");
  return rows;
}

async function buscarPrecoItem(tipo, itemId) {
  const { rows } = await db.query(
    "SELECT preco FROM avatar WHERE id = $1", 
    [itemId]
  );
  return rows[0];
}

async function buscarMoedas(usuarioId) {
  const { rows } = await db.query(
    "SELECT moedas FROM usuarios WHERE id = $1", 
    [usuarioId]
  );
  return rows[0];
}

async function jaComprou(usuarioId, tipo, itemId) {
  const { rows } = await db.query(
    "SELECT * FROM personalizacoes_compradas WHERE usuario_id = $1 AND tipo = $2 AND item_id = $3",
    [usuarioId, tipo, itemId]
  );
  return rows.length > 0;
}

async function descontarMoedas(usuarioId, valor) {
  await db.query(
    "UPDATE usuarios SET moedas = moedas - $1 WHERE id = $2", 
    [valor, usuarioId]
  );
}

async function registrarCompra(usuarioId, tipo, itemId) {
  await db.query(
    "INSERT INTO personalizacoes_compradas (usuario_id, tipo, item_id) VALUES ($1, $2, $3)",
    [usuarioId, tipo, itemId]
  );
}

async function atualizarAvatar(usuarioId, avatarId) {
  const sql = 'UPDATE usuarios SET avatar_id = $1 WHERE id = $2';
  await db.query(sql, [avatarId, usuarioId]);
}

async function buscarAvatarEquipado(usuarioId) {
  const { rows } = await db.query(
    "SELECT avatar_id FROM usuarios WHERE id = $1", 
    [usuarioId]
  );
  return rows[0];
}

async function verificarProgresso(usuarioId, aulaId) {
  const { rows } = await db.query(
    'SELECT * FROM progresso_usuario WHERE usuario_id = $1 AND aula_id = $2',
    [usuarioId, aulaId]
  );
  return rows.length > 0;
};

async function registrarProgresso(usuarioId, aulaId) {
  await db.query(
    'INSERT INTO progresso_usuario (usuario_id, aula_id, concluido) VALUES ($1, $2, $3)',
    [usuarioId, aulaId, true]
  );
};

async function adicionarMoedas(usuarioId, quantidade) {
  await db.query(
    'UPDATE usuarios SET moedas = moedas + $1 WHERE id = $2',
    [quantidade, usuarioId]
  );
};

// --- Funções com COUNT (Postgres retorna string, precisamos converter para Int) ---

async function contarTotalAulas() {
  const { rows } = await db.query('SELECT COUNT(*) AS total FROM aulas');
  return parseInt(rows[0].total); 
}

async function contarTotalExercicios() {
  const { rows } = await db.query('SELECT COUNT(*) AS total FROM questionarios');
  return parseInt(rows[0].total);
}

async function contarAulasConcluidas(usuarioId) {
  const { rows } = await db.query(
    'SELECT COUNT(*) AS total FROM progresso_usuario WHERE usuario_id = $1 AND concluido = true',
    [usuarioId]
  );
  return parseInt(rows[0].total);
}

async function contarExerciciosFeitos(usuarioId) {
  const { rows } = await db.query(`
    SELECT COUNT(DISTINCT q.questionario_id) AS total
    FROM respostas_usuario r
    JOIN questoes q ON r.questao_id = q.id
    WHERE r.usuario_id = $1
  `, [usuarioId]);
  return parseInt(rows[0].total);
}

async function obterQuestoesDoQuestionario(questionarioId) {
  const { rows } = await db.query(
    'SELECT * FROM questoes WHERE questionario_id = $1 ORDER BY id',
    [questionarioId]
  );
  return rows;
}

// --- VERSÃO SEGURA: Funciona mesmo sem constraints no banco ---
async function salvarRespostas(usuarioId, respostas) {
  for (const { questao_id, resposta, correta } of respostas) {
    
    // 1. Tenta atualizar primeiro (caso o usuário já tenha respondido essa questão)
    const { rowCount } = await db.query(
      `UPDATE respostas_usuario 
       SET resposta = $1, correta = $2 
       WHERE usuario_id = $3 AND questao_id = $4`,
      [resposta, correta, usuarioId, questao_id]
    );

    // 2. Se rowCount for 0, significa que não encontrou nada para atualizar.
    // Então fazemos o INSERT de uma nova resposta.
    if (rowCount === 0) {
      await db.query(
        `INSERT INTO respostas_usuario (usuario_id, questao_id, resposta, correta) 
         VALUES ($1, $2, $3, $4)`,
        [usuarioId, questao_id, resposta, correta]
      );
    }
  }
}

async function contarAcertos(usuarioId, questionarioId) {
  const { rows } = await db.query(
    `SELECT COUNT(*) AS acertos FROM respostas_usuario r
       JOIN questoes q ON r.questao_id = q.id
       WHERE r.usuario_id = $1 AND r.correta = true AND q.questionario_id = $2`,
    [usuarioId, questionarioId]
  );
  return parseInt(rows[0].acertos);
}

async function verificarSeJaRespondeu(usuarioId, questionarioId) {
  const { rows } = await db.query(
    `SELECT 1 FROM respostas_usuario r
       JOIN questoes q ON r.questao_id = q.id
       WHERE r.usuario_id = $1 AND q.questionario_id = $2 LIMIT 1`,
    [usuarioId, questionarioId]
  );
  return rows.length > 0;
}

async function obterRespostasUsuario(usuarioId, questionarioId) {
  const { rows } = await db.query(
    `SELECT r.questao_id, r.resposta, r.correta, q.correta AS correta_questao
       FROM respostas_usuario r
       JOIN questoes q ON r.questao_id = q.id
       WHERE r.usuario_id = $1 AND q.questionario_id = $2`,
    [usuarioId, questionarioId]
  );
  return rows;
}

module.exports = {
  criarUsuario,
  buscarPorEmailSenha,
  buscarNomeUsuario,
  buscarCapas,
  buscarPrecoItem,
  buscarMoedas,
  jaComprou,
  descontarMoedas,
  registrarCompra,
  atualizarAvatar,
  buscarAvatarEquipado,
  verificarProgresso,
  registrarProgresso,
  adicionarMoedas,
  contarTotalAulas,
  contarTotalExercicios,
  contarAulasConcluidas,
  contarExerciciosFeitos,
  obterQuestoesDoQuestionario,
  salvarRespostas,
  contarAcertos,
  verificarSeJaRespondeu,
  obterRespostasUsuario
};
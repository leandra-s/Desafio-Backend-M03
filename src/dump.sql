CREATE DATABASE dindin;

CREATE TABLE usuarios (
	id serial primary key,
  nome varchar(255) not null,
  email varchar(255) not null unique,
  senha varchar(225) not null
);

CREATE TABLE categorias (
	id serial primary key,
  descricao varchar(255)
);

CREATE TABLE transacoes (
	id serial primary key,
  descricao varchar(255),
  valor integer,
  data timestamp,
  categoria_id integer references categorias(id),
  usuario_id integer references usuarios(id),
  tipo varchar(255)
);

INSERT INTO categorias (descricao) 
values
('Alimentação'),
('Assinaturas e Serviços'),
('Casa'),
('Mercado'),
('Cuidados Pessoais'),
('Educação'),
('Família'),
('Lazer'),
('Pets'),
('Presentes'),
('Roupas'),
('Saúde'),
('Transporte'),
('Salário'),
('Vendas'),
('Outras receitas'),
('Outras despesas');
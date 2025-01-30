# DoMatch - Gerenciador de Competições de Dominó

## Sobre o Projeto

DoMatch é uma aplicação web para gerenciar competições de dominó, permitindo a criação de comunidades, organização de competições e acompanhamento de estatísticas dos jogadores.

## Funcionalidades Principais

- Gestão de comunidades com integração ao WhatsApp
- Criação e gerenciamento de competições
- Registro de jogos e partidas
- Sistema de pontuação com diferentes tipos de vitória
- Estatísticas detalhadas por jogador
- Modo offline com sincronização automática

## Tecnologias Utilizadas

- React
- Tailwind CSS
- Supabase (Autenticação e Banco de Dados)
- TypeScript
- API do WhatsApp

## Configuração do Ambiente

### Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn
- Conta no Supabase (https://supabase.com)

### Configuração do Supabase

1. Crie um projeto no Supabase
2. Execute o script SQL em `supabase/migrations/20250129_initial_schema.sql`
3. Configure as variáveis de ambiente:
   ```bash
   REACT_APP_SUPABASE_URL=sua_url_do_supabase
   REACT_APP_SUPABASE_KEY=sua_chave_anon_public
   ```

### Instalação

1. Clone o repositório
   ```bash
   git clone https://github.com/seu-usuario/domatch.git
   cd domatch
   ```

2. Instale as dependências
   ```bash
   npm install
   # ou
   yarn install
   ```

3. Execute o projeto
   ```bash
   npm start
   # ou
   yarn start
   ```

## Estrutura do Banco de Dados

### Tabelas Principais

- `users`: Usuários do sistema
- `communities`: Comunidades de jogadores
- `community_members`: Membros das comunidades
- `competitions`: Competições
- `competition_players`: Jogadores das competições
- `games`: Jogos
- `matches`: Partidas
- `player_stats`: Estatísticas dos jogadores

### Tipos de Usuário

1. **Administrador**
   - Pode criar e gerenciar comunidades
   - Tem todos os privilégios de organizador

2. **Organizador**
   - Pode criar e gerenciar competições
   - Pode adicionar jogadores
   - Pode registrar jogos e partidas

3. **Jogador**
   - Pode visualizar competições e estatísticas
   - Pode participar de jogos

## Regras de Pontuação

- **Vitória Simples**: 1 ponto
- **Vitória de Carroça**: 2 pontos
- **Vitória de Lá-e-lô**: 3 pontos
- **Vitória de Cruzada**: 4 pontos
- **Vitória por Contagem**: 1 ponto
- **Empate**: 0 ponto (próxima partida vale +1)

### Vitórias Especiais

- **Buchuda**: Quando uma dupla vence sem que a adversária marque pontos
- **Buchuda de Ré**: Quando uma dupla vence após virar o placar estando em desvantagem de 5 a 0

## Contribuição

1. Faça um Fork do projeto
2. Crie uma Branch para sua Feature (`git checkout -b feature/AmazingFeature`)
3. Faça commit das suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Faça Push para a Branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

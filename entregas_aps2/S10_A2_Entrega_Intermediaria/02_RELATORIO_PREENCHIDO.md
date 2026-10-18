# 📄 RELATÓRIO PARCIAL DE PROJETO (CONSOLIDAÇÃO S01 A S09 — BASE A2)
**Nome Oficial do Arquivo (.docx):** `APSII_S10_CARAFOOD.docx`  
**Disciplina:** Análise e Projeto de Sistemas II (APS II) — Centro Universitário Módulo  
**Docente Avaliador:** Prof. Me. Cristiano S. Negrão  

---

## 1. Identificação do Projeto e do Grupo

- **Nome do Projeto / Sistema:** **CaráFood** *(Roteiro e Plataforma Gastronômica dos 53 Bairros de Caraguatatuba)*
- **Docente Responsável:** Prof. Me. Cristiano S. Negrão
- **Tema / Domínio:** Gastronomia Local, Turismo Regional e Guia de Restaurantes de Caraguatatuba/SP
- **Tipo de Aplicação:** `( X ) WEB`   `(   ) Mobile`   `(   ) Desktop`   `( X ) Híbrido / Responsivo`
- **Link do Sistema Publicado (Produção Vercel):** [https://foddtech.vercel.app/](https://foddtech.vercel.app/)
- **Repositório do Código (GitHub):** `https://github.com/GaboBiroo/caragua-foodtech-mono`

| Integrante | RGM | E-mail Acadêmico | Papel Principal no Grupo |
| :--- | :--- | :--- | :--- |
| **Gabriel Rodrigues** | *[Inserir RGM]* | `gabriel.rodrigues@modulo.edu.br` | Product Owner (PO) e Desenvolvimento Front-End / Integração |
| **Matheus Vicente** | *[Inserir RGM]* | `matheus.vicente@modulo.edu.br` | Levantamento de Dados Regionais, Back-End e Banco de Dados |
| **Pedro Simone** | *[Inserir RGM]* | `pedro.simone@modulo.edu.br` | Testes de Usabilidade (QA), Revisão de Interface e Documentação |

---

## 2. Contexto, Problema e Objetivos

### 2.1 Contexto e Motivação (resumo da S01)
Como moradores e estudantes em Caraguatatuba, percebemos no dia a dia que a nossa cidade tem uma culinária caiçara muito forte e espalhada por **53 bairros**, indo desde a criação artesanal de mexilhões na **Praia da Cocanha (pela associação AMAPEC)** e a chegada diária de peixes frescos no **Entreposto do Camaroeiro (Colônia de Pescadores Z-8)**, até os restaurantes que participam todo ano do festival **Caraguá a Gosto**. A nossa motivação nasceu da vontade de criar uma vitrine digital própria da cidade (o **CaráFood**), com visual de rede social gastronômica, que valorize tanto os restaurantes tradicionais do Centro e Martim de Sá quanto os quiosques e comércios familiares de bairros mais afastados, como Tinga, Rio do Ouro, Massaguaçu, Tabatinga e Porto Novo.

### 2.2 Problema principal que o sistema resolve
Hoje, quem mora em Caraguá ou vem passar o fim de semana enfrenta dois problemas práticos quando quer sair para comer: primeiro, os aplicativos de delivery comuns mostram quase sempre os mesmos *fast-foods* do Centro e deixam invisíveis dezenas de quiosques de praia e restaurantes de bairro que servem pratos típicos como o *Azul-Marinho na panela de ferro*. Segundo, as avaliações em sites genéricos muitas vezes misturam notas antigas de anos atrás com notas sem critério (ou até combinadas), sem mostrar o preço real do prato no cardápio nem se o peixe ou mexilhão tem procedência local. O **CaráFood** resolve exatamente essa falta de visibilidade dos 53 bairros e a falta de transparência nos preços e avaliações.

### 2.3 Objetivo geral e 2–3 objetivos específicos
- **Objetivo Geral:** Desenvolver uma plataforma web responsiva (**CaráFood**) que funcione como catálogo visual e guia gastronômico dos 53 bairros de Caraguatatuba, reunindo fotos reais dos pratos, preços transparentes, rotas de chegada e uma cédula de avaliação justa inspirada no festival *Caraguá a Gosto*.
- **Objetivos Específicos:**
  1. **Organizar a busca pelos 53 bairros sem poluição visual:** Criar um filtro rápido com os 10 polos gastronômicos mais procurados no topo da tela e um mapa/modal dividido nas 4 regiões da cidade (Centro, Norte, Sul e Serra/Interior) para localizar facilmente qualquer bairro;
  2. **Implementar as 6 telas principais interligadas:** Entregar em funcionamento real a Home/Landing Page (`/`), Sobre Nós (`/sobre`), Contato/Credenciamento (`/contato`), Login (`/login`), Catálogo/Rankings (`/rankings`) e Página de Detalhe do Prato (`/prato/[id]`);
  3. **Estruturar uma avaliação justa e um canal de cadastro para restaurantes locais:** Permitir que o cliente avalie os pratos em 5 critérios claros (sabor, apresentação, ingredientes locais, atendimento e ambiente) e que donos de quiosques/restaurantes solicitem seu credenciamento na plataforma.

---

## 3. Histórias de Usuário e Mapa de Páginas

### 3.1 Lista consolidada de histórias de usuário (mín. 6)

- **HU01 (Usuário Final — Morador ou Turista):**  
  *Como* morador ou turista em Caraguatatuba, *quero* filtrar o catálogo de pratos pelos 53 bairros da cidade (ou pelo clima do dia, como praia ou jantar), *para* encontrar opções reais de onde comer perto de mim sem perder tempo procurando em vários perfis diferentes.
- **HU02 (Usuário Final — Cliente pesquisando prato e rota):**  
  *Como* cliente interessado em um prato do feed, *quero* clicar nele para abrir sua página de detalhe com foto ampliada, preço no cardápio, descrição dos ingredientes e botão direto para o Google Maps/Waze, *para* saber exatamente quanto vou gastar e como chegar ao restaurante.
- **HU03 (Usuário Final — Avaliador do Caraguá a Gosto):**  
  *Como* frequentador dos restaurantes da cidade, *quero* avaliar o prato que consumi dando notas de 1 a 5 nos cinco quesitos do festival (sabor, apresentação, originalidade, atendimento e ambiente), *para* ajudar outros clientes com uma nota honesta e juntar pontos no meu passaporte gastronômico.
- **HU04 (Gestor / Proprietário de Restaurante ou Quiosque):**  
  *Como* dono de um restaurante ou quiosque em um dos bairros de Caraguatatuba, *quero* preencher o formulário da página de Contato/Credenciamento informando os dados do meu comércio e meu prato principal, *para* solicitar a inclusão do meu estabelecimento no catálogo do CaráFood.
- **HU05 (Gestor / Administrador da Plataforma):**  
  *Como* administrador e moderador do sistema, *quero* acessar a tela de Login com meu e-mail e senha, *para* entrar na área restrita de moderação, conferir os pedidos de cadastro de restaurantes e acompanhar o ranking dos pratos.
- **HU06 (Outro Ator — Maricultor da AMAPEC Cocanha / Pescador da Colônia Z-8):**  
  *Como* produtor de mexilhões da Praia da Cocanha (AMAPEC) ou pescador artesanal do Camaroeiro (Colônia Z-8), *quero* que os pratos feitos com nossos produtos frescos tenham um selo de identificação na plataforma e sua história contada na página Sobre Nós, *para* valorizar o trabalho caiçara local.

### 3.2 Mapa de páginas / user flow (versão mais atual)

O fluxo abaixo reflete exatamente as rotas que já estão programadas e funcionando hoje no sistema:

```
+-------------------------------------------------------------------------------------------------+
|                      MENU DE NAVEGAÇÃO PRINCIPAL FIXO NO TOPO (Navbar.tsx)                      |
|      [ Início (/) ]   [ Sobre Nós (/sobre) ]   [ Contato (/contato) ]   [ Rankings (/rankings) ]|
|                                      [ Login (/login) ]                                         |
+------------------------------------------------+------------------------------------------------+
                                                 |
       +--------------------+--------------------+--------------------+--------------------+
       |                    |                    |                    |                    |
       v                    v                    v                    v                    v
+--------------+    +---------------+    +---------------+    +---------------+    +---------------+
| 1. HOME E    |    | 2. SOBRE NÓS  |    | 3. CONTATO /  |    | 4. LOGIN      |    | 5. LISTA E    |
| LANDING (/)  |    |   (/sobre)    |    | CREDENCIE-SE  |    |   (/login)    |    | RANKINGS      |
| - Destaques  |    | - História de |    |  (/contato)   |    | - E-mail/Senha|    | (/ e /rankings|
| - Filtro 53  |    |   Caraguá     |    | - Formulário  |    | - Perfis de   |    | - Cards dos   |
|   Bairros    |    | - Missão/Visão|    |   53 Bairros  |    |   Acesso      |    |   Pratos      |
|   (HU01)     |    | - Equipe      |    |   (HU04)      |    |   (HU05)      |    | - Notas/Preço |
+------+-------+    |   (HU06)      |    +---------------+    +-------+-------+    +-------+-------+
       |            +---------------+                                 |                    |
       |                                                              v                    |
       |                                                      +---------------+            |
       |                                                      | Área Restrita |            |
       |                                                      | (/moderation) |            |
       +--------------------------------------------------------------+--------------------+
                                       |
               (Clique em qualquer Prato do Feed ou do Ranking)
                                       v
                       +-------------------------------+
                       | 6. PÁGINA DE DETALHE DO PRATO |
                       |         (/prato/[id])         |
                       | - Foto grande, preço e ficha  |
                       | - CTA 1: Abrir Rota no Maps   |
                       | - CTA 2: Avaliar Prato (HU03) |
                       |   (Padrão Master-Detail HU02) |
                       +-------------------------------+
```

---

## 4. Protótipo e Páginas Implementadas

### 4.1 Protótipo inicial (prints ou links do protótipo)
O nosso protótipo inicial foi desenhado na S02 pensando em unir a facilidade visual do Instagram com as informações práticas de um cardápio local. Durante a programação das semanas S03 a S09, evoluímos esse protótipo direto para o código em Next.js 14 publicado na Vercel:
- **Link Público da Aplicação Funcionando:** [https://foddtech.vercel.app/](https://foddtech.vercel.app/)

> 📌 **[INSERIR PRINT NO WORD — ITEM 4.1]:** Colar aqui o print da visão geral inicial / wireframe do projeto mostrando a evolução para a interface atual.

---

### 4.2 Páginas já implementadas

Todas as 6 páginas solicitadas entre a S03 e a S09 já foram codificadas, estilizadas e estão no ar:

#### 1) Home / Landing Page (`https://foddtech.vercel.app/`)
- **O que foi feito:** É a porta de entrada do **CaráFood**. Traz o cabeçalho verde e dourado com o nome do projeto e o símbolo das ondas de Caraguatatuba, um resumo direto do propósito do site, a faixa interativa com dicas do mascote *Chef Jacquin Praiano*, a barra dos 10 polos gastronômicos em destaque, o botão que abre o modal completo dos **53 bairros divididos em 4 regiões**, os filtros de ocasião/categoria e o feed principal.
> 📌 **[INSERIR PRINT NO WORD — HOME / LANDING PAGE]:** Tirar print do topo da página `https://foddtech.vercel.app/` mostrando o banner principal, os polos e o modal dos 53 bairros.

#### 2) Sobre Nós (`https://foddtech.vercel.app/sobre`)
- **O que foi feito:** Página institucional acessível pelo menu superior. Conta de forma amigável a história da gastronomia de Caraguatatuba (destacando a Fazenda Marinha da Cocanha — AMAPEC, o Entreposto do Camaroeiro — Colônia Z-8 e a tradição do Azul-Marinho e do festival Caraguá a Gosto), apresenta nossa Missão, Visão e Valores, e traz os créditos dos três integrantes do grupo (**Gabriel Rodrigues, Matheus Vicente e Pedro Simone**).
> 📌 **[INSERIR PRINT NO WORD — PÁGINA SOBRE NÓS]:** Tirar print da página `https://foddtech.vercel.app/sobre`.

#### 3) Contato / Credenciamento (`https://foddtech.vercel.app/contato`)
- **O que foi feito:** Página voltada tanto para dúvidas de usuários quanto para o pré-cadastro (agendamento de curadoria e credenciamento) de novos restaurantes e quiosques da cidade. Possui um formulário funcional com Nome do Responsável, Nome do Restaurante, seleção de qualquer um dos **53 bairros de Caraguatatuba**, Categoria, E-mail, WhatsApp, Prato Principal e Mensagem. Ao enviar, valida os dados e mostra uma mensagem de confirmação na tela.
> 📌 **[INSERIR PRINT NO WORD — PÁGINA DE CONTATO]:** Tirar print da página `https://foddtech.vercel.app/contato` mostrando o formulário preenchido.

#### 4) Login (`https://foddtech.vercel.app/login`)
- **O que foi feito:** Tela de acesso restrito ligada diretamente no menu principal. Possui campos de E-mail/Usuário e Senha (com opção de mostrar/esconder senha), seleção de perfil (*Comensal*, *Gestor de Restaurante* ou *Curador/Admin*) e tratamento visual completo: se o usuário tentar entrar com senha inválida/curta, exibe um alerta vermelho de erro; se entrar com as credenciais corretas, exibe o aviso verde de sucesso e libera o botão para o painel restrito.
> 📌 **[INSERIR PRINT NO WORD — TELA DE LOGIN]:** Tirar print da página `https://foddtech.vercel.app/login` mostrando os campos de login e a mensagem de feedback.

#### 5) Lista Principal / Catálogo e Rankings (`https://foddtech.vercel.app/` e `https://foddtech.vercel.app/rankings`)
- **O que foi feito:** O catálogo principal aparece tanto em formato de Cards no Feed da Home quanto em formato de lista classificatória na aba **Rankings (`/rankings`)**. Cada item mostra a foto real do prato, nome do restaurante, bairro em Caraguatatuba, distância da praia, preço no cardápio (`R$`), nota média em estrelas e selos de destaque (*Caraguá a Gosto*, *Mexilhão da Cocanha* ou *Camaroeiro*).
> 📌 **[INSERIR PRINT NO WORD — LISTA PRINCIPAL / CATÁLOGO]:** Tirar print dos cards de pratos no feed e/ou da tabela na página `https://foddtech.vercel.app/rankings`.

#### 6) Página de Detalhe (`https://foddtech.vercel.app/prato/post-centro-azul-marinho`)
- **O que foi feito:** Implementa o padrão *Master–Detail*. Quando o usuário clica no nome de qualquer prato da lista ou no botão *"Ver Ficha Completa & Rota"*, o sistema abre a página exclusiva daquele prato (`/prato/[id]`). Ela mostra uma barra de caminho no topo (*Breadcrumb* para voltar fácil), a foto grande do prato, todos os detalhes de preparo, comentário do Chef Jacquin, avaliações de clientes e dois botões de ação principais (CTAs): **"Como Chegar (Abrir no Google Maps / Waze)"** e **"Avaliar Prato na Cédula Oficial (+50 Pontos)"**.
> 📌 **[INSERIR PRINT NO WORD — PÁGINA DE DETALHE]:** Tirar print da página `https://foddtech.vercel.app/prato/post-centro-azul-marinho` destacando os botões de ação (CTAs).

---

## 5. Navegação e Fluxos Principais

### 5.1 Descrição da navegação (menu, links, caminhos típicos)
A navegação do **CaráFood** foi centralizada no componente `Navbar.tsx`, que fica fixo no topo da tela (`sticky top-0`) em todas as páginas do sistema para que o usuário nunca fique perdido. No menu principal, colocamos 5 links diretos e fáceis de entender: **Início (`/`)**, **Sobre Nós (`/sobre`)**, **Contato (`/contato`)**, **Rankings (`/rankings`)** e **Login (`/login`)**, além do clique na logo do **CaráFood** que sempre retorna para a Home. O item da página atual fica destacado em amarelo-ouro (`#FFB703`) para o usuário saber exatamente onde está, e no celular o menu se adapta em um botão recolhível (*menu hambúrguer*). Nas páginas internas de prato (`/prato/[id]`), incluímos também um *Breadcrumb* (`Início > Bairro > Nome do Prato`) para facilitar a volta ao catálogo com um único clique.

### 5.2 Fluxos principais hoje possíveis no sistema
Hoje qualquer pessoa que acessar o link do projeto já consegue realizar 4 fluxos completos do início ao fim:
1. **Fluxo de Descoberta e Detalhe (Usuário entra $\rightarrow$ filtra bairro $\rightarrow$ vê lista $\rightarrow$ abre detalhe $\rightarrow$ traça rota):**  
   O usuário entra na Home (`/`), escolhe um bairro (por exemplo, clicando em *Cocanha* na barra ou abrindo o mapa dos *53 Bairros*), vê a lista filtrada apenas com os pratos daquela região, clica em **"Ver Ficha Completa & Rota"** para abrir a Página de Detalhe (`/prato/post-cocanha-mexilhoes`) e clica no botão **"Como Chegar"** para abrir a localização no Google Maps.
2. **Fluxo de Avaliação de Prato (Usuário na lista ou detalhe $\rightarrow$ abre cédula $\rightarrow$ vota nos 5 critérios $\rightarrow$ envia avaliação):**  
   O usuário clica em **"Avaliar (+50 Pontos)"**, dá suas notas de 1 a 5 para Sabor, Apresentação, Originalidade, Atendimento e Ambiente, escreve seu comentário e confirma; o comentário passa a aparecer na hora no prato e seus Pontos Gourmet sobem no topo da tela.
3. **Fluxo de Credenciamento de Restaurante (Dono de comércio entra $\rightarrow$ vai em Contato $\rightarrow$ preenche dados e bairro $\rightarrow$ recebe protocolo):**  
   O proprietário clica em **Contato (`/contato`)** no menu, preenche os dados do seu restaurante selecionando um dos 53 bairros de Caraguatatuba e envia a solicitação, recebendo a confirmação imediata na tela.
4. **Fluxo de Acesso Restrito (Gestor/Curador vai em Login $\rightarrow$ valida credenciais $\rightarrow$ acessa moderação):**  
   O usuário clica em **Login (`/login`)** no menu, seleciona o perfil ou digita e-mail e senha (podendo testar tanto o aviso de erro para senha incorreta quanto o login válido) e segue para o painel de moderação.

---

## 6. Análise Parcial e Próximos Passos

### 6.1 O que foi alcançado até agora (S01–S09)
Entre as semanas S01 e S09, nosso grupo conseguiu sair da ideia inicial no papel e colocar no ar todas as páginas previstas no escopo da disciplina: definimos o problema real focado nos 53 bairros de Caraguatatuba (S01), escrevemos as 6 histórias de usuário e o mapa de navegação (S02), e programamos em Next.js a Home Page (S03), a página Sobre Nós contando a história caiçara da Cocanha e do Camaroeiro (S04), o formulário de Contato/Credenciamento (S05), o Menu Global presente em todas as rotas (S06), a tela de Login com validação de erro e sucesso (S07), o Catálogo de pratos e Rankings com filtros funcionando (S08) e a Página de Detalhe *Master–Detail* de cada prato com botões de rota e avaliação (S09). Além disso, já deixamos o sistema publicado online na Vercel (`https://foddtech.vercel.app/`).

### 6.2 Principais dificuldades encontradas
Durante a construção prática das telas, enfrentamos três dificuldades principais que nos ensinaram bastante em grupo:
1. **Poluição visual ao tentar mostrar os 53 bairros de uma vez:** No começo, colocamos todos os 53 bairros de Caraguatatuba em uma única barra de bolinhas no topo da Home, mas ficou muito poluído e cansativo de rolar. Resolvemos isso deixando apenas os **10 polos mais movimentados** na barra rápida e criando um botão **"Explorar todos os 53 Bairros"** que abre uma janela organizada pelas 4 regiões da cidade com busca rápida.
2. **Sobreposição de elementos na tela (selos em cima da foto do prato):** Nas primeiras versões dos cards, os selos de premiação e o botão flutuante do mascote Jacquin acabavam tapando parte da foto da comida em telas menores. Tivemos que reorganizar o `z-index` de cada camada e deixar os selos alinhados no topo da foto com fundo translúcido.
3. **Conciliar a rotina de trabalho e família com o ritmo das entregas:** Como parte do grupo trabalha em regime de turnos puxados e enfrentou questões familiares de saúde nas últimas semanas, tivemos que redobrar a organização pelo WhatsApp e GitHub para dividir as tarefas de código, revisão e documentação sem deixar nenhuma tela faltando.

### 6.3 Próximas entregas até a A1 (o que falta implementar)
Para a reta final da disciplina (da S11 até a entrega final A1 na S16), nosso cronograma de trabalho foca em quatro pontos:
1. **Refinamento de layout e registro de versionamento (S11):** Documentar o comparativo *"Antes e Depois"* das melhorias visuais que fizemos na barra de bairros e nos cards, mantendo o histórico organizado de commits no GitHub;
2. **Testes de Usabilidade com usuários de fora do grupo (S12):** Colocar 3 pessoas (um turista, um estudante morador e um comerciante local) para testar os fluxos do site cronometrando o tempo e anotando onde tiveram dúvida para aplicar melhorias (MoSCoW);
3. **Integração definitiva com Banco de Dados em produção (S13 e S14):** Conectar os formulários de avaliação de pratos e de credenciamento de restaurantes para gravar e ler os registros de forma persistente no banco PostgreSQL (Supabase/Neon), além de documentar o funcionamento do domínio e DNS;
4. **Checklist Final, Roteiro de Apresentação e Relatório A1 (S15 e S16):** Revisar todos os itens do checklist final do professor, ensaiar a apresentação dividida entre o Gabriel, o Matheus e o Pedro, e entregar o relatório técnico final completo.

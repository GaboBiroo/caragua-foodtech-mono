# 🚨 Auditoria Técnica & Diagnóstico Crítico (Visão Tech Lead / Usuário Sênior Reddit)
## Projeto: Caraguá FoodTech — Análise de Usabilidade, Bugs Visuais e Plano das 15 Melhorias

> **Data da Auditoria:** 15 de Outubro de 2026  
> **Avaliador:** Perspectiva Crítica de Engenharia de Software / Tech Lead Reddit (`r/brdev`, `r/webdev`, `r/UXDesign`)  
> **Bases Metodológicas:** Dossiê Enciclopédico de Caraguatatuba (Dossiê 1) & Dossiê de Design Industrial e Benchmark Top 200 (Dossiê 2)  
> **Status da Aplicação:** Deploy Ativo na Vercel ([foddtech.vercel.app](https://foddtech.vercel.app/))

---

## 1. O Raio-X do "Bug Visual" (Análise da Imagem Submetida)

Ao inspecionar a captura de tela (`media_1792085367826.png`), qualquer desenvolvedor sênior ou designer de produto identifica imediatamente uma **catástrofe de colisão de camadas (Stacking Context Collision)**. 

### O que deu errado na tela:
1. **Colisão Central Desastrosa (Dynamic Island vs Stories vs Input de Busca):**
   - A `DynamicIsland` foi renderizada com `fixed top-24 left-1/2 -translate-x-1/2 z-40`. 
   - Logo abaixo da Navbar, ela despenca verticalmente sobre a barra de Stories dos 53 Bairros e cobre o campo de busca. 
   - Resultado: os bairros centrais (*Martim de Sá*, *Prainha*, *Sumaré*, *Jardim Jaçanã*) ficaram **100% inacessíveis e invisíveis**. O usuário não consegue clicar nos stories nem no input de busca porque o card da ilha está bloqueando o ponteiro do mouse (`pointer-events`).
2. **Duplicação Bizarra de Elementos Institucionais:**
   - Na Navbar (`h-20`), já existe o botão `Portal Prof. Cristiano`.
   - Imediatamente abaixo, dentro do header verde, há **um segundo botão idêntico** `Portal Prof. Cristiano` flutuando solto na direita.
   - A Navbar exibe em letras garrafais `CARAGUÁ FOODTECH`. E logo abaixo, o header repete em fonte gigante `CARAGUÁ FOODTECH`, consumindo mais de 350px de altura vertical com texto duplicado antes de exibir qualquer comida.
3. **"Guerra de Três Jacquins" Simultâneos na Mesma Tela:**
   - Um Jacquin enorme na Navbar (topo esquerdo);
   - Um Jacquin médio dentro da Dynamic Island (centro);
   - Um Jacquin gigante com card de checkboxes no canto inferior direito (bottom right);
   - Um quarto Jacquin dentro de cada card do feed na caixa de dica!
   - *Comentário do Reddit:* *"Parece que o desenvolvedor descobriu que tinha o PNG do Jacquin e decidiu colocar ele em todos os cantos da tela ao mesmo tempo, brigando por atenção."*
4. **Card Flutuante Inferior Desarticulado:**
   - O card `CHEF JACQUIN • No Ar` com os status (`Paladar Caiçara Ativo`, etc.) está desvinculado visualmente do corpo do Jacquin, gerando um espaço vazio estranho e flutuando por cima do botão de rota e dos pratos.
5. **Invasão de Badges sobre a Fotografia do Prato:**
   - No card do *Quiosque Canto Bravo*, foram colocados 3 badges verticais empilhados (`Pódio Tradicional da Orla`, `Pescado do Camaroeiro`, `Promoção de Praia`). Eles cobrem quase 40% da foto do badejo! A foto, que é o gatilho sensorial primordial da comida (Dossiê 2), fica sufocada por texto promocional.

---

## 2. As 15 Melhorias, Consertos e Mudanças Críticas

Para atingir padrão internacional (Apple HIG / Airbnb / DoorDash) e cumprir com louvor os dois dossiês, definimos as seguintes 15 ações cirúrgicas:

### 🛠️ Eixo A: Arquitetura de Layout, Stacking & Eliminação de Conflitos Visuais

1. **Fix 1 — Eliminação da Colisão da Dynamic Island (Fim do Bug da Imagem):**
   - Remover o posicionamento flutuante descontrolado (`fixed top-24`).
   - Transformar a interação com o Chef Jacquin em um componente integrado e inteligente que não fica flutuando por cima dos stories e do input de busca.
   - Deixar a barra de Stories dos 53 Bairros e a Barra de Busca com área limpa e 100% clicável.

2. **Fix 2 — Unificação do Header & Fim da Duplicidade de Títulos e Botões:**
   - Eliminar a repetição de `CARAGUÁ FOODTECH` e o botão duplicado do `Portal Prof. Cristiano`.
   - A Navbar superior já contém a marca oficial com o Jacquin e o botão acadêmico. O header abaixo passa a ser um banner hero esguio, focado no lema caiçara, nos 53 bairros e nos pontos do usuário.

3. **Fix 3 — Redesenho do Mascote Companheiro (Bottom-Right) em Padrão Korus/Coucou Coeso:**
   - Unificar o Jacquin flutuante inferior em um widget único, elegante e sólido.
   - O avatar, os status e o botão de chat devem formar um bloco único, sem peças soltas flutuando pelo viewport, com opção de minimizar para não cobrir o conteúdo do feed.

4. **Fix 4 — Hierarquia Estrita de Z-Index (Sistema de Camadas Sem Conflito):**
   - `z-50`: Modais em tela cheia (Cédula Oficial, Portal Acadêmico, Chat Jacquin);
   - `z-40`: Navbar superior sticky;
   - `z-30`: Barra de Stories dos 53 Bairros (sticky durante rolagem);
   - `z-20`: Mascote flutuante inferior;
   - `z-10`: Badges de pratos e tooltips Xiaohongshu;
   - `z-0`: Conteúdo base do feed e imagens.

---

### 🎨 Eixo B: Experiência Visual, Apetência e Dossiê de Design

5. **Fix 5 — Reorganização dos Badges na Foto do Prato (Foco na Comida):**
   - Em vez de empilhar 3 ou 4 badges gigantes verticalmente tapando o peixe, adotar uma barra horizontal discreta de micro-pílulas translúcidas (`backdrop-blur-md bg-stone-950/75`), posicionadas com elegância no topo da imagem sem cobrir o prato.

6. **Fix 6 — Realocação do Botão de Compartilhar (Share) para a Barra Social:**
   - No card atual, o botão de compartilhamento aparece solto no cabeçalho do restaurante.
   - Mover o botão de compartilhar para a barra de ações sociais (ao lado de Curtir, Comentar e Salvar no Roteiro), respeitando o padrão universal do Instagram.

7. **Fix 7 — Calibração do Zoom Global e Largura de Leitura:**
   - Estabilizar a largura do feed em `max-w-2xl` a `max-w-3xl` com tipografia balanceada. Aumentar o tamanho das imagens mantendo proporção áurea equilibrada sem esticar botões desproporcionalmente.

8. **Fix 8 — Carrossel de Stories com Navegação Suave e Setas de Apoio:**
   - Adicionar botões discretos de rolagem horizontal (seta esquerda/direita) nos stories para usuários de desktop que usam mouse tradicional sem rodinha horizontal.

---

### 🌊 Eixo C: Fidelidade ao Dossiê Histórico e Dados Caiçaras de Caraguá

9. **Fix 9 — Validação Rígida dos Insumos Reais nos 15 Pratos do Catálogo:**
   - Garantir que nenhum prato use termos artificiais. Todo insumo deve seguir a tradição de Caraguatatuba: *Mexilhão da Cocanha AMAPEC*, *Badejo à Dorê do Camaroeiro (Colônia Z-8)*, *Azul-Marinho na panela de ferro com banana verde*, *Sororoca grelhada*, *Peixe-Porco no fubá*.

10. **Fix 10 — Trilha do Usuário Completa (User Journey) Sem Pontas Soltas:**
    - Garantir que cada clique no prato (foto, título ou botão "Ver Ficha Completa") leve fluidamente para `/prato/[id]`.
    - Na página `/prato/[id]`, o botão "Como Chegar" deve abrir a rota real do estabelecimento no Google Maps/Waze, e o botão "Avaliar" deve disparar a Cédula Oficial de 5 critérios.

11. **Fix 11 — Filtro Vivo por Bairro com Feedback Visual Claro:**
    - Ao selecionar um bairro no carrossel de stories (ex.: *Cocanha*, *Martim de Sá*, *Tinga*), a página deve rolar suavemente para o feed e exibir um banner sutil: *"Exibindo pratos em [Bairro] • X pratos encontrados"*, com botão claro de "Limpar Filtro".

12. **Fix 12 — Aprimoramento da Cédula Oficial de 5 Critérios do Festival:**
    - Ajustar os sliders da cédula para calcular o score ponderado em tempo real com animação numérica fluida e exibir a nota final com as cores oficiais do festival (`#FFB703` e `#135136`).

---

### ⚡ Eixo D: Engenharia de Software, Performance & Acessibilidade

13. **Fix 13 — WCAG 2.2 AAA em Todos os Textos Secundários:**
    - Eliminar qualquer texto cinza claro sobre fundo branco (`text-stone-400` que falhe em contraste). Utilizar no mínimo `text-stone-600` (contraste > 7:1) em legendas, datas e metadados.

14. **Fix 14 — Otimização de Performance e Prevenção de Layout Shift (CLS):**
    - Definir dimensões explícitas e aspect-ratio em todas as tags de imagem para evitar que o layout "pule" durante o carregamento inicial.

15. **Fix 15 — Sincronização e Deploy Contínuo sem Discrepâncias:**
    - Manter sincronização automática e rigorosa entre `src/` e `web-admin/src/`, garantindo que o build de produção gere todas as 28 rotas estáticas sem warnings e sem arquivos orfãos.

---

## 3. Matriz de Prioridade de Execução

| Prioridade | Ação | Complexidade | Impacto Visual / UX |
| :---: | :--- | :---: | :---: |
| **P0 (Imediata)** | Resolver a colisão da Dynamic Island e eliminar duplicação de títulos/botões | Média | **Máximo (Corrige o bug da foto)** |
| **P0 (Imediata)** | Redesenhar o mascote flutuante (Bottom-Right) em formato coeso e não intrusivo | Média | **Alto (Elegância de produto)** |
| **P1 (Alta)** | Reorganizar badges da foto do prato para dar destaque à comida | Baixa | **Alto (Apetência e clareza visual)** |
| **P1 (Alta)** | Mover botão de compartilhamento para a barra social | Baixa | **Médio (Padrão universal)** |
| **P2 (Média)** | Adicionar controles de scroll nos stories e banner de filtro ativo | Baixa | **Alto (Usabilidade desktop/mobile)** |
| **P2 (Média)** | Validar build, espelhar `web-admin` e deploy na Vercel | Baixa | **Crítico (Entrega ao professor)** |

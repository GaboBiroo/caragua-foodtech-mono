# 📄 ESPELHO OFICIAL DO TEMPLATE (.DOCX) — SEMANA 14 (S14)
**Arquivo de Destino:** `APSII_S14_CARAFOOD.docx`  
*(Copie e cole as seções abaixo diretamente nos quadros correspondentes do template Word oficial do Prof. Me. Cristiano S. Negrão)*

---

## 🏛️ 1. CABEÇALHO INSTITUCIONAL E IDENTIFICAÇÃO DO PROJETO

| Campo do Template | Conteúdo Oficial Preenchido |
| :--- | :--- |
| **Instituição de Ensino** | Centro Universitário Módulo — Caraguatatuba/SP |
| **Disciplina** | Análise e Projeto de Sistemas II (APS II) — Semestre 2026/2 |
| **Docente Orientador / Avaliador** | Prof. Me. Cristiano S. Negrão |
| **Nome Oficial do Projeto / Sistema** | **CaráFood (Caraguá FoodTech)** |
| **Integrantes e Papéis** | • **Gabriel Rodrigues** (*PO, Tech Lead & Dev Front-End / IA*)<br>• **Matheus Vicente** (*Engenheiro de Dados, Dev Back-End & Infraestrutura*)<br>• **Pedro Simone** (*Engenheiro de QA, UX Researcher & Documentação*) |
| **URL Amigável Oficial em Produção** | [https://foddtech.vercel.app/](https://foddtech.vercel.app/) |

---

## 🌐 2. ESTUDO CONCEITUAL: DOMÍNIOS, DNS E DOMÍNIO PRÓPRIO vs. SUBDOMÍNIO PaaS

### 2.1 O que é um Domínio de Internet?
Um **Domínio de Internet** é um identificador alfanumérico único e humanamente memorável que representa o endereço de uma organização ou aplicação na Web, estruturado da direita para a esquerda em níveis hierárquicos:
- **TLD (*Top-Level Domain* — Domínio de Topo):** Indica a categoria ou país do endereço, como os genéricos (`.com`, `.org`, `.app` — sendo `.app` um TLD mantido pelo Google que exige criptografia HTTPS obrigatória por padrão HSTS) ou os territoriais de código de país (*ccTLD*, como `.com.br` administrado pelo NIC.br / Registro.br).
- **SLD (*Second-Level Domain* — Domínio de Segundo Nível):** É o nome principal registrado pela entidade (ex.: `vercel` em `vercel.app`, ou `carafood` em `carafood.com.br`).
- **Subdomínio (*Third-Level Domain*):** Prefixo criado gratuitamente dentro de um domínio existente para isolar um projeto ou serviço específico (ex.: `foddtech` dentro de `foddtech.vercel.app`).

### 2.2 O Papel do DNS (*Domain Name System*)
Como os roteadores da Internet comunicam-se exclusivamente por endereços numéricos de protocolo IP (**IPv4**, ex.: `76.76.21.21`, ou **IPv6**), o **DNS** atua como a **"agenda telefônica distribuída da Internet"**, traduzindo em milissegundos um nome amigável (`foddtech.vercel.app`) no endereço IP exato do servidor da Vercel mais próximo do usuário (*Anycast CDN*). Essa resolução apoia-se em registros específicos de zona DNS:
- **Registro `A` e `AAAA`:** Apontam um domínio diretamente para um endereço IPv4 (`A`) ou IPv6 (`AAAA`);
- **Registro `CNAME` (*Canonical Name*):** Aponta um subdomínio para outro nome de domínio canônico (ex.: apontar `www.carafood.com.br` para `cname.vercel-dns.com`);
- **Registro `TXT`:** Armazena chaves de verificação de propriedade do domínio e políticas de segurança anti-spoofing (`SPF`, `DKIM`).

### 2.3 Quadro Comparativo: Domínio Próprio Comercial vs. Subdomínio Gratuito de PaaS

| Critério Técnico / Negócio | Domínio Próprio Comercial (`carafood.com.br`) | Subdomínio Gratuito de PaaS (`foddtech.vercel.app`) |
| :--- | :--- | :--- |
| **Custo de Aquisição e Manutenção** | Pago anualmente (~R$ 40,00/ano no Registro.br). | **100% Gratuito**, provisionado automaticamente pela Vercel. |
| **Configuração de DNS e Certificado SSL** | Exige apontamento manual de registros `A`/`CNAME` no provedor de DNS. | **Zero configuração manual**; certificado SSL/TLS (Let's Encrypt) e HSTS pré-ativados no TLD `.app`. |
| **Branding e Autoridade Comercial** | Máxima autoridade de marca para lançamento comercial definitivo e SEO de longo prazo. | Excelente para validação de MVP acadêmico, testes de usabilidade e demonstração em banca. |

---

## 🔗 3. TABELA DE URLS AMIGÁVEIS (*CLEAN URLS*) DO CARÁFOOD EM PRODUÇÃO

Em vez de utilizar parâmetros obscuros de query string (como `index.php?page=4&dish_id=982`), o **CaráFood** utiliza o roteamento semântico baseado em sistema de arquivos do Next.js 14 (*Semantic Slugs*):

| Superfície do Sistema | URL Amigável Pública (Produção Vercel) | Semântica da Rota |
| :--- | :--- | :--- |
| **Home / Catálogo Principal** | `https://foddtech.vercel.app/` | Raiz limpa da aplicação. |
| **Sobre Nós (Institucional)** | `https://foddtech.vercel.app/sobre` | Substantivo direto em português. |
| **Contato e Credenciamento** | `https://foddtech.vercel.app/contato` | Ação direta para clientes e parceiros B2B. |
| **Tela de Login Restrito** | `https://foddtech.vercel.app/login` | Padrão universal de autenticação. |
| **Rankings Caraguá a Gosto** | `https://foddtech.vercel.app/rankings` | Indica claramente o pódio de notas. |
| **Detalhe Master–Detail (*Slug*)** | `https://foddtech.vercel.app/prato/post-centro-azul-marinho`<br>`https://foddtech.vercel.app/prato/post-cocanha-mexilhoes` | O próprio caminho da URL informa o bairro (`centro`, `cocanha`) e o prato (`azul-marinho`, `mexilhoes`). |

---

## 🧠 4. REFLEXÃO TÉCNICA: SEGURANÇA, CONFIABILIDADE E EXPERIÊNCIA DO USUÁRIO (7 LINHAS)

A adoção de **URLs amigáveis (*Clean URLs*) combinadas ao protocolo HTTPS estrito do TLD `.app`** impacta decisivamente três pilares da Engenharia Web: **experiência do usuário (UX), segurança cibernética e confiabilidade**. Para o usuário final que recebe um link do **CaráFood** no WhatsApp — como `https://foddtech.vercel.app/prato/post-cocanha-mexilhoes` —, a leitura imediata das palavras *"prato"*, *"cocanha"* e *"mexilhoes"* antes mesmo do clique gera previsibilidade cognitiva e elimina o receio de *phishing* comum em URLs repletas de códigos numéricos aleatórios. Do ponto de vista de segurança, o subdomínio `.vercel.app` opera sob a lista oficial *HSTS Preload*, forçando qualquer navegador a comunicar-se exclusivamente via túnel criptografado TLS 1.3 (cadeado fechado), o que protege as credenciais enviadas na rota `/login` e os dados comerciais submetidos em `/contato` contra interceptação (*Man-in-the-Middle*) em redes Wi-Fi públicas de quiosques de praia.

---

## 📸 5. EVIDÊNCIAS VISUAIS DE DNS, HTTPS E URL AMIGÁVEL (PARA INSERÇÃO NO .DOCX)

> 📌 **[ESPAÇO PARA PRINT 01 — BARRA DE ENDEREÇO DO NAVEGADOR COM CADEADO SSL/TLS ATIVO EM `https://foddtech.vercel.app/`]:** Captura destacando o certificado HTTPS válido da Vercel e a URL limpa.  
> 📌 **[ESPAÇO PARA PRINT 02 — ROTA SEMÂNTICA AMIGÁVEL `/prato/post-centro-azul-marinho` NO NAVEGADOR]:** Captura comprovando o slug descritivo da página de detalhe do prato.

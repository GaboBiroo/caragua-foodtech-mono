# Dossiê Executivo de Pitch, Sustentabilidade SaaS, Governança LGPD/Autoral e Arquitetura — CaráFood

**Projeto:** CaráFood — Ecossistema Hiperlocal de Descoberta Gastronômica e Auditoria Cultural dos 53 Bairros de Caraguatatuba  
**Instituição:** Centro Universitário Módulo (Cruzeiro do Sul Educacional) — Análise e Projeto de Sistemas II  
**Docente / Avaliador:** Prof. Me. Cristiano S. Negrão  
**Integrantes:** Gabriel Hatakeyama Rodrigues (RGM 42073448) • Matheus Vicente (RGM 42138078) • Pedro Simone (RGM 44066872)  
**Produção (Vercel HTTPS/HSTS):** `https://foddtech.vercel.app/`  
**Repositório Oficial:** `https://github.com/GaboBiroo/caragua-foodtech-mono`

---

## 1. Roteiro de Pitch Executivo Cronometrado para a Banca (15 a 18 Minutos)

### Bloco 1 (00:00 – 04:30) — O Problema Real, a Tração e a Demonstração de Descoberta (Gabriel Rodrigues)
1. **Abertura de Impacto (00:00 – 01:15):**
   - *"Caraguatatuba possui mais de 134 mil moradores em 53 bairros oficiais e recebe centenas de milhares de turistas, mas a descoberta gastronômica na cidade sofre de dois gargalos críticos: os apps de delivery tradicionais cobram taxas de 27% a 30% que expulsam pequenos quiosques e produtores locais (como a AMAPEC na Cocanha e a Colônia Z-8 no Camaroeiro), enquanto as buscas comuns exibem médias antigas sem preço atualizado nem filtro por bairro."*
2. **A Solução e a Base Real Auditada (01:15 – 02:30):**
   - *"O CaráFood não é um protótipo com dados fictícios: catalogamos **61 estabelecimentos reais**, **2.670 pratos com preços reais**, **1.230 fotografias auditadas** e mais de **917 avaliações verificadas** distribuídas pelos **53 bairros oficiais** divididos nas 4 macro-regiões (Centro, Norte, Sul e Sertão)."*
3. **Demonstração ao Vivo na Home (`/`) e Rankings (`/rankings`) (02:30 – 04:30):**
   - Mostrar o filtro rápido por tipo de comida (*Lanches & Burgers, Pizzas, Sushi, Combo Família, Frutos do Mar*), a gaveta modal dos 53 bairros com mapa vetorial, a nitidez visual via `SmartFoodImage.tsx` e a ordenação pela **Nota Ponderada Bayesiana ($W_R$, $m=30$)** com teto *Round-Robin* de no máximo 2 pratos seguidos por restaurante.

### Bloco 2 (04:30 – 10:00) — Identidade, Nome Social/Pronome, LGPD, Direitos Autorais e UX (Pedro Simone)
1. **Diferenciação Deslogado vs. Logado e Inclusão (04:30 – 06:30):**
   - Demonstrar em `/login` os 3 modos: **Entrar** (E-mail/Senha + Login Social **Google** e **Apple**), **Criar Conta** (com **Nome Social** e **Pronome Social**: *Ela/Dela, Ele/Dele, Elu/Delu*) e **Recuperar Senha Multicanal** (envio e validação de código OTP de 6 dígitos tanto via **E-mail** quanto via **WhatsApp**).
   - Mostrar que, ao autenticar, a `Navbar` muda imediatamente para exibir o **Nome Social**, o **Pronome Social** e o saldo do **Passaporte Gourmet (`350 pts`)**.
2. **Fluxo Master–Detail (`/prato/[id]`), Cédula de 5 Critérios e Direitos Autorais (06:30 – 08:30):**
   - Abrir um prato real em `/prato/03f09e72-5c04-508a-bab6-fe753e0fca15`, registrar avaliação na Cédula de 5 critérios ponderados (*Sabor 35%, Apresentação 20%, Insumos Locais 15%, Atendimento 15%, Ambiente 15%*) e mostrar o crédito imediato de `+50 pts`.
   - Acionar o botão **"É dono deste estabelecimento? Reivindicar perfil ou reportar foto (Direitos Autorais)"**, gerando protocolo `CG-DA-XXXXXX` conforme a Lei nº 9.610/98.
3. **Direitos do Titular LGPD (Art. 18) (08:30 – 10:00):**
   - Abrir o modal de perfil logado e demonstrar o download imediato da **Portabilidade de Dados em JSON** e o fluxo de **Anonimização / Direito ao Esquecimento**.

### Bloco 3 (10:00 – 16:00) — Arquitetura, Segurança AppSec, Persistência, "Força Vital" e Sustentabilidade SaaS (Matheus Vicente)
1. **Persistência e Painel de Curadoria (`/contato` e `/moderation`) (10:00 – 12:00):**
   - Mostrar a gravação de protocolo `CG-FT-XXXXXX` em `/api/restaurants/leads` e abrir `/moderation` (em Desktop e Mobile) exibindo as 5 abas: *Pratos para Aprovar*, *Quedas de Preço*, *53 Bairros*, *Credenciamentos* e *Direitos Autorais*.
2. **Segurança AppSec (OWASP Top 10) e Rede Universitária (12:00 – 13:45):**
   - Explicar o hashing criptográfico `PBKDF2-HMAC-SHA256` (`src/lib/security.ts`), o Rate Limiting contra Brute Force (`HTTP 429`), a sanitização anti-XSS, o mascaramento automático de PII (CPF, telefone e e-mail) em comentários e os cabeçalhos `Strict-Transport-Security` (HSTS) + `Content-Security-Policy` que garantem acesso seguro nos laboratórios da Universidade Cruzeiro do Sul.
3. **"Força Vital" (Resiliência Sem SPOF) e Modelo SaaS 0% Taxa (13:45 – 16:00):**
   - Responder preventivamente como o sistema sobrevive sem WhatsApp/APIs externas e como se sustenta financeiramente sem cobrar comissão dos comerciantes.

---

## 2. A "Força Vital" do CaráFood (Arquitetura Zero Ponto Único de Falha — Zero-SPOF)

Se a banca perguntar: **"Se o WhatsApp cair hoje, ou se o Google Maps ficar fora do ar, o aplicativo de vocês morre?"**

**Resposta Arquitetural (`src/lib/resilienceEngine.ts`):**
- **O WhatsApp NÃO é a força vital do CaráFood** — ele é apenas um atalho auxiliar de comunicação.
- A **Força Vital** do CaráFood reside em **3 pilares internos autônomos**:
  1. **Catálogo Próprio Auditado (2.670 pratos e 61 estabelecimentos):** O usuário descobre o prato, vê a foto real nítida, confere o preço real de balcão, filtra por restrição alimentar e lê o endereço e horário de funcionamento **100% dentro do CaráFood**, sem depender de nenhum aplicativo externo para decidir onde comer.
  2. **Roteamento e Contato Multi-Canal Redundante:** Para chegar ou falar com o restaurante, cada ficha oferece:
     - Rota via **Google Maps** (`maps.google.com`);
     - Rota via **Waze** (`waze.com/ul`);
     - Fallback cartográfico via **OpenStreetMap** (`openstreetmap.org`);
     - Discagem telefônica direta (`tel:`) e endereço físico completo por bairro;
     - Link direto para o cardápio original e WhatsApp (`wa.me`).
  3. **Degradação Graciosa (*Graceful Degradation*):** Caso a rede ou uma instância Serverless oscile, o wrapper `fetchWithResilienceFallback()` comuta automaticamente em `< 50ms` para o repositório embarcado (`realDataStore.ts` + `caraguaRealDump.json`) e para o motor determinístico local do **Chef CaráFood IA**, mantendo 100% das telas operacionais sem tela branca de erro.

---

## 3. Sustentabilidade Financeira do SaaS (Como Manter 0% de Comissão para o Comerciante)

| Pilar de Receita | Modelo de Cobrança | Quem Paga | Regra Ética de Blindagem |
| :--- | :--- | :--- | :--- |
| **1. Plano Base Comunitário** | **R$ 0,00 / mês (0% comissão)** | Gratuito para todos os restaurantes e quiosques dos 53 bairros | Garante capilaridade total na cidade e inclusão de pequenos negócios familiares. |
| **2. SaaS B2B Pro Analytics** | **R$ 49,90 / mês (assinatura fixa opcional)** | Restaurantes que desejam painel de inteligência competitiva | Custo fixo ~20x menor que os 27%–30% cobrados por apps de delivery tradicionais. |
| **3. Patrocínio Institucional & Turismo** | **Cotas B2G / Eventos Sazonais** | Festivais (*Caraguá a Gosto*, *Festa da Tainha*), hotelaria e associações | Financia a operação da Cédula Digital Oficial e roteiros turísticos da temporada. |
| **4. Vitrine Patrocinada Hiperlocal** | **Destaque Contextual Identificado** | Estabelecimentos divulgando lançamentos ou combos no bairro | **Jamais altera** a Nota Ponderada Bayesiana ($W_R$) nem a posição em `/rankings`. |

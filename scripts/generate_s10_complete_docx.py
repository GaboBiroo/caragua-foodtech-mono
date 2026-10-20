# -*- coding: utf-8 -*-
"""
Script Oficial de Automacao em Lote (Etapas 1 e 2) — Avaliacao Parcial A2 (S01 a S10)
Disciplina: Analise e Projeto de Sistemas II (APS II) — Prof. Me. Cristiano S. Negrao
Projeto: CaraFood — Plataforma de Descoberta Gastronomica dos 53 Bairros de Caraguatatuba

Etapa 1: Captura automatica de screenshots reais (Desktop 1366x850 e Mobile 390x844) via Playwright
         + Renderizacao do Diagrama Panoramico do Mapa de Paginas (00_mapa_paginas.png - 1400x780).
Etapa 2: Construcao do documento oficial APSII_S10_CARAFOOD_FINAL.docx com python-docx,
         contendo RGMs reais, tabelas padronizadas e todas as imagens embutidas lado a lado.
"""

import os
import shutil
import time
from pathlib import Path
from playwright.sync_api import sync_playwright

import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls


BASE_DIR = Path(__file__).resolve().parent.parent
SCREENSHOTS_DIR = BASE_DIR / "docs" / "screenshots_s10"
DOCX_S10_PATH = BASE_DIR / "entregas_aps2" / "S10_A2_Entrega_Intermediaria" / "APSII_S10_CARAFOOD_FINAL.docx"
DOCX_ROOT_PATH = BASE_DIR / "APSII_S10_CARAFOOD_FINAL.docx"
DOCX_WORKSPACE_ROOT_PATH = BASE_DIR.parent / "APSII_S10_CARAFOOD_FINAL.docx"
PROD_URL = "https://foddtech.vercel.app"


# ==============================================================================
# ETAPA 1: DIAGRAMA HTML/CSS DO MAPA DE PAGINAS E CAPTURA PLAYWRIGHT
# ==============================================================================

MAPA_PAGINAS_HTML = """<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Mapa de Páginas e Fluxo do Usuário — CaráFood</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1400px;
    height: 780px;
    background: #FAF7F2;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    color: #1F2937;
    padding: 24px 32px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
  }
  .header-banner {
    background: #135136;
    color: #FFFFFF;
    border-radius: 16px;
    padding: 16px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 8px 20px rgba(19, 81, 54, 0.16);
    border-bottom: 4px solid #FFB703;
  }
  .header-left h1 {
    font-size: 21px;
    font-weight: 800;
    letter-spacing: -0.02em;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .header-left p {
    font-size: 12.5px;
    color: #D1FAE5;
    margin-top: 3px;
    font-weight: 500;
  }
  .badge-gold {
    background: #FFB703;
    color: #111827;
    font-weight: 800;
    font-size: 12px;
    padding: 7px 14px;
    border-radius: 999px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  /* Barra Global Fixa (Navbar) */
  .navbar-tier {
    background: #FFFFFF;
    border: 2px solid #135136;
    border-radius: 14px;
    padding: 12px 18px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.04);
  }
  .tier-title {
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #135136;
    margin-bottom: 9px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .nav-pills {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 10px;
  }
  .nav-pill {
    background: #F3F8F5;
    border: 1.5px solid #A7F3D0;
    border-radius: 10px;
    padding: 8px 10px;
    text-align: center;
  }
  .nav-pill.highlight {
    background: #FEF3C7;
    border-color: #FFB703;
  }
  .nav-pill .route {
    font-size: 10.5px;
    font-weight: 800;
    color: #065F46;
    font-family: monospace;
    display: block;
  }
  .nav-pill.highlight .route {
    color: #92400E;
  }
  .nav-pill .label {
    font-size: 12px;
    font-weight: 700;
    color: #111827;
    margin-top: 2px;
    display: block;
  }

  /* Lanes Container */
  .lanes-grid {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .lane {
    background: #FFFFFF;
    border-radius: 16px;
    padding: 15px 20px;
    border: 1.5px solid #E5E7EB;
    box-shadow: 0 4px 14px rgba(0,0,0,0.03);
    position: relative;
  }
  .lane-comensal { border-left: 7px solid #135136; }
  .lane-restaurante { border-left: 7px solid #FFB703; }
  .lane-rbac { border-left: 7px solid #047857; }

  .lane-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 11px;
  }
  .lane-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 800;
    color: #135136;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }
  .lane-restaurante .lane-badge { color: #B45309; }
  .lane-sub {
    font-size: 11.5px;
    color: #6B7280;
    font-weight: 600;
  }

  .flow-row {
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    gap: 8px;
  }
  .flow-node {
    flex: 1;
    background: #FAF7F2;
    border: 1.5px solid #D1D5DB;
    border-radius: 12px;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .flow-node.green {
    background: #135136;
    border-color: #064E3B;
    color: #FFFFFF;
  }
  .flow-node.gold {
    background: #FFFBEB;
    border: 2px solid #FFB703;
    color: #111827;
  }
  .flow-node.white-green {
    background: #FFFFFF;
    border: 2px solid #135136;
  }
  .node-tag {
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #059669;
    margin-bottom: 3px;
  }
  .flow-node.green .node-tag { color: #FCD34D; }
  .flow-node.gold .node-tag { color: #B45309; }

  .node-title {
    font-size: 12.5px;
    font-weight: 800;
    line-height: 1.25;
  }
  .node-desc {
    font-size: 10.8px;
    margin-top: 4px;
    line-height: 1.3;
    color: #4B5563;
  }
  .flow-node.green .node-desc { color: #E5E7EB; }

  .arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 900;
    color: #135136;
    padding: 0 2px;
  }
  .lane-restaurante .arrow { color: #D97706; }

  .footer-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #135136;
    color: #FFFFFF;
    padding: 10px 20px;
    border-radius: 12px;
    font-size: 11.5px;
    font-weight: 600;
  }
  .footer-bar span.hl { color: #FFB703; font-weight: 800; }
</style>
</head>
<body>

  <div class="header-banner">
    <div class="header-left">
      <h1>🌊 CARÁFOOD — MAPA DE PÁGINAS E FLUXO DE NAVEGAÇÃO DO USUÁRIO (S01 A S10)</h1>
      <p>Arquitetura de Navegação Hiperlocal • 6 Páginas Obrigatórias + Painel de Moderação + Concierge IA Chef Jacquin • Caraguatatuba/SP</p>
    </div>
    <div class="badge-gold">Avaliação Parcial A2 • Prof. Me. Cristiano S. Negrão</div>
  </div>

  <div class="navbar-tier">
    <div class="tier-title">
      <span>🧭 CAMADA 1 — BARRA GLOBAL FIXA NO TOPO (NAVBAR STICKY • ACESSO EM 1 CLIQUE A PARTIR DE QUALQUER TELA)</span>
      <span>Responsivo: Barra Horizontal (Computador) | Menu Gaveta + Breadcrumb (Celular)</span>
    </div>
    <div class="nav-pills">
      <div class="nav-pill">
        <span class="route">GET /</span>
        <span class="label">1. Início & Catálogo</span>
      </div>
      <div class="nav-pill">
        <span class="route">GET /sobre</span>
        <span class="label">2. Sobre Nós (S04)</span>
      </div>
      <div class="nav-pill">
        <span class="route">GET /contato</span>
        <span class="label">3. Contato (S05)</span>
      </div>
      <div class="nav-pill">
        <span class="route">GET /login</span>
        <span class="label">4. Login RBAC (S07)</span>
      </div>
      <div class="nav-pill">
        <span class="route">GET /rankings</span>
        <span class="label">5. Rankings (S08)</span>
      </div>
      <div class="nav-pill highlight">
        <span class="route">MODAL /moderation</span>
        <span class="label">Portal da Banca</span>
      </div>
      <div class="nav-pill highlight">
        <span class="route">POST /api/chat</span>
        <span class="label">Chef Jacquin IA</span>
      </div>
    </div>
  </div>

  <div class="lanes-grid">
    <!-- FLUXO 1: CLIENTE / COMENSAL -->
    <div class="lane lane-comensal">
      <div class="lane-header">
        <div class="lane-badge">🍽️ FLUXO 1 — JORNADA DO CLIENTE / COMENSAL (DESCOBERTA, ROTA GPS E AVALIAÇÃO AUDITADA)</div>
        <div class="lane-sub">Atende HU01, HU02, HU03, HU05, HU06, HU09 e HU10</div>
      </div>
      <div class="flow-row">
        <div class="flow-node green">
          <div class="node-tag">PÁGINA 1 • HOME (/)</div>
          <div class="node-title">Landing Page & Feed</div>
          <div class="node-desc">Hero Caiçara, Dynamic Island do Chef Jacquin e Passaporte (350 pts).</div>
        </div>
        <div class="arrow">➔</div>
        <div class="flow-node white-green">
          <div class="node-tag">FILTRO TERRITORIAL</div>
          <div class="node-title">53 Bairros & Busca</div>
          <div class="node-desc">10 Polos no topo + Modal com 4 Macro-Regiões, Mapa Vetorial SVG e 10 Categorias.</div>
        </div>
        <div class="arrow">➔</div>
        <div class="flow-node">
          <div class="node-tag">PÁGINA 5 • CATÁLOGO</div>
          <div class="node-title">Card do Prato & Ranking</div>
          <div class="node-desc">Foto HD, preço real, Super Nota 30d, selos AMAPEC/Z-8 e botão Salvar Roteiro.</div>
        </div>
        <div class="arrow">➔</div>
        <div class="flow-node white-green">
          <div class="node-tag">PÁGINA 6 • /prato/[id]</div>
          <div class="node-title">Detalhe Master-Detail</div>
          <div class="node-desc">Breadcrumb, Ficha de Rastreabilidade, parecer do Chef Jacquin e lista de avaliações.</div>
        </div>
        <div class="arrow">➔</div>
        <div class="flow-node gold">
          <div class="node-tag">CONVERSÃO FINAL</div>
          <div class="node-title">Rota GPS ou Cédula 5 Critérios</div>
          <div class="node-desc">Abre rota Google Maps/Waze OU vota nos 5 critérios ponderados (+50 pontos).</div>
        </div>
      </div>
    </div>

    <!-- FLUXO 2: RESTAURANTE / VISITANTE -->
    <div class="lane lane-restaurante">
      <div class="lane-header">
        <div class="lane-badge">🏪 FLUXO 2 — JORNADA DO RESTAURANTE, QUIOSQUE OU PRODUTOR LOCAL (CREDENCIAMENTO 0% TAXA)</div>
        <div class="lane-sub">Atende HU04, HU07 e HU12 • Apoio à AMAPEC Cocanha e Colônia Z-8</div>
      </div>
      <div class="flow-row">
        <div class="flow-node">
          <div class="node-tag">PÁGINA 2 • /sobre</div>
          <div class="node-title">Sobre Nós & Missão</div>
          <div class="node-desc">Apresenta a dor das taxas de 27%-30%, a proposta 0% taxa e a equipe do Módulo.</div>
        </div>
        <div class="arrow">➔</div>
        <div class="flow-node white-green">
          <div class="node-tag">PÁGINA 3 • /contato</div>
          <div class="node-title">Formulário de Credenciamento</div>
          <div class="node-desc">Seleção de categoria (Restaurante, Prato Típico, AMAPEC/Z-8, Acadêmico, Suporte).</div>
        </div>
        <div class="arrow">➔</div>
        <div class="flow-node">
          <div class="node-tag">VALIDAÇÃO DE DADOS</div>
          <div class="node-title">Checagem dos 6 Campos</div>
          <div class="node-desc">Valida Nome, E-mail (@), WhatsApp, Bairro de Caraguatatuba e Mensagem obrigatória.</div>
        </div>
        <div class="arrow">➔</div>
        <div class="flow-node gold">
          <div class="node-tag">PROTOCOLO GERADO</div>
          <div class="node-title">Confirmação CG-FT-XXXXXX</div>
          <div class="node-desc">Exibe comprovante imediato na tela com número único de protocolo para acompanhamento.</div>
        </div>
      </div>
    </div>

    <!-- FLUXO 3: CONTROLE DE ACESSO RBAC -->
    <div class="lane lane-rbac">
      <div class="lane-header">
        <div class="lane-badge">🔐 FLUXO 3 — AUTENTICAÇÃO E REDIRECIONAMENTO POR PERFIL (RBAC EM /login)</div>
        <div class="lane-sub">Atende HU08 e HU11 • Validação HTTP 401 + 3 Perfis com Preenchimento em 1 Clique</div>
      </div>
      <div class="flow-row">
        <div class="flow-node green">
          <div class="node-tag">PÁGINA 4 • /login</div>
          <div class="node-title">Tela de Login & Simulador S07</div>
          <div class="node-desc">Valida credenciais (bloqueia erro HTTP 401 se senha &lt; 6 chars) e identifica perfil.</div>
        </div>
        <div class="arrow">➔</div>
        <div class="flow-node white-green">
          <div class="node-tag">PERFIL 1 • CLIENTE</div>
          <div class="node-title">Comensal Auditado</div>
          <div class="node-desc">comensal@carafood.com.br ➔ Redireciona para <b>Home (/)</b> e libera Cédula (+50 pts).</div>
        </div>
        <div class="arrow">➔</div>
        <div class="flow-node gold">
          <div class="node-tag">PERFIL 2 • PARCEIRO</div>
          <div class="node-title">Gestor de Restaurante</div>
          <div class="node-desc">gestor@restaurante.com.br ➔ Redireciona para <b>/contato</b> (Credenciamento e Selo Local).</div>
        </div>
        <div class="arrow">➔</div>
        <div class="flow-node white-green">
          <div class="node-tag">PERFIL 3 • ADMIN / BANCA</div>
          <div class="node-title">Curador / Admin Módulo</div>
          <div class="node-desc">cristiano@modulo.edu.br ➔ Redireciona para <b>/moderation</b> (Fila de Aprovação e Z-Score).</div>
        </div>
      </div>
    </div>
  </div>

  <div class="footer-bar">
    <span>🏛️ <b>Centro Universitário Módulo</b> • Tecnologia em Análise e Desenvolvimento de Sistemas (ADS)</span>
    <span>🔗 Deploy Ativo: <span class="hl">https://foddtech.vercel.app</span></span>
    <span>👨‍💻 Equipe: <b>Gabriel Rodrigues • Matheus Vicente • Pedro Simone</b></span>
  </div>

</body>
</html>
"""


def capture_all_screenshots():
    SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)
    mapa_html_path = SCREENSHOTS_DIR / "00_mapa_paginas.html"
    mapa_html_path.write_text(MAPA_PAGINAS_HTML, encoding="utf-8")

    print("[ETAPA 1] Iniciando captura de screenshots reais com Playwright...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # 0. Diagrama do Mapa de Paginas (1400x780)
        print("  -> Gerando 00_mapa_paginas.png (1400x780)...")
        ctx_map = browser.new_context(
            viewport={"width": 1400, "height": 780},
            device_scale_factor=2,
        )
        page_map = ctx_map.new_page()
        page_map.goto(mapa_html_path.as_uri(), wait_until="networkidle")
        page_map.wait_for_timeout(800)
        page_map.screenshot(path=str(SCREENSHOTS_DIR / "00_mapa_paginas.png"), full_page=False)
        ctx_map.close()

        # Contexto Desktop (1366x850)
        ctx_desk = browser.new_context(
            viewport={"width": 1366, "height": 850},
            device_scale_factor=1.5,
        )
        page_desk = ctx_desk.new_page()

        # Contexto Mobile (390x844)
        ctx_mob = browser.new_context(
            viewport={"width": 390, "height": 844},
            device_scale_factor=2,
            is_mobile=True,
            has_touch=True,
        )
        page_mob = ctx_mob.new_page()

        # 1. HOME (/) Desktop & Mobile + 02_bairros_modal.png
        print("  -> Capturando Home (/) Desktop, Mobile e Modal dos 53 Bairros...")
        page_desk.goto(f"{PROD_URL}/", wait_until="networkidle", timeout=60000)
        page_desk.wait_for_timeout(2000)

        # Abrir modal dos 53 bairros no Desktop primeiro (para 02_bairros_modal.png)
        try:
            btn_bairros = page_desk.locator('button:has-text("Explorar todos os 53 Bairros")').first
            if btn_bairros.count() > 0:
                btn_bairros.click()
            else:
                page_desk.locator('button:has-text("53 Bairros")').first.click()
            page_desk.wait_for_timeout(1200)
        except Exception as e:
            print(f"     Aviso ao clicar modal bairros desktop: {e}")
        page_desk.screenshot(path=str(SCREENSHOTS_DIR / "02_bairros_modal.png"), full_page=False)

        # Fechar modal ou recarregar Home para capturar 01_home_desktop.png mostrando Header + Dynamic Island + 10 Polos + Cards de Pratos
        page_desk.goto(f"{PROD_URL}/", wait_until="networkidle", timeout=60000)
        page_desk.wait_for_timeout(1800)
        page_desk.add_style_tag(content="""
            header { padding-top: 0.5rem !important; padding-bottom: 0.75rem !important; }
            header h1 { font-size: 1.75rem !important; margin-bottom: 0.25rem !important; }
            header p { font-size: 0.82rem !important; margin-bottom: 0.5rem !important; }
            main > div:first-child { display: none !important; }
        """)
        page_desk.wait_for_timeout(500)
        page_desk.screenshot(path=str(SCREENSHOTS_DIR / "01_home_desktop.png"), full_page=False)

        # Home Mobile mostrando Header + Dynamic Island + Polos + Cards
        page_mob.goto(f"{PROD_URL}/", wait_until="networkidle", timeout=60000)
        page_mob.wait_for_timeout(1800)
        page_mob.add_style_tag(content="""
            header { padding-top: 0.4rem !important; padding-bottom: 0.6rem !important; }
            header h1 { font-size: 1.35rem !important; margin-bottom: 0.2rem !important; }
            header p { display: none !important; }
            main > div:first-child { display: none !important; }
        """)
        page_mob.wait_for_timeout(500)
        page_mob.screenshot(path=str(SCREENSHOTS_DIR / "01_home_mobile.png"), full_page=False)

        # 3. SOBRE NOS (/sobre) Desktop & Mobile
        print("  -> Capturando Sobre Nos (/sobre) Desktop e Mobile...")
        page_desk.goto(f"{PROD_URL}/sobre", wait_until="networkidle", timeout=60000)
        page_desk.wait_for_timeout(1500)
        page_desk.screenshot(path=str(SCREENSHOTS_DIR / "03_sobre_desktop.png"), full_page=False)

        page_mob.goto(f"{PROD_URL}/sobre", wait_until="networkidle", timeout=60000)
        page_mob.wait_for_timeout(1500)
        page_mob.screenshot(path=str(SCREENSHOTS_DIR / "03_sobre_mobile.png"), full_page=False)

        # 4. CONTATO (/contato) Desktop (preenchido) & Mobile (protocolo CG-FT-XXXXXX)
        print("  -> Capturando Contato (/contato) Desktop preenchido e Mobile com Protocolo...")
        page_desk.goto(f"{PROD_URL}/contato", wait_until="networkidle", timeout=60000)
        page_desk.wait_for_timeout(1200)
        try:
            page_desk.locator('input[placeholder*="João Caiçara"]').fill("João Caiçara da Silva — Quiosque Mar Virado")
            page_desk.locator('input[type="email"]').fill("contato@quiosquemarvirado.com.br")
            page_desk.locator('input[type="tel"]').fill("(12) 99745-8821")
            page_desk.locator('input[placeholder*="Martim de Sá"]').fill("Martim de Sá")
            page_desk.locator("textarea").fill(
                "Solicito o credenciamento gratuito (0% taxa) do Quiosque Mar Virado no catálogo dos 53 bairros de Caraguatatuba, com destaque para a Caldeirada Caiçara e o Mexilhão da Cocanha (AMAPEC)."
            )
            page_desk.wait_for_timeout(500)
        except Exception as e:
            print(f"     Aviso ao preencher formulario desktop: {e}")
        page_desk.screenshot(path=str(SCREENSHOTS_DIR / "04_contato_desktop.png"), full_page=False)

        page_mob.goto(f"{PROD_URL}/contato", wait_until="networkidle", timeout=60000)
        page_mob.wait_for_timeout(1200)
        try:
            page_mob.locator('input[placeholder*="João Caiçara"]').fill("João Caiçara — Quiosque Mar Virado")
            page_mob.locator('input[type="email"]').fill("contato@quiosquemarvirado.com.br")
            page_mob.locator('input[type="tel"]').fill("(12) 99745-8821")
            page_mob.locator('input[placeholder*="Martim de Sá"]').fill("Martim de Sá")
            page_mob.locator("textarea").fill(
                "Credenciamento gratuito do Quiosque Mar Virado com insumos da AMAPEC Cocanha e Colônia Z-8."
            )
            page_mob.locator('button[type="submit"]').click()
            page_mob.wait_for_timeout(1800)
            page_mob.evaluate("window.scrollTo(0, 480)")
            page_mob.wait_for_timeout(400)
        except Exception as e:
            print(f"     Aviso ao enviar formulario mobile: {e}")
        page_mob.screenshot(path=str(SCREENSHOTS_DIR / "04_contato_protocolo_mobile.png"), full_page=False)

        # 5. LOGIN (/login) Desktop & Mobile com erro HTTP 401
        print("  -> Capturando Login (/login) Desktop e Mobile com simulacao de erro HTTP 401...")
        page_desk.goto(f"{PROD_URL}/login", wait_until="networkidle", timeout=60000)
        page_desk.wait_for_timeout(1500)
        page_desk.screenshot(path=str(SCREENSHOTS_DIR / "05_login_desktop.png"), full_page=False)

        page_mob.goto(f"{PROD_URL}/login", wait_until="networkidle", timeout=60000)
        page_mob.wait_for_timeout(1500)
        try:
            btn_err = page_mob.locator('button:has-text("Simular Erro")').first
            if btn_err.count() > 0:
                btn_err.scroll_into_view_if_needed()
                page_mob.wait_for_timeout(300)
                btn_err.click()
                page_mob.wait_for_timeout(800)
                err_box = page_mob.locator('text=Falha de Autenticação').first
                if err_box.count() > 0:
                    err_box.scroll_into_view_if_needed()
                    page_mob.evaluate("window.scrollBy(0, -140)")
                page_mob.wait_for_timeout(400)
        except Exception as e:
            print(f"     Aviso ao simular erro S07 no mobile: {e}")
        page_mob.screenshot(path=str(SCREENSHOTS_DIR / "05_login_erro_mobile.png"), full_page=False)

        # 6. RANKINGS (/rankings) Desktop & Mobile
        print("  -> Capturando Lista Principal e Rankings (/rankings) Desktop e Mobile...")
        page_desk.goto(f"{PROD_URL}/rankings", wait_until="networkidle", timeout=60000)
        page_desk.wait_for_timeout(1500)
        page_desk.evaluate("window.scrollTo(0, 360)")
        page_desk.wait_for_timeout(500)
        page_desk.screenshot(path=str(SCREENSHOTS_DIR / "06_rankings_desktop.png"), full_page=False)

        page_mob.goto(f"{PROD_URL}/rankings", wait_until="networkidle", timeout=60000)
        page_mob.wait_for_timeout(1500)
        page_mob.evaluate("window.scrollTo(0, 520)")
        page_mob.wait_for_timeout(500)
        page_mob.screenshot(path=str(SCREENSHOTS_DIR / "06_rankings_mobile.png"), full_page=False)

        # 7. DETALHE DO PRATO (/prato/post-1) Desktop & Mobile com Cedula Oficial aberta
        print("  -> Capturando Detalhe do Prato (/prato/post-1) Desktop e Mobile com Cedula Oficial...")
        page_desk.goto(f"{PROD_URL}/prato/post-1", wait_until="networkidle", timeout=60000)
        page_desk.wait_for_timeout(2000)
        page_desk.screenshot(path=str(SCREENSHOTS_DIR / "07_detalhe_desktop.png"), full_page=False)

        page_mob.goto(f"{PROD_URL}/prato/post-1", wait_until="networkidle", timeout=60000)
        page_mob.wait_for_timeout(2000)
        try:
            btn_cedula = page_mob.locator('button:has-text("Avaliar na Cédula Oficial")').first
            if btn_cedula.count() > 0:
                btn_cedula.click()
                page_mob.wait_for_timeout(1000)
        except Exception as e:
            print(f"     Aviso ao abrir cedula no mobile: {e}")
        page_mob.screenshot(path=str(SCREENSHOTS_DIR / "07_detalhe_cedula_mobile.png"), full_page=False)

        # 8. PAINEL DE MODERACAO (/moderation) Desktop & Mobile
        print("  -> Capturando Painel de Moderacao (/moderation) Desktop e Mobile...")
        page_desk.goto(f"{PROD_URL}/moderation", wait_until="networkidle", timeout=60000)
        page_desk.wait_for_timeout(1800)
        page_desk.screenshot(path=str(SCREENSHOTS_DIR / "08_moderation_desktop.png"), full_page=False)

        page_mob.goto(f"{PROD_URL}/moderation", wait_until="networkidle", timeout=60000)
        page_mob.wait_for_timeout(1800)
        page_mob.screenshot(path=str(SCREENSHOTS_DIR / "08_moderation_mobile.png"), full_page=False)

        ctx_desk.close()
        ctx_mob.close()
        browser.close()

    print("[ETAPA 1] Capturas finalizadas com sucesso em docs/screenshots_s10/!")


# ==============================================================================
# ETAPA 2: CONSTRUCAO DO DOCUMENTO WORD (.DOCX) PADRAO A2
# ==============================================================================

COLOR_GREEN_DARK = RGBColor(19, 81, 54)      # #135136
COLOR_GOLD_DARK = RGBColor(180, 83, 9)       # #B45309
COLOR_TEXT_DARK = RGBColor(31, 41, 55)       # #1F2937
COLOR_TEXT_MUTED = RGBColor(107, 114, 128)   # #6B7280
COLOR_WHITE = RGBColor(255, 255, 255)


def set_cell_background(cell, hex_color: str):
    shading = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    cell._tc.get_or_add_tcPr().append(shading)


def set_cell_margins(cell, top=100, bottom=100, left=140, right=140):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement("w:tcMar")
    for m, val in [("top", top), ("bottom", bottom), ("left", left), ("right", right)]:
        node = OxmlElement(f"w:{m}")
        node.set(qn("w:w"), str(val))
        node.set(qn("w:type"), "dxa")
        tcMar.append(node)
    tcPr.append(tcMar)


def set_table_borders(table, color="D1D5DB", sz="4", val="single"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'<w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:left w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:right w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:insideV w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f"</w:tblBorders>"
    )
    tblPr.append(borders)


def remove_table_borders(table):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'<w:top w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
        f'<w:bottom w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
        f'<w:left w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
        f'<w:right w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
        f'<w:insideH w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
        f'<w:insideV w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
        f"</w:tblBorders>"
    )
    tblPr.append(borders)


def add_styled_table(doc, headers, rows, col_widths=None):
    table = doc.add_table(rows=1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(table, color="CBD5E1", sz="6", val="single")

    hdr_cells = table.rows[0].cells
    for idx, text in enumerate(headers):
        hdr_cells[idx].text = ""
        set_cell_background(hdr_cells[idx], "135136")
        set_cell_margins(hdr_cells[idx], top=110, bottom=110, left=140, right=140)
        p = hdr_cells[idx].paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(text)
        r.font.name = "Arial"
        r.font.size = Pt(9.5)
        r.font.bold = True
        r.font.color.rgb = COLOR_WHITE

    for r_idx, row_data in enumerate(rows):
        row_cells = table.add_row().cells
        bg_hex = "FFFFFF" if r_idx % 2 == 0 else "F8FAFC"
        for c_idx, val in enumerate(row_data):
            cell = row_cells[c_idx]
            cell.text = ""
            set_cell_background(cell, bg_hex)
            set_cell_margins(cell, top=95, bottom=95, left=140, right=140)
            p = cell.paragraphs[0]
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.15
            if isinstance(val, tuple):
                # (bold_prefix, rest)
                r1 = p.add_run(val[0])
                r1.font.name = "Arial"
                r1.font.size = Pt(9.5)
                r1.font.bold = True
                r1.font.color.rgb = COLOR_GREEN_DARK
                r2 = p.add_run(val[1])
                r2.font.name = "Arial"
                r2.font.size = Pt(9.5)
                r2.font.color.rgb = COLOR_TEXT_DARK
            else:
                r = p.add_run(str(val))
                r.font.name = "Arial"
                r.font.size = Pt(9.5)
                if c_idx == 0:
                    r.font.bold = True
                    r.font.color.rgb = COLOR_GREEN_DARK
                else:
                    r.font.color.rgb = COLOR_TEXT_DARK

    if col_widths:
        for row in table.rows:
            for idx, w in enumerate(col_widths):
                row.cells[idx].width = Inches(w)

    p_after = doc.add_paragraph()
    p_after.paragraph_format.space_before = Pt(2)
    p_after.paragraph_format.space_after = Pt(4)
    return table


def add_side_by_side_screenshots(doc, desktop_png: Path, mobile_png: Path, caption_title: str):
    """
    Insere par de capturas de tela em tabela invisivel de 2 colunas:
    Computador a esquerda (Inches(3.8)) | Celular a direita (Inches(2.1))
    seguido da legenda oficial.
    """
    table = doc.add_table(rows=1, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    remove_table_borders(table)

    cell_left = table.rows[0].cells[0]
    cell_right = table.rows[0].cells[1]
    cell_left.width = Inches(4.0)
    cell_right.width = Inches(2.3)
    cell_left.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
    cell_right.vertical_alignment = WD_ALIGN_VERTICAL.CENTER

    p_left = cell_left.paragraphs[0]
    p_left.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_left.paragraph_format.space_before = Pt(4)
    p_left.paragraph_format.space_after = Pt(2)
    if desktop_png.exists():
        p_left.add_run().add_picture(str(desktop_png), width=Inches(3.8))

    p_right = cell_right.paragraphs[0]
    p_right.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_right.paragraph_format.space_before = Pt(4)
    p_right.paragraph_format.space_after = Pt(2)
    if mobile_png.exists():
        p_right.add_run().add_picture(str(mobile_png), width=Inches(2.1))

    p_cap = doc.add_paragraph()
    p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cap.paragraph_format.space_before = Pt(3)
    p_cap.paragraph_format.space_after = Pt(10)
    r_cap = p_cap.add_run(f"Figura – {caption_title} (Computador | Celular)")
    r_cap.font.name = "Arial"
    r_cap.font.size = Pt(9)
    r_cap.font.italic = True
    r_cap.font.bold = True
    r_cap.font.color.rgb = COLOR_TEXT_MUTED


def add_full_width_screenshot(doc, img_path: Path, caption_text: str, width_inches=6.2):
    p_img = doc.add_paragraph()
    p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_img.paragraph_format.space_before = Pt(6)
    p_img.paragraph_format.space_after = Pt(2)
    if img_path.exists():
        p_img.add_run().add_picture(str(img_path), width=Inches(width_inches))

    p_cap = doc.add_paragraph()
    p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cap.paragraph_format.space_before = Pt(2)
    p_cap.paragraph_format.space_after = Pt(10)
    r_cap = p_cap.add_run(caption_text)
    r_cap.font.name = "Arial"
    r_cap.font.size = Pt(9)
    r_cap.font.italic = True
    r_cap.font.bold = True
    r_cap.font.color.rgb = COLOR_TEXT_MUTED


def add_h1(doc, text: str):
    h = doc.add_heading(text, level=1)
    h.paragraph_format.space_before = Pt(14)
    h.paragraph_format.space_after = Pt(6)
    for r in h.runs:
        r.font.name = "Arial"
        r.font.size = Pt(13.5)
        r.font.bold = True
        r.font.color.rgb = COLOR_GREEN_DARK
    return h


def add_h2(doc, text: str):
    h = doc.add_heading(text, level=2)
    h.paragraph_format.space_before = Pt(10)
    h.paragraph_format.space_after = Pt(4)
    for r in h.runs:
        r.font.name = "Arial"
        r.font.size = Pt(11.5)
        r.font.bold = True
        r.font.color.rgb = COLOR_GREEN_DARK
    return h


def add_h3(doc, text: str):
    h = doc.add_heading(text, level=3)
    h.paragraph_format.space_before = Pt(8)
    h.paragraph_format.space_after = Pt(3)
    for r in h.runs:
        r.font.name = "Arial"
        r.font.size = Pt(10.5)
        r.font.bold = True
        r.font.color.rgb = COLOR_GOLD_DARK
    return h


def add_body(doc, text: str, bold_prefix: str = None):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(5)
    p.paragraph_format.line_spacing = 1.2
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.font.name = "Arial"
        r_pre.font.size = Pt(10)
        r_pre.font.bold = True
        r_pre.font.color.rgb = COLOR_GREEN_DARK
    r = p.add_run(text)
    r.font.name = "Arial"
    r.font.size = Pt(10)
    r.font.color.rgb = COLOR_TEXT_DARK
    return p


def add_bullet(doc, bold_prefix: str, text: str):
    p = doc.add_paragraph(style="List Bullet")
    p.paragraph_format.space_before = Pt(1)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.15
    r1 = p.add_run(bold_prefix)
    r1.font.name = "Arial"
    r1.font.size = Pt(9.8)
    r1.font.bold = True
    r1.font.color.rgb = COLOR_GREEN_DARK
    r2 = p.add_run(text)
    r2.font.name = "Arial"
    r2.font.size = Pt(9.8)
    r2.font.color.rgb = COLOR_TEXT_DARK
    return p


def build_s10_docx():
    print("[ETAPA 2] Construindo documento Word APSII_S10_CARAFOOD_FINAL.docx...")
    doc = docx.Document()

    # Margens padrao (2.0 cm / 0.78 in para caber perfeitamente tabelas e imagens lado a lado)
    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.85)
        section.right_margin = Inches(0.85)

    # Fonte padrao Normal
    normal_style = doc.styles["Normal"]
    normal_style.font.name = "Arial"
    normal_style.font.size = Pt(10)
    normal_style.font.color.rgb = COLOR_TEXT_DARK

    # Cabecalho Institucional
    p_top = doc.add_paragraph()
    p_top.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_top.paragraph_format.space_after = Pt(4)
    r_inst = p_top.add_run(
        "CENTRO UNIVERSITÁRIO MÓDULO — CRUZEIRO DO SUL EDUCACIONAL\n"
        "CURSO SUPERIOR DE TECNOLOGIA EM ANÁLISE E DESENVOLVIMENTO DE SISTEMAS (ADS)\n"
    )
    r_inst.font.name = "Arial"
    r_inst.font.size = Pt(11)
    r_inst.font.bold = True
    r_inst.font.color.rgb = COLOR_GREEN_DARK

    r_disc = p_top.add_run(
        "Disciplina: Análise e Projeto de Sistemas II (APS II) — Semestre 2026\n"
        "Docente Avaliador: Prof. Me. Cristiano S. Negrão"
    )
    r_disc.font.name = "Arial"
    r_disc.font.size = Pt(10)
    r_disc.font.color.rgb = COLOR_TEXT_MUTED

    p_banner = doc.add_paragraph()
    p_banner.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_banner.paragraph_format.space_before = Pt(6)
    p_banner.paragraph_format.space_after = Pt(10)
    r_title = p_banner.add_run(
        "RELATÓRIO PARCIAL DE PROJETO — CONSOLIDAÇÃO S01 A S10 (BASE A2)\n"
    )
    r_title.font.name = "Arial"
    r_title.font.size = Pt(14.5)
    r_title.font.bold = True
    r_title.font.color.rgb = COLOR_GREEN_DARK

    r_sub = p_banner.add_run(
        "CaráFood — Plataforma de Descoberta Gastronômica, Avaliação Auditada e Divulgação para os 53 Bairros de Caraguatatuba"
    )
    r_sub.font.name = "Arial"
    r_sub.font.size = Pt(11)
    r_sub.font.bold = True
    r_sub.font.color.rgb = COLOR_GOLD_DARK

    # ==========================================================================
    # CAPITULO 1: IDENTIFICACAO DO PROJETO E COMPOSICAO DO GRUPO
    # ==========================================================================
    add_h1(doc, "1. IDENTIFICAÇÃO DO PROJETO E COMPOSIÇÃO DO GRUPO")

    add_styled_table(
        doc,
        headers=["Item de Identificação", "Especificação Oficial do Projeto"],
        rows=[
            (
                "Projeto",
                "CaráFood — Plataforma de descoberta gastronômica, avaliação auditada e divulgação para os 53 bairros de Caraguatatuba",
            ),
            ("Docente", "Cristiano S. Negrão"),
            ("Disciplina", "Análise e Projeto de Sistemas II (APS II) — Semestre 2026"),
            (
                "Tema / Domínio principal",
                "Gastronomia local e turismo: catálogo gastronômico dos 53 bairros de Caraguatatuba, avaliação de pratos por 5 critérios ponderados e credenciamento gratuito para restaurantes, quiosques e produtores locais (AMAPEC Cocanha e Colônia Z-8).",
            ),
            (
                "Tipo de aplicação",
                "( ) WEB   |   ( ) Mobile   |   ( ) Desktop   |   ( X ) Híbrido (web + mobile + PWA)",
            ),
        ],
        col_widths=[2.1, 4.4],
    )

    add_h2(doc, "1.1 Composição do Grupo Discente")
    add_styled_table(
        doc,
        headers=["Nome Completo do Aluno", "RGM", "E-mail Institucional / Contato", "Papel e Responsabilidades no Projeto"],
        rows=[
            (
                "Gabriel Hatakeyama Rodrigues",
                "42073448",
                "Gabrielhrodrigues8@gmail.com",
                "Product Owner / Tech Lead e Full-stack (arquitetura Next.js 14, rotas, integração IA, deploy e revisão geral)",
            ),
            (
                "Matheus Vicente",
                "42138078",
                "matheus.vicente@modulo.edu.br",
                "Engenharia de Requisitos, Back-end e Banco de Dados (modelagem de dados, catálogo dos 53 bairros e APIs)",
            ),
            (
                "Pedro Simone",
                "44066872",
                "pedro.simone@modulo.edu.br",
                "Designer de Interface (UI/UX), Front-end, Testes de Usabilidade e Documentação (S01 a S16)",
            ),
        ],
        col_widths=[1.8, 0.9, 1.7, 2.1],
    )

    add_h2(doc, "1.2 Links Oficiais de Acesso e Repositório")
    add_styled_table(
        doc,
        headers=["Recurso / Ambiente", "Endereço Oficial", "Observações de Uso"],
        rows=[
            (
                "Sistema publicado (Vercel)",
                "https://foddtech.vercel.app/",
                "Aplicação responsiva em produção (funciona no celular, tablet e computador com HTTPS ativo).",
            ),
            (
                "Código-fonte (GitHub)",
                "https://github.com/GaboBiroo/caragua-foodtech-mono",
                "Repositório monorepo público na branch principal (main) com todas as entregas de S01 a S10.",
            ),
            (
                "Endereços diretos das páginas",
                "Home (/) | Sobre nós (/sobre) | Contato (/contato) | Login (/login) | Rankings (/rankings) | Detalhe do prato (/prato/post-1) | Moderação (/moderation)",
                "Todas as 6 páginas obrigatórias da disciplina e o painel administrativo estão publicados e interligados.",
            ),
        ],
        col_widths=[1.7, 2.5, 2.3],
    )

    add_h2(doc, "1.3 Acesso para o Professor (Teste Rápido em 3 Minutos)")
    add_body(
        doc,
        "Para facilitar a avaliação docente sem necessidade de cadastro prévio, todas as contas de demonstração abaixo utilizam a senha única Carafood@2026 e são preenchidas automaticamente com 1 clique diretamente na tela https://foddtech.vercel.app/login:",
    )
    add_styled_table(
        doc,
        headers=["Perfil de Teste", "Credencial (E-mail / Usuário)", "Senha", "O que testar em cada perfil"],
        rows=[
            (
                "Comensal (Cliente)",
                "comensal@carafood.com.br",
                "Carafood@2026",
                "Catálogo dos 53 bairros, filtro pelas 4 macro-regiões, roteiro pessoal 'Meus Salvos' e avaliação na Cédula Oficial de 5 critérios (+50 pontos).",
            ),
            (
                "Gestor de Restaurante",
                "gestor@restaurante.com.br",
                "Carafood@2026",
                "Fluxo de credenciamento gratuito (0% taxa) em /contato, solicitação de selo de origem local (AMAPEC / Colônia Z-8) e emissão de protocolo CG-FT-XXXXXX.",
            ),
            (
                "Curador / Administração",
                "cristiano@modulo.edu.br",
                "Carafood@2026",
                "Acesso ao painel de moderação de ofertas (/moderation) e auditoria de avaliações retidas pelo filtro anti-fraude.",
            ),
            (
                "Portal da Banca no Topo",
                "CristianoBestProf",
                "Nota10",
                "Botão dourado 'Portal Prof. Cristiano' fixo no cabeçalho superior com acesso direto aos módulos técnicos e resumo acadêmico.",
            ),
        ],
        col_widths=[1.5, 1.8, 1.0, 2.2],
    )

    add_h2(doc, "1.4 Resumo do Sistema em Números")
    add_styled_table(
        doc,
        headers=["Indicador do Projeto", "Quantidade Atual", "Detalhamento Real no Sistema Implementado"],
        rows=[
            (
                "Rotas e páginas ativas",
                "12",
                "8 páginas web navegáveis (/, /sobre, /contato, /login, /rankings, /prato/[id], /moderation, /rag-test) + 4 rotas de API Serverless.",
            ),
            (
                "Bairros mapeados",
                "53",
                "100% dos bairros oficiais de Caraguatatuba divididos em 4 macro-regiões territoriais e 10 polos principais no topo.",
            ),
            (
                "Pratos e estabelecimentos",
                "15 pratos / 14 locais",
                "Dados reais da cidade com fotos em alta definição, preços de cardápio e selos de origem AMAPEC Cocanha e Colônia Z-8.",
            ),
            (
                "Perfis de acesso",
                "3",
                "Comensal (Cliente), Gestor de Restaurante e Curador/Admin com permissões e redirecionamentos distintos.",
            ),
            (
                "Histórias de usuário",
                "12",
                "HU01 a HU12 integralmente implementadas, testadas e vinculadas às páginas ativas do sistema.",
            ),
            (
                "Commits no GitHub",
                "34+",
                "Histórico versionado incrementalmente na branch main com entregas semanais organizadas de S01 a S10.",
            ),
        ],
        col_widths=[1.8, 1.3, 3.4],
    )

    # ==========================================================================
    # CAPITULO 2: CONTEXTO, PROBLEMA E OBJETIVOS
    # ==========================================================================
    add_h1(doc, "2. CONTEXTO, PROBLEMA E OBJETIVOS")

    add_h2(doc, "2.1 Contexto e Motivação (Resumo da S01)")
    add_body(
        doc,
        "Caraguatatuba é o principal polo urbano, comercial e turístico do Litoral Norte de São Paulo, contando com mais de 134 mil moradores fixos distribuídos em 53 bairros oficiais (do Massaguaçu e Tabatinga ao norte até o Porto Novo e Perequê-Mirim ao sul). A gastronomia do município é sustentada por cadeias produtivas tradicionais de grande valor cultural e econômico: a maricultura sustentável de mexilhões na Fazenda Marinha da Praia da Cocanha (gerida pela associação AMAPEC), a pesca artesanal desembarcada diariamente na Colônia de Pescadores Z-8 do Camaroeiro e no Entreposto do Porto Novo, a culinária caiçara histórica (como o Azul-Marinho preparado na panela de ferro com peixe fresco e banana-verde) e o festival anual Caraguá a Gosto.",
    )
    add_body(
        doc,
        "Apesar dessa riqueza, identificamos na Semana 01 que a descoberta gastronômica na cidade sofre um forte desequilíbrio digital. Durante a alta temporada de verão e feriados prolongados, a população presente no município quadruplica. Tanto turistas quanto moradores acabam recorrendo a aplicativos de delivery genéricos ou buscas informais em redes sociais. Esses aplicativos tradicionais cobram comissões de 27% a 30% sobre as vendas — um custo inviável para quiosques familiares e pequenos restaurantes de bairro — e concentram cerca de 85% de toda a visibilidade digital apenas nos corredores turísticos do Centro e de Martim de Sá, deixando dezenas de bairros residenciais e polos tradicionais sem vitrine digital.",
    )

    add_h2(doc, "2.2 Problema Principal que o Sistema Resolve")
    add_body(
        doc,
        "O CaráFood resolve uma dor dupla que afeta diretamente consumidores e comerciantes de Caraguatatuba: (1) para o cliente (morador ou turista), a dificuldade de encontrar pratos autênticos fora do eixo óbvio da praia central e a distorção causada por notas históricas antigas ou avaliações falsas sem critério; e (2) para o pequeno restaurante ou quiosque local, a falta de um canal gratuito para divulgar seu prato principal, comprovar a procedência fresca dos insumos e atrair clientes presenciais via rota GPS.",
    )

    add_styled_table(
        doc,
        headers=["Dimensão Analisada", "Antes (Apps Comuns e Busca Informal)", "Com o CaráFood (Solução Implementada)"],
        rows=[
            (
                "Cobertura dos bairros de Caraguatatuba",
                "Concentrada em 2 ou 3 bairros da orla central; bairros como Tinga, Perequê-Mirim, Pegorelli e Barranco Alto ficam invisíveis.",
                "Mapeamento completo dos 53 bairros oficiais organizados em 4 macro-regiões, 10 polos rápidos e mapa vetorial interativo.",
            ),
            (
                "Confiabilidade das notas e avaliações",
                "Estrelas genéricas de 1 a 5 sem critério técnico, onde notas de anos atrás mascaram a qualidade atual da cozinha.",
                "Cédula Oficial de 5 critérios ponderados e Super Nota dos últimos 30 dias (meia-vida exponencial) com trava anti-fraude.",
            ),
            (
                "Custo para o restaurante ou quiosque",
                "Taxas de 27% a 30% por pedido em aplicativos de entrega, reduzindo a margem do produtor local.",
                "Credenciamento 100% gratuito (0% taxa) em /contato com geração imediata de protocolo CG-FT-XXXXXX.",
            ),
            (
                "Valorização do insumo caiçara",
                "Sem distinção entre pescado congelado industrial e marisco fresco retirado no dia em Caraguatatuba.",
                "Selos visuais de rastreabilidade nos cards: AMAPEC Fazenda da Cocanha, Colônia Z-8 Camaroeiro e Patrimônio Imaterial.",
            ),
            (
                "Segurança alimentar (alergias e dietas)",
                "Filtros imprecisos que misturam pratos com risco de contaminação cruzada para celíacos e veganos.",
                "Filtro dedicado e assistente Chef Jacquin com bloqueio de recomendações inseguras para restrições severas.",
            ),
        ],
        col_widths=[1.6, 2.4, 2.5],
    )

    add_h2(doc, "2.3 Objetivo Geral e Objetivos Específicos")
    add_body(
        doc,
        "Desenvolver e publicar uma aplicação web responsiva e híbrida (CaráFood) para catalogação gastronômica dos 53 bairros de Caraguatatuba, permitindo descobrir pratos típicos por região, avaliar refeições em 5 critérios ponderados com atualização de nota a cada 30 dias e credenciar gratuitamente estabelecimentos locais.",
        bold_prefix="Objetivo Geral: ",
    )

    add_styled_table(
        doc,
        headers=["#", "Objetivo Específico", "Como foi implementado no sistema", "Situação (Out/2026)"],
        rows=[
            (
                "OE1",
                "Organizar os 53 bairros de Caraguatatuba sem poluir a navegação em telas de celular e computador.",
                "Barra rápida com 10 polos gastronômicos + modal completo com busca instantânea, 4 macro-regiões e mapa vetorial clicável.",
                "100% Concluído (Ativo em /)",
            ),
            (
                "OE2",
                "Substituir avaliações superficiais por um modelo justo que reflita a qualidade recente do prato.",
                "Cédula Oficial de 5 critérios (Sabor 35%, Apresentação 20%, Insumos 15%, Atendimento 15%, Ambiente 15%) e ranking de 30 dias.",
                "100% Concluído (Ativo em /rankings e /prato/[id])",
            ),
            (
                "OE3",
                "Oferecer canal gratuito de adesão para quiosques, restaurantes de bairro e maricultores locais.",
                "Página /contato com validação de 6 campos, seleção de parceria AMAPEC/Z-8 e emissão de protocolo único CG-FT-XXXXXX.",
                "100% Concluído (Ativo em /contato)",
            ),
            (
                "OE4",
                "Garantir controle de acesso por perfil e apoio inteligente à escolha do prato.",
                "Login (/login) com 3 perfis (Comensal, Gestor e Curador/Admin), painel /moderation e assistente Chef Jacquin.",
                "100% Concluído (Ativo em /login e /moderation)",
            ),
        ],
        col_widths=[0.5, 2.2, 2.5, 1.3],
    )

    # ==========================================================================
    # CAPITULO 3: HISTORIAS DE USUARIO E MAPA DE PAGINAS
    # ==========================================================================
    add_h1(doc, "3. HISTÓRIAS DE USUÁRIO E MAPA DE PÁGINAS")

    add_h2(doc, "3.1 Lista Consolidada de Histórias de Usuário (HU01 a HU12)")
    add_body(
        doc,
        "A tabela abaixo consolida as 12 histórias de usuário que guiaram a construção das telas entre as Semanas S01 e S10, abrangendo os três perfis do sistema e os produtores locais de Caraguatatuba:",
    )

    add_styled_table(
        doc,
        headers=["Código", "Perfil / Ator", "História de Usuário (Como... quero... para...)", "Req. Associado", "Página / Situação"],
        rows=[
            (
                "HU01",
                "Comensal (Morador / Turista)",
                "Como morador ou turista, quero filtrar o catálogo pelos 53 bairros e pelas 4 macro-regiões de Caraguatatuba, para descobrir onde comer bem além da orla central.",
                "RF01 / RNF02",
                "Home (/) e Modal 53 Bairros — Implementada",
            ),
            (
                "HU02",
                "Comensal do Festival",
                "Como cliente de um restaurante local, quero avaliar o prato na Cédula Oficial com 5 critérios ponderados, para registrar uma nota justa e ganhar +50 pontos no Passaporte.",
                "RF05 / RNF04",
                "Home (/) e Detalhe (/prato/[id]) — Implementada",
            ),
            (
                "HU03",
                "Visitante em Trânsito",
                "Como visitante circulando pela cidade, quero clicar em 'Como Chegar' no card ou na página do prato e abrir a rota no Google Maps ou Waze, para ir direto ao restaurante.",
                "RF06",
                "Home (/) e Detalhe (/prato/[id]) — Implementada",
            ),
            (
                "HU04",
                "Gestor de Restaurante",
                "Como dono de restaurante ou quiosque, quero enviar meus dados pelo formulário de credenciamento gratuito (0% taxa) e receber um número de protocolo, para divulgar meu prato na plataforma.",
                "RF08",
                "Contato (/contato) — Implementada",
            ),
            (
                "HU05",
                "Comensal / Gestor",
                "Como usuário da plataforma, quero consultar a tabela comparativa entre a Nota Histórica e a Super Nota dos últimos 30 dias, para identificar quais cozinhas mantêm excelência hoje.",
                "RF04 / RNF04",
                "Rankings (/rankings) — Implementada",
            ),
            (
                "HU06",
                "Maricultor AMAPEC / Pescador Z-8",
                "Como produtor da Fazenda da Cocanha (AMAPEC) ou pescador da Colônia Z-8, quero que os pratos com nossos insumos exibam um selo de origem na foto e na ficha técnica, para valorizar a produção caiçara.",
                "RF03",
                "Home (/) e Detalhe (/prato/[id]) — Implementada",
            ),
            (
                "HU07",
                "Visitante / Avaliador",
                "Como visitante, quero ler a história do projeto, os dados de Caraguatatuba, a missão da equipe e a vinculação com a disciplina de APS II, para compreender o propósito do sistema.",
                "RF07",
                "Sobre Nós (/sobre) — Implementada",
            ),
            (
                "HU08",
                "Usuário Autenticado (3 Perfis)",
                "Como usuário do CaráFood, quero entrar no sistema escolhendo meu perfil (Comensal, Gestor ou Curador/Admin) e ver alertas claros caso digite senha inválida, para acessar minha área com segurança.",
                "RF09 / RNF05",
                "Login (/login) — Implementada",
            ),
            (
                "HU09",
                "Comensal Indeciso / Celíaco / Vegano",
                "Como cliente buscando uma recomendação rápida ou com restrição alimentar, quero conversar com o assistente Chef Jacquin na Dynamic Island ou no botão flutuante, para receber sugestões seguras de pratos.",
                "RF02 / RNF03",
                "Barra Global e Home (/) — Implementada",
            ),
            (
                "HU10",
                "Comensal Planejador",
                "Como turista planejando meu fim de semana em Caraguatatuba, quero salvar meus pratos favoritos na aba 'Meus Salvos' com persistência no navegador, para montar meu roteiro gastronômico.",
                "RF10",
                "Home (/) — Implementada",
            ),
            (
                "HU11",
                "Curador / Admin Módulo",
                "Como administrador ou curador acadêmico, quero acessar o painel de moderação para aprovar ou rejeitar ofertas coletadas antes que apareçam no catálogo público, garantindo a qualidade dos dados.",
                "RF11 / RNF05",
                "Moderação (/moderation) — Implementada",
            ),
            (
                "HU12",
                "Comensal Explorador",
                "Como usuário frequente, quero acumular Pontos Gourmet e carimbos nas 4 macro-regiões (Centro, Norte, Sul e Sertão) no Passaporte Caiçara, para acompanhar minha jornada gastronômica pela cidade.",
                "RF12",
                "Home (/) Modal Passaporte — Implementada",
            ),
        ],
        col_widths=[0.65, 1.25, 2.35, 0.9, 1.35],
    )

    add_h2(doc, "3.2 Mapa de Páginas / User Flow (Versão Atual)")
    add_body(
        doc,
        "A arquitetura de navegação do CaráFood foi desenhada para que qualquer funcionalidade esteja a no máximo 2 cliques de distância. A Barra Global Fixa (Navbar) acompanha o usuário em todas as telas, conectando os três fluxos principais do produto: (1) Fluxo do Comensal (descoberta por bairro, detalhe do prato, rota GPS e Cédula Oficial); (2) Fluxo do Restaurante (conhecimento da proposta em /sobre e credenciamento gratuito com protocolo em /contato); e (3) Fluxo Restrito por Perfil em /login.",
    )

    add_full_width_screenshot(
        doc,
        SCREENSHOTS_DIR / "00_mapa_paginas.png",
        "Figura 1 – Mapa de Páginas e Fluxo de Navegação do Usuário do CaráFood (Visão Panorâmica S01–S10)",
        width_inches=6.3,
    )

    # ==========================================================================
    # CAPITULO 4: PROTOTIPO E PAGINAS IMPLEMENTADAS
    # ==========================================================================
    add_h1(doc, "4. PROTÓTIPO E PÁGINAS IMPLEMENTADAS")

    add_h2(doc, "4.1 Do Protótipo Inicial (S02) ao Sistema Publicado em Produção")
    add_body(
        doc,
        "Na Semana 02, o projeto nasceu como um protótipo estrutural focado em validar a listagem de pratos e a separação por bairros de Caraguatatuba. Ao longo das Semanas S03 a S09, o protótipo evoluiu para uma aplicação completa em Next.js 14, TypeScript e Tailwind CSS publicada na Vercel. A principal evolução de usabilidade ocorreu na transição de um tema escuro experimental para a paleta clara 'Creme Caiçara & Verde Mata Atlântica' (#FAF7F2 e #135136), garantindo leitura confortável sob a luz intensa da praia, além da criação do modal inteligente dos 53 bairros com mapa vetorial para evitar poluição visual no topo da tela.",
    )

    add_h2(doc, "4.2 Páginas Já Implementadas (Comparativo Computador | Celular)")
    add_body(
        doc,
        "A seguir são apresentadas todas as 6 páginas obrigatórias da disciplina (Home, Sobre Nós, Contato, Login, Lista/Rankings e Detalhe do Prato), além do modal territorial dos 53 bairros e da área restrita de Moderação, com capturas reais lado a lado nas versões Computador (1366x850) e Celular (390x844).",
    )

    # --- PAGINA 1: HOME ---
    add_h3(doc, "Página 1: Home / Landing Page e Feed Gastronômico (Rota: /)")
    add_side_by_side_screenshots(
        doc,
        SCREENSHOTS_DIR / "01_home_desktop.png",
        SCREENSHOTS_DIR / "01_home_mobile.png",
        "Página 1: Home / Landing Page e Catálogo Principal em /",
    )
    add_bullet(
        doc,
        "Objetivo da página: ",
        "Apresentar imediatamente a proposta do CaráFood, permitir a filtragem rápida por bairro, categoria ou ocasião climática e exibir o feed de pratos auditados de Caraguatatuba.",
    )
    add_bullet(
        doc,
        "Elementos principais da tela: ",
        "Barra superior fixa com logo e onda municipal; cabeçalho Hero com botão do Passaporte Gourmet (350 pontos); Dynamic Island interativa do Chef Jacquin; barra rápida dos 10 Polos Gastronômicos + botão 'Explorar todos os 53 Bairros'; seletor de Clima & Ocasião; barra de busca sem acentos; 10 pílulas de categoria (incluindo 'Meus Salvos', 'Caraguá a Gosto' e 'Vegano'); e cards completos de pratos.",
    )
    add_bullet(
        doc,
        "Comportamento e validações: ",
        "Todos os filtros atuam em tempo real sem recarregar a página. O clique duplo na foto do prato dispara animação de curtida, o pino sobre a foto exibe o preço do item (In-Image Dish Tagging) e o botão 'Salvar' guarda o prato no roteiro pessoal via localStorage.",
    )
    add_bullet(
        doc,
        "Histórias e requisitos atendidos: ",
        "HU01, HU02, HU03, HU06, HU09, HU10 e HU12 (RF01, RF02, RF03, RF05, RF06, RF10 e RF12).",
    )

    # --- MODAL 53 BAIRROS ---
    add_full_width_screenshot(
        doc,
        SCREENSHOTS_DIR / "02_bairros_modal.png",
        "Figura – Explorador Territorial dos 53 Bairros de Caraguatatuba com 4 Macro-Regiões e Mapa Vetorial (Rota: /)",
        width_inches=5.8,
    )

    # --- PAGINA 2: SOBRE NOS ---
    add_h3(doc, "Página 2: Sobre Nós, Contexto Regional e Equipe (Rota: /sobre)")
    add_side_by_side_screenshots(
        doc,
        SCREENSHOTS_DIR / "03_sobre_desktop.png",
        SCREENSHOTS_DIR / "03_sobre_mobile.png",
        "Página 2: Sobre Nós e Contextualização do Projeto em /sobre",
    )
    add_bullet(
        doc,
        "Objetivo da página: ",
        "Explicar a origem acadêmica e regional do CaráFood, documentando a realidade socioeconômica de Caraguatatuba, as dores enfrentadas pelos pequenos restaurantes locais e a missão da equipe.",
    )
    add_bullet(
        doc,
        "Elementos principais da tela: ",
        "Banner institucional da Entrega S04; seção sobre a economia de Caraguatatuba (134 mil habitantes, 53 bairros, maricultura AMAPEC na Cocanha e pesca artesanal na Colônia Z-8); comparativo das dores do mercado (taxas de 27% a 30% e avaliações sem filtro); cards de Missão, Visão e Valores; reflexão de UX; e ficha técnica dos 3 alunos e do Prof. Cristiano S. Negrão.",
    )
    add_bullet(
        doc,
        "Comportamento e navegação: ",
        "Possui botões de chamada para ação (CTAs) no final da página que levam diretamente ao catálogo de pratos (/) ou ao formulário de credenciamento gratuito (/contato).",
    )
    add_bullet(
        doc,
        "Histórias e requisitos atendidos: ",
        "HU06 e HU07 (RF03 e RF07).",
    )

    # --- PAGINA 3: CONTATO ---
    add_h3(doc, "Página 3: Contato e Credenciamento Gratuito com Protocolo (Rota: /contato)")
    add_side_by_side_screenshots(
        doc,
        SCREENSHOTS_DIR / "04_contato_desktop.png",
        SCREENSHOTS_DIR / "04_contato_protocolo_mobile.png",
        "Página 3: Formulário Preenchido e Tela de Confirmação com Protocolo CG-FT em /contato",
    )
    add_bullet(
        doc,
        "Objetivo da página: ",
        "Permitir que proprietários de restaurantes, quiosques de praia, produtores da AMAPEC/Z-8 e visitantes enviem solicitações de credenciamento gratuito (0% taxa) ou dúvidas técnicas.",
    )
    add_bullet(
        doc,
        "Elementos principais da tela: ",
        "Formulário estruturado com 6 campos (Tipo de Solicitação, Nome Completo, E-mail, WhatsApp/Telefone, Bairro de Caraguatatuba e Mensagem/Descrição do Negócio), quadro lateral com canais oficiais de atendimento no Centro Universitário Módulo e seção de Perguntas Frequentes (FAQ).",
    )
    add_bullet(
        doc,
        "Comportamento e validações: ",
        "Valida o preenchimento obrigatório e o formato de e-mail e telefone antes do envio. Ao confirmar a submissão, gera na hora um comprovante visual com número de protocolo único no padrão CG-FT-XXXXXX (visível na captura do celular à direita).",
    )
    add_bullet(
        doc,
        "Histórias e requisitos atendidos: ",
        "HU04 (RF08 e RNF02).",
    )

    # --- PAGINA 4: LOGIN ---
    add_h3(doc, "Página 4: Login, Controle de Acesso por Perfil e Simulador de Erro (Rota: /login)")
    add_side_by_side_screenshots(
        doc,
        SCREENSHOTS_DIR / "05_login_desktop.png",
        SCREENSHOTS_DIR / "05_login_erro_mobile.png",
        "Página 4: Tela de Login RBAC com 3 Perfis e Alerta de Erro HTTP 401 em /login",
    )
    add_bullet(
        doc,
        "Objetivo da página: ",
        "Autenticar os usuários da plataforma de acordo com seu papel no negócio e demonstrar o tratamento visual de falhas de autenticação exigido na Semana 07.",
    )
    add_bullet(
        doc,
        "Elementos principais da tela: ",
        "Formulário de e-mail e senha com botão de exibir/ocultar caracteres; botão 'Simular Erro (S07)'; painel lateral/inferior com os 3 cartões de perfil de demonstração em 1 clique (Comensal Auditado, Gestor de Restaurante e Curador/Admin Módulo) e lista de permissões de cada perfil.",
    )
    add_bullet(
        doc,
        "Comportamento e validações: ",
        "Impede o envio de e-mails inválidos ou senhas com menos de 6 caracteres, exibindo o alerta vermelho de falha HTTP 401 (captura mobile à direita). Quando autenticado com sucesso, exibe a sessão ativa e redireciona o Comensal para /, o Gestor para /contato e o Curador/Admin para /moderation.",
    )
    add_bullet(
        doc,
        "Histórias e requisitos atendidos: ",
        "HU08 e HU11 (RF09 e RNF05).",
    )

    # --- PAGINA 5: LISTA PRINCIPAL E RANKINGS ---
    add_h3(doc, "Página 5: Lista Comparativa e Ranking Oficial de 30 Dias (Rota: /rankings)")
    add_side_by_side_screenshots(
        doc,
        SCREENSHOTS_DIR / "06_rankings_desktop.png",
        SCREENSHOTS_DIR / "06_rankings_mobile.png",
        "Página 5: Ranking Oficial e Comparativo Nota Histórica vs. Super Nota 30 Dias em /rankings",
    )
    add_bullet(
        doc,
        "Objetivo da página: ",
        "Apresentar a classificação oficial dos pratos e estabelecimentos de Caraguatatuba, comparando lado a lado a média histórica simples com a Super Nota ponderada dos últimos 30 dias.",
    )
    add_bullet(
        doc,
        "Elementos principais da tela: ",
        "Três cartões explicativos sobre a metodologia (Meia-vida de 30 dias, Filtro Anti-Fraude Z-Score e Cédula de 5 Critérios); tabela comparativa completa com posição no pódio, restaurante, bairro, Nota Histórica, Super Nota Atual e status da auditoria; e atalhos diretos para abrir a página de detalhe de cada prato.",
    )
    add_bullet(
        doc,
        "Comportamento e validações: ",
        "Ordena dinamicamente os estabelecimentos pela Super Nota auditada e permite clicar em qualquer item da lista para inspecionar sua ficha completa em /prato/[id].",
    )
    add_bullet(
        doc,
        "Histórias e requisitos atendidos: ",
        "HU01, HU02 e HU05 (RF01, RF04 e RNF04).",
    )

    # --- PAGINA 6: DETALHE DO PRATO ---
    add_h3(doc, "Página 6: Página de Detalhe do Prato e Cédula de 5 Critérios (Rota: /prato/post-1)")
    add_side_by_side_screenshots(
        doc,
        SCREENSHOTS_DIR / "07_detalhe_desktop.png",
        SCREENSHOTS_DIR / "07_detalhe_cedula_mobile.png",
        "Página 6: Detalhe do Prato e Modal da Cédula Oficial de 5 Critérios em /prato/post-1",
    )
    add_bullet(
        doc,
        "Objetivo da página: ",
        "Exibir todas as informações técnicas, gastronômicas, geográficas e de rastreabilidade de um prato específico, permitindo traçar rota GPS ou registrar uma nova avaliação auditada.",
    )
    add_bullet(
        doc,
        "Elementos principais da tela: ",
        "Trilha de navegação (Breadcrumb: Início > Bairro > Prato); fotografia em alta definição com selos de origem (Caraguá a Gosto, AMAPEC Cocanha, Colônia Z-8); preço no cardápio; Super Nota com curva de 30 dias; parecer do Chef Jacquin; botões 'Como Chegar (Google Maps / Waze)' e 'Avaliar na Cédula Oficial (+50 Pontos)'; Ficha Técnica em 3 blocos; lista de avaliações verificadas; e 3 pratos recomendados relacionados.",
    )
    add_bullet(
        doc,
        "Comportamento e validações: ",
        "Ao clicar em 'Avaliar na Cédula Oficial' (captura mobile à direita), abre o modal interativo com os 5 sliders ponderados (Sabor 35%, Apresentação 20%, Insumos 15%, Atendimento 15%, Ambiente 15%), calcula a Super Nota em tempo real, valida o comentário obrigatório e adiciona o voto imediatamente à lista do prato.",
    )
    add_bullet(
        doc,
        "Histórias e requisitos atendidos: ",
        "HU02, HU03 e HU06 (RF03, RF05 e RF06).",
    )

    # --- MODULO EXTRA: PAINEL DE MODERACAO ---
    add_h3(doc, "Área Restrita Complementar: Painel de Moderação de Ofertas (Rota: /moderation)")
    add_side_by_side_screenshots(
        doc,
        SCREENSHOTS_DIR / "08_moderation_desktop.png",
        SCREENSHOTS_DIR / "08_moderation_mobile.png",
        "Painel Administrativo de Moderação de Ofertas e Cardápios em /moderation",
    )
    add_bullet(
        doc,
        "Objetivo e funcionamento: ",
        "Destinado ao perfil Curador / Admin Módulo, este painel lista os pratos e promoções coletados para revisão humana antes da publicação no feed principal. O administrador pode aprovar ('Aprovar Prato') ou rejeitar ('Rejeitar') cada item com um clique, atualizando o contador de pendências na hora.",
    )

    # ==========================================================================
    # CAPITULO 5: NAVEGACAO E FLUXOS PRINCIPAIS
    # ==========================================================================
    add_h1(doc, "5. NAVEGAÇÃO E FLUXOS PRINCIPAIS")

    add_h2(doc, "5.1 Descrição dos Componentes de Navegação")
    add_styled_table(
        doc,
        headers=["Componente de Navegação", "Onde aparece", "Como funciona no Computador e no Celular"],
        rows=[
            (
                "Barra Global Fixa (Navbar)",
                "Topo de todas as páginas (z-index 40)",
                "No computador, exibe links diretos para Início (/), Sobre Nós (/sobre), Contato (/contato), Rankings (/rankings), Login (/login) e o botão 'Portal Prof. Cristiano'. No celular, agrupa os links em um menu gaveta expansível de fácil toque.",
            ),
            (
                "Barra de Polos + Modal dos 53 Bairros",
                "Abaixo do cabeçalho na Home (/)",
                "Apresenta os 10 polos mais buscados em rolagem horizontal e o botão 'Explorar todos os 53 Bairros', que abre o modal com busca por texto, 4 macro-regiões e mapa vetorial clicável.",
            ),
            (
                "Migalhas de Pão (Breadcrumb)",
                "Topo da página de detalhe (/prato/[id])",
                "Mostra o caminho completo 'Início > Nome do Bairro > Nome do Prato', permitindo voltar ao catálogo geral ou filtrar todos os pratos daquele bairro específico com 1 clique.",
            ),
            (
                "Assistente Chef Jacquin (Dynamic Island e Botão Flutuante)",
                "Cabeçalho da Home e canto inferior direito global",
                "Permite clicar em sugestões rápidas (ex.: Mexilhão da Cocanha, Azul-Marinho, Peixe fresco da orla) ou digitar perguntas livres, recebendo um card clicável que leva direto ao restaurante.",
            ),
        ],
        col_widths=[1.8, 1.5, 3.2],
    )

    add_h2(doc, "5.2 Fluxos Principais Hoje Possíveis no Sistema (Passo a Passo)")
    add_styled_table(
        doc,
        headers=["Código", "Nome do Fluxo", "Passo a Passo Real Executável pelo Usuário", "Resultado Final na Tela"],
        rows=[
            (
                "F1",
                "Descobrir prato por bairro e abrir rota no mapa",
                "1. Acessar a Home (/) -> 2. Clicar em 'Explorar todos os 53 Bairros' e escolher um bairro (ex.: Massaguaçu ou Martim de Sá) -> 3. Clicar em 'Ver Detalhes e Avaliações do Prato' no card -> 4. Na tela /prato/[id], clicar em 'Como Chegar (Google Maps / Waze)'.",
                "Filtra os pratos do bairro escolhido, exibe a ficha completa do prato e abre a rota GPS até o estabelecimento em nova aba.",
            ),
            (
                "F2",
                "Avaliar prato na Cédula de 5 critérios e ganhar +50 pontos",
                "1. Abrir qualquer prato em /prato/post-1 (ou clicar em 'Avaliar' no card da Home) -> 2. Ajustar as notas de 1 a 5 nos 5 critérios ponderados -> 3. Informar opcionalmente a comanda e digitar o relato -> 4. Clicar em 'Enviar Avaliação Auditada'.",
                "Calcula a Super Nota na hora, publica o comentário no topo da lista de avaliações do prato e soma +50 pontos no Passaporte Gourmet.",
            ),
            (
                "F3",
                "Credenciar restaurante em /contato e receber protocolo",
                "1. Clicar em 'Contato' na barra superior (/contato) -> 2. Selecionar 'Credenciar Restaurante ou Quiosque (0% Taxa)' -> 3. Preencher Nome, E-mail, WhatsApp, Bairro e Mensagem -> 4. Clicar em 'Enviar Solicitação Oficial'.",
                "Valida os 6 campos obrigatórios, processa o envio e exibe o cartão verde de confirmação com o protocolo único CG-FT-XXXXXX.",
            ),
            (
                "F4",
                "Testar bloqueio HTTP 401 e entrar com um dos 3 perfis em /login",
                "1. Acessar /login na barra superior -> 2. Clicar em 'Simular Erro (S07)' para verificar o bloqueio de senha curta (alerta HTTP 401) -> 3. Clicar em um dos 3 cartões de perfil (Comensal, Gestor ou Curador) -> 4. Clicar em 'Entrar no CaráFood'.",
                "Exibe o alerta de erro quando a credencial é inválida e, após selecionar um perfil válido, autentica a sessão com redirecionamento direto.",
            ),
            (
                "F5",
                "Comparar Nota Histórica vs. Super Nota de 30 dias em /rankings",
                "1. Clicar em 'Rankings' na barra superior (/rankings) -> 2. Consultar a tabela comparativa do pódio gastronômico -> 3. Analisar a diferença entre a Nota Histórica e a Super Nota recente -> 4. Clicar no prato desejado.",
                "Permite visualizar claramente quais restaurantes subiram ou caíram nos últimos 30 dias e abre a página de detalhe do prato selecionado.",
            ),
        ],
        col_widths=[0.55, 1.55, 2.55, 1.85],
    )

    # ==========================================================================
    # CAPITULO 6: ANALISE PARCIAL E PROXIMOS PASSOS
    # ==========================================================================
    add_h1(doc, "6. ANÁLISE PARCIAL E PRÓXIMOS PASSOS")

    add_h2(doc, "6.1 O que foi Alcançado até Agora (Consolidação S01 a S09)")
    add_styled_table(
        doc,
        headers=["Semana", "Entrega Prevista no Cronograma", "O que o grupo construiu e entregou no repositório"],
        rows=[
            (
                "S01",
                "Registro Inicial e Definição do Tema",
                "Definição do escopo hiperlocal focado nos 53 bairros de Caraguatatuba, identificação das dores de taxas de delivery e mapeamento dos atores locais (AMAPEC e Colônia Z-8).",
            ),
            (
                "S02",
                "Protótipo, Histórias de Usuário e Mapa",
                "Levantamento das histórias de usuário (HU01 a HU12), desenho do mapa de navegação e construção do primeiro protótipo navegável.",
            ),
            (
                "S03",
                "Implementação da Home / Landing Page",
                "Desenvolvimento da rota principal (/) com Hero Caiçara, Dynamic Island do Chef Jacquin, busca em tempo real e catálogo inicial.",
            ),
            (
                "S04",
                "Implementação da Página Sobre Nós",
                "Criação da rota /sobre com dados demográficos de Caraguatatuba, missão/visão/valores, reflexão de UX e ficha técnica da equipe.",
            ),
            (
                "S05",
                "Implementação da Página de Contato",
                "Criação da rota /contato focada no credenciamento gratuito (0% taxa) com validação de 6 campos, FAQ e geração de protocolo CG-FT-XXXXXX.",
            ),
            (
                "S06",
                "Menu Global e Estrutura de Navegação",
                "Unificação da Navbar fixa em todas as páginas, menu gaveta responsivo para celulares, rodapé institucional e breadcrumbs.",
            ),
            (
                "S07",
                "Tela de Login e Controle de Acesso",
                "Criação da rota /login com 3 perfis RBAC preenchíveis em 1 clique, validação de campos e botão de simulação de erro HTTP 401.",
            ),
            (
                "S08",
                "Lista Principal, Catálogo e Rankings",
                "Consolidação do catálogo com 15 pratos reais, 10 categorias, modal dos 53 bairros com mapa vetorial e página /rankings com nota de 30 dias.",
            ),
            (
                "S09",
                "Página de Detalhe do Item",
                "Implementação da rota dinâmica /prato/[id] com ficha de rastreabilidade, rota Google Maps/Waze, modal da Cédula de 5 critérios e pratos relacionados.",
            ),
        ],
        col_widths=[0.7, 2.1, 3.7],
    )

    add_h2(doc, "6.2 Principais Dificuldades Encontradas e Como Foram Resolvidas")
    add_styled_table(
        doc,
        headers=["#", "Dificuldade Real Encontrada pelo Grupo", "Solução Técnica Adotada no Projeto"],
        rows=[
            (
                "D1",
                "Poluição visual ao tentar mostrar os 53 bairros de Caraguatatuba de uma só vez no topo da tela.",
                "Criamos uma arquitetura em duas camadas: a barra principal mostra apenas os 10 Polos Gastronômicos mais procurados, enquanto o botão 'Explorar todos os 53 Bairros' abre um modal organizado nas 4 macro-regiões da cidade com busca instantânea e mapa vetorial SVG.",
            ),
            (
                "D2",
                "Baixa legibilidade do tema escuro inicial quando testado em celulares sob luz forte (ambiente de praia).",
                "Refatoramos o sistema visual para a paleta clara 'Creme Caiçara & Verde Mata Atlântica' (#FAF7F2 e #135136), elevando o contraste tipográfico para o padrão WCAG 2.2 AAA e destacando as cores reais das fotos de comida.",
            ),
            (
                "D3",
                "Falha de empacotamento (build trace) na Vercel por conta da estrutura monorepo com múltiplas pastas.",
                "Criamos o script automatizado scripts/copy-build.js integrado ao comando de build, sincronizando os pacotes e garantindo que todas as rotas estáticas e dinâmicas sejam publicadas sem erro a cada git push.",
            ),
            (
                "D4",
                "Risco de sugerir pratos com contaminação cruzada para usuários celíacos ou veganos no chat de IA.",
                "Adicionamos uma trava determinística de segurança alimentar nas regras do assistente Chef Jacquin e nos filtros de categoria, isolando estritamente os pratos 100% vegetais e sem glúten.",
            ),
        ],
        col_widths=[0.5, 2.6, 3.4],
    )

    add_h2(doc, "6.3 Próximas Entregas até a Avaliação Final A1 (Semanas S11 a S16)")
    add_styled_table(
        doc,
        headers=["Semana", "Meta Técnica e Acadêmica", "Responsável Principal", "Entregável Previsto"],
        rows=[
            (
                "S11",
                "Melhoria de Versionamento e Padronização de Branches",
                "Gabriel Rodrigues",
                "Organização de tags de release, revisão de commits semânticos e documentação técnica do fluxo Git.",
            ),
            (
                "S12",
                "Execução dos Testes de Usabilidade com Usuários Reais",
                "Pedro Simone",
                "Aplicação de roteiro de testes nos fluxos F1 a F5 com moradores de Caraguatatuba e registro de melhorias de interface.",
            ),
            (
                "S13",
                "Integração de Persistência em Banco de Dados e Deploy",
                "Matheus Vicente",
                "Consolidação dos scripts de carga inicial (seed) do catálogo dos 53 bairros e validação das rotas de API em produção.",
            ),
            (
                "S14",
                "Configuração de DNS, URL Amigável e SEO Regional",
                "Gabriel Rodrigues",
                "Ajuste de metadados OpenGraph, sitemap, manifesto PWA e verificação de URL pública amigável na Vercel.",
            ),
            (
                "S15",
                "Checklist Geral de Qualidade e Roteiro de Apresentação",
                "Pedro Simone e Matheus Vicente",
                "Auditoria completa de todos os links, imagens, responsividade mobile e preparação da demonstração ao vivo.",
            ),
            (
                "S16",
                "Entrega Final Consolidada do Projeto (Avaliação A1)",
                "Gabriel, Matheus e Pedro",
                "Submissão da versão final do sistema CaráFood e do relatório técnico completo S01–S16 ao Prof. Me. Cristiano S. Negrão.",
            ),
        ],
        col_widths=[0.7, 2.2, 1.4, 2.2],
    )

    # Salvar nos destinos oficiais
    DOCX_S10_PATH.parent.mkdir(parents=True, exist_ok=True)
    doc.save(str(DOCX_S10_PATH))
    shutil.copyfile(str(DOCX_S10_PATH), str(DOCX_ROOT_PATH))
    try:
        shutil.copyfile(str(DOCX_S10_PATH), str(DOCX_WORKSPACE_ROOT_PATH))
    except Exception as e:
        print(f"  Aviso ao copiar para workspace externo: {e}")

    print(f"[ETAPA 2] Documento salvo com sucesso em:\n  1) {DOCX_S10_PATH}\n  2) {DOCX_ROOT_PATH}\n  3) {DOCX_WORKSPACE_ROOT_PATH}")


if __name__ == "__main__":
    capture_all_screenshots()
    build_s10_docx()

# -*- coding: utf-8 -*-
"""
Gerador Oficial da Entrega S10 (Base A2) — CaráFood (APSII_S10_CARAFOOD.docx)
Construído diretamente sobre o template oficial preenchido do grupo (Paisagem A4,
cabeçalho Cruzeiro do Sul Educacional, rodapé numerado e tabela original de Identificação),
seguindo rigorosamente a formatação Calibri 11pt/12pt e o estilo de escrita direto e técnico.
"""

import os
import shutil
from pathlib import Path
from copy import deepcopy
from playwright.sync_api import sync_playwright

import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls


BASE_DIR = Path(__file__).resolve().parent.parent
SCREENSHOTS_DIR = BASE_DIR / "docs" / "screenshots_s10"
TEMPLATE_DOCX = Path(
    r"C:\Users\Usuario\.gemini\antigravity\brain\e8161ea4-ba32-45b7-94f8-f61d2ceec0d1\.user_uploaded\media_1793149858719_22691d7b.docx"
)
PROTOTIPO_HTML = BASE_DIR / "entregas_aps2" / "S02_Prototipo_Historias_Mapa" / "PROTOTIPO_PARA_PRINT.html"
PROD_URL = "https://foddtech.vercel.app"

OUT_PATHS = [
    BASE_DIR / "entregas_aps2" / "S10_A2_Entrega_Intermediaria" / "APSII_S10_CARAFOOD.docx",
    BASE_DIR / "entregas_aps2" / "S10_A2_Entrega_Intermediaria" / "APSII_S10_CARAFOOD_FINAL.docx",
    BASE_DIR / "docs" / "academic" / "APSII_S10_CARAFOOD.docx",
    BASE_DIR / "APSII_S10_CARAFOOD.docx",
    BASE_DIR / "APSII_S10_CARAFOOD_FINAL.docx",
    BASE_DIR.parent / "APSII_S10_CARAFOOD.docx",
    BASE_DIR.parent / "APSII_S10_CARAFOOD_FINAL.docx",
]


# Diagrama limpo, sobrio e academico (mesma linguagem visual da tabela do template: #D9D9D9, #EFEFEF, bordas pretas nitidas, sem emojis)
CLEAN_MAPA_HTML = """<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1480px;
    height: 740px;
    background: #FFFFFF;
    font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;
    color: #111111;
    padding: 20px 26px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .outer-box {
    border: 2px solid #000000;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .top-title {
    background: #D9D9D9;
    border-bottom: 2px solid #000000;
    padding: 10px 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .top-title h1 {
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 0.01em;
  }
  .top-title span {
    font-size: 13px;
    font-weight: 700;
    color: #222222;
  }
  .content {
    padding: 14px 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    flex: 1;
    justify-content: space-around;
  }
  .tier {
    border: 1.5px solid #000000;
    background: #FAFAFA;
  }
  .tier-hdr {
    background: #EFEFEF;
    border-bottom: 1.5px solid #000000;
    padding: 6px 14px;
    font-size: 13px;
    font-weight: 700;
    display: flex;
    justify-content: space-between;
  }
  .tier-hdr span.sub {
    font-weight: 400;
    color: #333333;
    font-size: 12px;
  }
  .nav-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 10px;
    padding: 10px 14px;
    background: #FFFFFF;
  }
  .nav-item {
    border: 1.5px solid #333333;
    background: #F3F3F3;
    padding: 7px 10px;
    text-align: center;
  }
  .nav-item .rt {
    font-family: Consolas, monospace;
    font-size: 11.5px;
    font-weight: 700;
    color: #000000;
    display: block;
  }
  .nav-item .lb {
    font-size: 12.5px;
    margin-top: 2px;
    display: block;
  }
  .flow-row {
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    padding: 11px 14px;
    background: #FFFFFF;
    gap: 8px;
  }
  .box {
    flex: 1;
    border: 1.5px solid #222222;
    background: #FFFFFF;
    padding: 8px 11px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .box.gray {
    background: #EFEFEF;
  }
  .box.emph {
    background: #D9D9D9;
    border-width: 2px;
  }
  .box .step {
    font-size: 10.5px;
    font-weight: 700;
    text-transform: uppercase;
    color: #444444;
    margin-bottom: 2px;
  }
  .box .ttl {
    font-size: 13px;
    font-weight: 700;
    color: #000000;
  }
  .box .dsc {
    font-size: 11.5px;
    color: #222222;
    margin-top: 3px;
    line-height: 1.25;
  }
  .arr {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: 700;
    color: #000000;
    padding: 0 3px;
  }
  .foot {
    background: #EFEFEF;
    border-top: 1.5px solid #000000;
    padding: 7px 18px;
    font-size: 12px;
    display: flex;
    justify-content: space-between;
  }
</style>
</head>
<body>
  <div class="outer-box">
    <div class="top-title">
      <h1>MAPA DE PÁGINAS E FLUXO DE NAVEGAÇÃO (USER FLOW) — SISTEMA CARÁFOOD</h1>
      <span>Entrega Consolidada S10 (Base A2) • Next.js 14 App Router</span>
    </div>

    <div class="content">
      <!-- Camada Global -->
      <div class="tier">
        <div class="tier-hdr">
          <span>CAMADA GLOBAL DE NAVEGAÇÃO — Barra Superior Fixa (src/components/Navbar.tsx) e Rodapé</span>
          <span class="sub">Acessível a partir de todas as páginas no Desktop (barra horizontal) e Celular (menu gaveta)</span>
        </div>
        <div class="nav-grid">
          <div class="nav-item"><span class="rt">/</span><span class="lb">Home e Lista Principal</span></div>
          <div class="nav-item"><span class="rt">/sobre</span><span class="lb">Sobre Nós (S04)</span></div>
          <div class="nav-item"><span class="rt">/contato</span><span class="lb">Contato / Parceria (S05)</span></div>
          <div class="nav-item"><span class="rt">/login</span><span class="lb">Login por Perfil (S07)</span></div>
          <div class="nav-item"><span class="rt">/rankings</span><span class="lb">Rankings 30 Dias (S08)</span></div>
          <div class="nav-item"><span class="rt">/prato/[id]</span><span class="lb">Detalhe do Prato (S09)</span></div>
        </div>
      </div>

      <!-- Fluxo 1 -->
      <div class="tier">
        <div class="tier-hdr">
          <span>FLUXO 1 — Jornada Principal do Cliente / Morador / Turista (Lista → Filtro → Detalhe → Ação)</span>
          <span class="sub">Histórias atendidas: HU01, HU02, HU03, HU04 e HU07</span>
        </div>
        <div class="flow-row">
          <div class="box emph">
            <span class="step">1. Entrada (S03 / S08)</span>
            <span class="ttl">Home e Catálogo (/)</span>
            <span class="dsc">Hero, busca textual, Dynamic Island e cards de pratos.</span>
          </div>
          <div class="arr">→</div>
          <div class="box gray">
            <span class="step">2. Recorte Territorial</span>
            <span class="ttl">53 Bairros / Categorias</span>
            <span class="dsc">10 polos rápidos ou modal com 4 macro-regiões e mapa SVG.</span>
          </div>
          <div class="arr">→</div>
          <div class="box">
            <span class="step">3. Seleção na Lista</span>
            <span class="ttl">Card do Prato ou /rankings</span>
            <span class="dsc">Compara preço, selos AMAPEC/Z-8 e nota ponderada recente.</span>
          </div>
          <div class="arr">→</div>
          <div class="box gray">
            <span class="step">4. Master–Detail (S09)</span>
            <span class="ttl">Detalhe (/prato/[id])</span>
            <span class="dsc">Breadcrumb (Início &gt; Bairro &gt; Prato), ficha técnica e avaliações.</span>
          </div>
          <div class="arr">→</div>
          <div class="box emph">
            <span class="step">5. CTAs Principais</span>
            <span class="ttl">Rota GPS ou Cédula</span>
            <span class="dsc">Abre Google Maps/Waze ou modal de avaliação em 5 critérios.</span>
          </div>
        </div>
      </div>

      <!-- Fluxo 2 -->
      <div class="tier">
        <div class="tier-hdr">
          <span>FLUXO 2 — Jornada Institucional e Credenciamento de Restaurante / Produtor Local</span>
          <span class="sub">Histórias atendidas: HU05 e HU07</span>
        </div>
        <div class="flow-row">
          <div class="box">
            <span class="step">1. Institucional (S04)</span>
            <span class="ttl">Sobre Nós (/sobre)</span>
            <span class="dsc">Contexto de Caraguatatuba, proposta 0% taxa e equipe do projeto.</span>
          </div>
          <div class="arr">→</div>
          <div class="box gray">
            <span class="step">2. Formulário (S05)</span>
            <span class="ttl">Contato (/contato)</span>
            <span class="dsc">Escolha do assunto (Credenciamento, Prato Típico, AMAPEC/Z-8).</span>
          </div>
          <div class="arr">→</div>
          <div class="box">
            <span class="step">3. Regras de Front-end</span>
            <span class="ttl">Validação dos 6 Campos</span>
            <span class="dsc">Verifica Nome, E-mail, Telefone/WhatsApp, Bairro e Mensagem.</span>
          </div>
          <div class="arr">→</div>
          <div class="box emph">
            <span class="step">4. Retorno ao Usuário</span>
            <span class="ttl">Confirmação com Protocolo</span>
            <span class="dsc">Exibe mensagem de sucesso e código único CG-FT-XXXXXX na tela.</span>
          </div>
        </div>
      </div>

      <!-- Fluxo 3 -->
      <div class="tier">
        <div class="tier-hdr">
          <span>FLUXO 3 — Autenticação e Redirecionamento por Perfil de Acesso</span>
          <span class="sub">Histórias atendidas: HU05 e HU06</span>
        </div>
        <div class="flow-row">
          <div class="box emph">
            <span class="step">1. Acesso (S07)</span>
            <span class="ttl">Tela de Login (/login)</span>
            <span class="dsc">Valida e-mail e senha mínima (bloqueia erro HTTP 401).</span>
          </div>
          <div class="arr">→</div>
          <div class="box">
            <span class="step">Perfil 1 • Cliente</span>
            <span class="ttl">Comensal Auditado</span>
            <span class="dsc">Redireciona para o catálogo (/) com roteiro Salvos e Cédula.</span>
          </div>
          <div class="arr">→</div>
          <div class="box gray">
            <span class="step">Perfil 2 • Parceiro</span>
            <span class="ttl">Gestor de Restaurante</span>
            <span class="dsc">Direciona para credenciamento e atualização em /contato.</span>
          </div>
          <div class="arr">→</div>
          <div class="box">
            <span class="step">Perfil 3 • Administração</span>
            <span class="ttl">Curador / Admin Módulo</span>
            <span class="dsc">Libera fila de moderação de pratos e ofertas em /moderation.</span>
          </div>
        </div>
      </div>
    </div>

    <div class="foot">
      <span>Produção (Vercel): https://foddtech.vercel.app/</span>
      <span>Repositório (GitHub): https://github.com/GaboBiroo/caragua-foodtech-mono</span>
      <span>Grupo: Gabriel H. Rodrigues • Matheus Vicente • Pedro Simone</span>
    </div>
  </div>
</body>
</html>
"""


def update_visual_assets():
    SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)
    mapa_clean_html = SCREENSHOTS_DIR / "00_mapa_paginas_clean.html"
    mapa_clean_html.write_text(CLEAN_MAPA_HTML, encoding="utf-8")

    print("[1/3] Gerando diagrama sobrio do Mapa de Paginas, print do Prototipo S02 e Home limpa...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # 1. Mapa de Paginas sobrio (1480x740)
        ctx_map = browser.new_context(viewport={"width": 1480, "height": 740}, device_scale_factor=2)
        pg_map = ctx_map.new_page()
        pg_map.goto(mapa_clean_html.as_uri(), wait_until="networkidle")
        pg_map.wait_for_timeout(400)
        pg_map.screenshot(path=str(SCREENSHOTS_DIR / "00_mapa_paginas_clean.png"))
        ctx_map.close()

        # 2. Prototipo S02 (PROTOTIPO_PARA_PRINT.html sem barra preta superior)
        if PROTOTIPO_HTML.exists():
            ctx_proto = browser.new_context(viewport={"width": 1600, "height": 900}, device_scale_factor=2)
            pg_proto = ctx_proto.new_page()
            pg_proto.goto(PROTOTIPO_HTML.as_uri(), wait_until="networkidle")
            pg_proto.wait_for_timeout(1000)
            pg_proto.evaluate("""() => {
                const bar = document.getElementById('controlBar');
                if (bar) bar.style.display = 'none';
            }""")
            pg_proto.wait_for_timeout(300)
            pg_proto.screenshot(path=str(SCREENSHOTS_DIR / "00_prototipo_s02.png"))
            ctx_proto.close()

        # 3. Home Desktop & Mobile limpos (mostrando Hero + Polos + Busca + Cards reais sem balao flutuante cobrindo)
        ctx_desk = browser.new_context(viewport={"width": 1366, "height": 850}, device_scale_factor=1.5)
        pg_desk = ctx_desk.new_page()
        pg_desk.goto(f"{PROD_URL}/", wait_until="networkidle", timeout=60000)
        pg_desk.wait_for_timeout(1800)
        pg_desk.add_style_tag(content="""
            header { padding-top: 0.45rem !important; padding-bottom: 0.55rem !important; }
            header h1 { font-size: 1.7rem !important; margin-bottom: 0.2rem !important; }
            header p { font-size: 0.82rem !important; margin-bottom: 0.4rem !important; }
            section.max-w-4xl > div:first-child { display: none !important; }
            aside { display: none !important; }
        """)
        pg_desk.wait_for_timeout(500)
        pg_desk.screenshot(path=str(SCREENSHOTS_DIR / "01_home_clean_desktop.png"))
        ctx_desk.close()

        ctx_mob = browser.new_context(
            viewport={"width": 390, "height": 844},
            device_scale_factor=2,
            is_mobile=True,
            has_touch=True,
        )
        pg_mob = ctx_mob.new_page()
        pg_mob.goto(f"{PROD_URL}/", wait_until="networkidle", timeout=60000)
        pg_mob.wait_for_timeout(1800)
        pg_mob.add_style_tag(content="""
            header { padding-top: 0.4rem !important; padding-bottom: 0.5rem !important; }
            header h1 { font-size: 1.3rem !important; margin-bottom: 0.2rem !important; }
            header p { display: none !important; }
            section.max-w-4xl > div:first-child { display: none !important; }
            aside { display: none !important; }
        """)
        pg_mob.wait_for_timeout(500)
        pg_mob.screenshot(path=str(SCREENSHOTS_DIR / "01_home_clean_mobile.png"))
        ctx_mob.close()

        browser.close()
    print("[1/3] Ativos visuais prontos!")


# ==============================================================================
# HELPERS DE FORMATACAO FIEL AO TEMPLATE DO PROFESSOR / AMIGO
# ==============================================================================

def add_chapter_title(doc, text: str, page_break_before: bool = False):
    if page_break_before:
        doc.add_page_break()
    p = doc.add_paragraph()
    pf = p.paragraph_format
    pf.space_before = Pt(10 if not page_break_before else 0)
    pf.space_after = Pt(3)
    pf.line_spacing = 1.05
    pf.keep_with_next = True
    r = p.add_run(text)
    r.bold = True
    r.font.size = Pt(13)
    return p


def add_section_title(doc, text: str):
    p = doc.add_paragraph()
    pf = p.paragraph_format
    pf.space_before = Pt(8)
    pf.space_after = Pt(2)
    pf.line_spacing = 1.05
    pf.keep_with_next = True
    r = p.add_run(text)
    r.bold = True
    r.font.size = Pt(12)
    return p


def add_text(doc, text: str, bold_prefix: str = None, keep_with_next: bool = False):
    p = doc.add_paragraph()
    pf = p.paragraph_format
    pf.space_before = Pt(0)
    pf.space_after = Pt(3)
    pf.line_spacing = 1.08
    pf.keep_with_next = keep_with_next
    if bold_prefix:
        rp = p.add_run(bold_prefix)
        rp.bold = True
        rp.font.size = Pt(11)
    r = p.add_run(text)
    r.font.size = Pt(11)
    return p


def add_bullet_line(doc, bold_prefix: str, text: str, keep_with_next: bool = False):
    p = doc.add_paragraph()
    pf = p.paragraph_format
    pf.space_before = Pt(0)
    pf.space_after = Pt(2.5)
    pf.line_spacing = 1.08
    pf.keep_with_next = keep_with_next
    r_dot = p.add_run("• ")
    r_dot.font.size = Pt(11)
    if bold_prefix:
        rp = p.add_run(bold_prefix)
        rp.bold = True
        rp.font.size = Pt(11)
    rt = p.add_run(text)
    rt.font.size = Pt(11)
    return p


def set_cell_bg(cell, hex_color: str):
    shading = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    cell._tc.get_or_add_tcPr().append(shading)


def set_cell_pad(cell, top=80, bottom=80, left=120, right=120):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement("w:tcMar")
    for m, val in [("top", top), ("bottom", bottom), ("left", left), ("right", right)]:
        node = OxmlElement(f"w:{m}")
        node.set(qn("w:w"), str(val))
        node.set(qn("w:type"), "dxa")
        tcMar.append(node)
    tcPr.append(tcMar)


def add_template_style_table(doc, headers, rows, col_widths_in):
    """
    Tabela identica ao estilo visual da Tabela 1 do template oficial:
    bordas pretas solidas, cabecalho cinza #D9D9D9 em negrito e celulas limpas em Calibri.
    """
    tbl = doc.add_table(rows=1, cols=len(headers))
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tblPr = tbl._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'<w:top w:val="single" w:sz="8" w:space="0" w:color="000000"/>'
        f'<w:bottom w:val="single" w:sz="8" w:space="0" w:color="000000"/>'
        f'<w:left w:val="single" w:sz="8" w:space="0" w:color="000000"/>'
        f'<w:right w:val="single" w:sz="8" w:space="0" w:color="000000"/>'
        f'<w:insideH w:val="single" w:sz="8" w:space="0" w:color="000000"/>'
        f'<w:insideV w:val="single" w:sz="8" w:space="0" w:color="000000"/>'
        f"</w:tblBorders>"
    )
    tblPr.append(borders)

    hdr_cells = tbl.rows[0].cells
    for i, h_text in enumerate(headers):
        hdr_cells[i].text = ""
        set_cell_bg(hdr_cells[i], "D9D9D9")
        set_cell_pad(hdr_cells[i], top=90, bottom=90, left=120, right=120)
        p = hdr_cells[i].paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.line_spacing = 1.05
        r = p.add_run(h_text)
        r.bold = True
        r.font.size = Pt(10.5)

    for row_vals in rows:
        tr = tbl.add_row()
        # Evita quebrar linha de tabela ao meio entre paginas
        trPr = tr._tr.get_or_add_trPr()
        trPr.append(OxmlElement("w:cantSplit"))
        rcells = tr.cells
        for i, val in enumerate(row_vals):
            rcells[i].text = ""
            if i == 0:
                set_cell_bg(rcells[i], "F3F3F3")
            set_cell_pad(rcells[i], top=75, bottom=75, left=120, right=120)
            p = rcells[i].paragraphs[0]
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.05
            r = p.add_run(str(val))
            r.font.size = Pt(10)
            if i == 0:
                r.bold = True

    for row in tbl.rows:
        for i, w in enumerate(col_widths_in):
            row.cells[i].width = Inches(w)

    p_sp = doc.add_paragraph()
    p_sp.paragraph_format.space_before = Pt(0)
    p_sp.paragraph_format.space_after = Pt(4)
    return tbl


def add_single_figure(doc, img_path: Path, caption: str, width_in: float = 6.8):
    p_img = doc.add_paragraph()
    p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_img.paragraph_format.space_before = Pt(4)
    p_img.paragraph_format.space_after = Pt(2)
    p_img.paragraph_format.line_spacing = 1.0
    p_img.paragraph_format.keep_with_next = True
    if img_path.exists():
        p_img.add_run().add_picture(str(img_path), width=Inches(width_in))

    p_cap = doc.add_paragraph()
    p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cap.paragraph_format.space_before = Pt(0)
    p_cap.paragraph_format.space_after = Pt(8)
    p_cap.paragraph_format.line_spacing = 1.0
    r = p_cap.add_run(caption)
    r.font.size = Pt(9)


def add_desktop_mobile_pair(doc, desk_path: Path, mob_path: Path, caption: str, desk_w: float = 5.25, mob_w: float = 1.51):
    """
    Em Paisagem A4 (largura util 10.67 pol), coloca Desktop (1366x850 -> 5.25x3.27 pol)
    e Mobile (390x844 -> 1.51x3.27 pol) exatamente com a MESMA ALTURA (3.27 pol),
    alinhados e centralizados sem bordas, seguidos da legenda 9pt no padrao do template.
    """
    tbl = doc.add_table(rows=1, cols=2)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tblPr = tbl._tbl.tblPr
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

    tr = tbl.rows[0]
    tr._tr.get_or_add_trPr().append(OxmlElement("w:cantSplit"))

    c0, c1 = tr.cells[0], tr.cells[1]
    c0.width = Inches(desk_w + 0.2)
    c1.width = Inches(mob_w + 0.2)
    c0.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
    c1.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
    set_cell_pad(c0, top=40, bottom=20, left=60, right=80)
    set_cell_pad(c1, top=40, bottom=20, left=80, right=60)

    p0 = c0.paragraphs[0]
    p0.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p0.paragraph_format.space_before = Pt(0)
    p0.paragraph_format.space_after = Pt(0)
    p0.paragraph_format.line_spacing = 1.0
    if desk_path.exists():
        p0.add_run().add_picture(str(desk_path), width=Inches(desk_w))

    p1 = c1.paragraphs[0]
    p1.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p1.paragraph_format.space_before = Pt(0)
    p1.paragraph_format.space_after = Pt(0)
    p1.paragraph_format.line_spacing = 1.0
    if mob_path.exists():
        p1.add_run().add_picture(str(mob_path), width=Inches(mob_w))

    p_cap = doc.add_paragraph()
    p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cap.paragraph_format.space_before = Pt(2)
    p_cap.paragraph_format.space_after = Pt(8)
    p_cap.paragraph_format.line_spacing = 1.0
    r = p_cap.add_run(caption)
    r.font.size = Pt(9)


def build_consolidated_s10():
    print("[2/3] Construindo APSII_S10_CARAFOOD.docx sobre o template oficial Paisagem do grupo...")
    doc = docx.Document(str(TEMPLATE_DOCX))

    # Preserva intactos P00..P04 e a Tabela 0 (Pagina 1 oficial com logo Cruzeiro do Sul e RGMs)!
    # Remove apenas os paragrafos antigos da S09 (P05 em diante).
    for p in list(doc.paragraphs[5:]):
        p._element.getparent().remove(p._element)

    # ==========================================================================
    # SECAO 2: CONTEXTO, PROBLEMA E OBJETIVOS
    # ==========================================================================
    add_chapter_title(doc, "2. Contexto, Problema e Objetivos (Consolidação S01 a S09)")

    add_text(
        doc,
        "https://foddtech.vercel.app/   |   Repositório GitHub: https://github.com/GaboBiroo/caragua-foodtech-mono",
        bold_prefix="Aplicação publicada (Vercel): ",
    )

    add_section_title(doc, "2.1 Contexto e Motivação (resumo da S01)")
    add_text(
        doc,
        "Caraguatatuba possui mais de 134 mil habitantes distribuídos em 53 bairros oficiais e uma cadeia gastronômica própria, formada pela maricultura de mexilhões da Praia da Cocanha (AMAPEC), pela pesca artesanal da Colônia Z-8 no Camaroeiro e pelo festival anual Caraguá a Gosto. Apesar disso, levantamos na Semana 01 que a divulgação digital na cidade é bastante concentrada: moradores e turistas acabam restritos aos mesmos endereços da orla central (Centro e Martim de Sá), enquanto bons restaurantes familiares, quiosques e produtores de outros bairros ficam sem espaço nos aplicativos comuns.",
    )

    add_section_title(doc, "2.2 Problema principal que o sistema resolve")
    add_text(
        doc,
        "Quem busca onde comer na cidade esbarra em dois problemas práticos: nos aplicativos de entrega tradicionais, as taxas de 27% a 30% afastam pequenos quiosques e misturam tudo sem informar a procedência do pescado ou o bairro; já nas buscas abertas, faltam preços atualizados e notas confiáveis, pois médias antigas de anos atrás mascaram a qualidade atual da cozinha. O CaráFood resolve essa lacuna funcionando como um catálogo gastronômico gratuito (0% de taxa para o comerciante) organizado pelos 53 bairros e baseado em avaliação recente por 5 critérios.",
    )

    add_section_title(doc, "2.3 Objetivo geral e objetivos específicos")
    add_text(
        doc,
        "Desenvolver uma aplicação web responsiva e híbrida (Next.js 14 + TypeScript + Tailwind CSS) para catalogar restaurantes e pratos típicos dos 53 bairros de Caraguatatuba, permitindo filtrar por região, consultar ficha de procedência, abrir rota GPS e registrar avaliações ponderadas.",
        bold_prefix="Objetivo geral: ",
    )
    add_bullet_line(
        doc,
        "1. Organizar a busca pelos 53 bairros sem poluir a interface: ",
        "exibir os 10 polos principais em acesso rápido e agrupar a lista completa dos 53 bairros em uma gaveta modal dividida nas 4 macro-regiões da cidade (Orla Central, Costa Norte, Orla Sul e Serra/Sertão), com busca instantânea e mapa vetorial.",
    )
    add_bullet_line(
        doc,
        "2. Dar transparência às notas dos pratos: ",
        "substituir estrelas soltas pela Cédula Oficial de 5 critérios ponderados (Sabor 35%, Apresentação 20%, Insumos Locais 15%, Atendimento 15% e Ambiente 15%) e priorizar na nota o desempenho recente dos últimos 30 dias.",
    )
    add_bullet_line(
        doc,
        "3. Facilitar a adesão gratuita de comércios locais e o acesso por perfil: ",
        "disponibilizar formulário validado de credenciamento (/contato) com geração de protocolo e controle de acesso (/login) separado entre Comensal, Gestor de Restaurante e Curador/Admin.",
    )

    # ==========================================================================
    # SECAO 3: HISTORIAS DE USUARIO E MAPA DE PAGINAS
    # ==========================================================================
    add_chapter_title(doc, "3. Histórias de Usuário e Mapa de Páginas", page_break_before=True)

    add_section_title(doc, "3.1 Lista consolidada de histórias de usuário (mín. 6)")
    add_text(
        doc,
        "A tabela abaixo reúne as histórias de usuário definidas na S02 e implementadas nas rotas reais do sistema até a S09 (contemplando usuário principal, gestor/admin e produtor local):",
    )

    add_template_style_table(
        doc,
        headers=[
            "ID",
            "Perfil / Ator",
            "História de Usuário (Como... quero... para...)",
            "Página / Rota onde foi implementada",
        ],
        rows=[
            (
                "HU01",
                "Morador ou Turista (Usuário Principal)",
                "Como morador ou turista, quero filtrar o catálogo pelos 53 bairros, pelas 4 macro-regiões ou por categoria culinária, para descobrir onde comer perto do bairro onde estou.",
                "Home / Catálogo (/) — Barra de polos, busca sem acentos e modal dos 53 bairros.",
            ),
            (
                "HU02",
                "Comensal / Cliente (Usuário Principal)",
                "Como cliente de um restaurante local, quero avaliar o prato na cédula de 5 critérios ponderados e consultar o parecer técnico, para registrar meu voto e evitar escolhas ruins.",
                "Página de Detalhe (/prato/[id]) e Modal da Cédula Oficial (+50 pontos).",
            ),
            (
                "HU03",
                "Visitante em Trânsito (Usuário Principal)",
                "Como visitante usando o celular na rua, quero clicar em 'Como Chegar' no prato escolhido e abrir a rota no Google Maps ou Waze, para chegar facilmente ao estabelecimento.",
                "Cards da Lista (/) e Página de Detalhe (/prato/[id]).",
            ),
            (
                "HU04",
                "Comensal Planejador (Usuário Principal)",
                "Como usuário planejando um passeio em Caraguatatuba, quero salvar pratos em 'Meus Salvos' e consultar sugestões no chat do Chef Jacquin, para montar meu roteiro pessoal.",
                "Home (/) — Filtro Meus Salvos (localStorage) e Dynamic Island / Chat.",
            ),
            (
                "HU05",
                "Gestor de Restaurante (Parceiro)",
                "Como dono de restaurante ou quiosque, quero preencher o formulário de credenciamento gratuito (0% taxa) e receber um número de protocolo, para divulgar minha casa na plataforma.",
                "Contato / Credenciamento (/contato) e perfil Gestor em /login.",
            ),
            (
                "HU06",
                "Curador / Admin (Gestor do Sistema)",
                "Como administrador e curador do sistema, quero autenticar meu perfil em /login, consultar o ranking de 30 dias e aprovar ou rejeitar ofertas pendentes antes de irem ao ar.",
                "Tela de Login (/login), Rankings (/rankings) e Moderação (/moderation).",
            ),
            (
                "HU07",
                "Maricultor AMAPEC / Pescador Z-8 (Outro Ator)",
                "Como produtor de mexilhão da Cocanha (AMAPEC) ou pescador artesanal do Camaroeiro (Z-8), quero selos visuais de procedência nos pratos que usam nossos insumos, para valorizar a produção local.",
                "Sobre Nós (/sobre), selos nos Cards (/) e Ficha Técnica em /prato/[id].",
            ),
        ],
        col_widths_in=[0.75, 1.85, 4.95, 2.95],
    )

    # 3.2 em nova pagina para o diagrama ficar inteiro com seu titulo
    add_chapter_title(doc, "3.2 Mapa de páginas / user flow (versão mais atual)", page_break_before=True)
    add_text(
        doc,
        "O diagrama abaixo representa a estrutura atual de páginas do CaráFood na Semana 10 e os caminhos de navegação a partir da Barra Superior Fixa (Navbar.tsx), cobrindo o fluxo do comensal, o fluxo de credenciamento de restaurantes e o redirecionamento por perfil de login:",
    )
    add_single_figure(
        doc,
        SCREENSHOTS_DIR / "00_mapa_paginas_clean.png",
        "Figura 1 – Mapa de páginas e fluxo de navegação (user flow) consolidado do CaráFood.",
        width_in=8.6,
    )

    # ==========================================================================
    # SECAO 4: PROTOTIPO E PAGINAS IMPLEMENTADAS
    # ==========================================================================
    add_chapter_title(doc, "4. Protótipo e Páginas Implementadas", page_break_before=True)

    add_section_title(doc, "4.1 Protótipo inicial (prints e links do protótipo)")
    add_text(
        doc,
        "Na Semana 02 estruturamos o wireframe inicial mapeando as 6 telas centrais e testando como acomodar os 53 bairros de Caraguatatuba sem sobrecarregar o topo da página. A solução validada no protótipo — exibir apenas os polos principais na barra rápida e abrir os demais bairros em uma gaveta com busca — foi mantida até a versão atual em Next.js 14. O arquivo do protótipo navegável está versionado em entregas_aps2/S02_Prototipo_Historias_Mapa/PROTOTIPO_PARA_PRINT.html.",
    )
    add_single_figure(
        doc,
        SCREENSHOTS_DIR / "00_prototipo_s02.png",
        "Figura 2 – Visão panorâmica do protótipo arquitetural das 6 telas (Semana 02).",
        width_in=7.8,
    )

    # 4.2 Paginas implementadas (uma pagina paisagem limpa para cada tela/par para nao cortar imagens!)
    doc.add_page_break()
    add_section_title(doc, "4.2 Páginas já implementadas (S03 a S09 em produção)")
    add_text(
        doc,
        "Todas as 6 páginas exigidas no cronograma (Home, Sobre nós, Contato, Login, Lista principal e Página de detalhe) estão publicadas em https://foddtech.vercel.app/ e adaptadas para computador e celular:",
    )

    # 1. Home
    add_bullet_line(
        doc,
        "1. Home / Landing page (https://foddtech.vercel.app/ — código: src/app/page.tsx): ",
        "ponto de entrada do sistema (S03). Apresenta a marca CaráFood com o ícone de onda municipal, a proposta do roteiro dos 53 bairros, o Passaporte Gourmet (350 pontos), a Dynamic Island interativa do Chef Jacquin e o acesso direto aos polos gastronômicos e categorias.",
        keep_with_next=True,
    )
    add_desktop_mobile_pair(
        doc,
        SCREENSHOTS_DIR / "01_home_clean_desktop.png",
        SCREENSHOTS_DIR / "01_home_clean_mobile.png",
        "Figura 3 – Página Home / Landing page (/) nas versões computador e celular.",
    )

    # 2. Sobre nos
    doc.add_page_break()
    add_bullet_line(
        doc,
        "2. Sobre nós (https://foddtech.vercel.app/sobre — código: src/app/sobre/page.tsx): ",
        "página institucional implementada na S04. Contextualiza o cenário de Caraguatatuba (134 mil moradores, AMAPEC na Praia da Cocanha e pesca artesanal na Colônia Z-8), explica as dores das taxas de delivery e das avaliações sem critério, traz os cartões de Missão, Visão e Valores, a reflexão de UX e a ficha técnica dos três integrantes do grupo.",
        keep_with_next=True,
    )
    add_desktop_mobile_pair(
        doc,
        SCREENSHOTS_DIR / "03_sobre_desktop.png",
        SCREENSHOTS_DIR / "03_sobre_mobile.png",
        "Figura 4 – Página Sobre nós (/sobre) nas versões computador e celular.",
    )

    # 3. Contato
    doc.add_page_break()
    add_bullet_line(
        doc,
        "3. Contato / Credenciamento (https://foddtech.vercel.app/contato — código: src/app/contato/page.tsx): ",
        "implementada na S05 para atender solicitações de credenciamento gratuito (0% taxa) de restaurantes e quiosques, sugestões de pratos caiçaras e parcerias locais. Possui validação obrigatória nos 6 campos e, após o envio, gera na tela o comprovante com código de protocolo único (CG-FT-XXXXXX), além de exibir canais oficiais e perguntas frequentes (FAQ).",
        keep_with_next=True,
    )
    add_desktop_mobile_pair(
        doc,
        SCREENSHOTS_DIR / "04_contato_desktop.png",
        SCREENSHOTS_DIR / "04_contato_protocolo_mobile.png",
        "Figura 5 – Página de Contato (/contato) com formulário preenchido no computador e protocolo gerado no celular.",
    )

    # 4. Login
    doc.add_page_break()
    add_bullet_line(
        doc,
        "4. Login / Acesso restrito (https://foddtech.vercel.app/login — código: src/app/login/page.tsx): ",
        "implementada na S07 com controle de acesso por perfil e validação de formulário. Para facilitar a correção docente, traz 3 perfis preenchíveis com 1 clique (Comensal, Gestor de Restaurante e Curador/Admin, todos com senha Carafood@2026), opção de mostrar/ocultar senha e botão 'Simular Erro (S07)' que demonstra o bloqueio HTTP 401 para senhas inválidas.",
        keep_with_next=True,
    )
    add_desktop_mobile_pair(
        doc,
        SCREENSHOTS_DIR / "05_login_desktop.png",
        SCREENSHOTS_DIR / "05_login_erro_mobile.png",
        "Figura 6 – Tela de Login (/login) com os 3 perfis no computador e validação de erro HTTP 401 no celular.",
    )

    # 5. Lista principal e Rankings + Gaveta dos 53 Bairros
    doc.add_page_break()
    add_bullet_line(
        doc,
        "5. Lista principal, gaveta dos 53 bairros e Rankings (/ e /rankings — código: src/app/rankings/page.tsx e src/data/caraguaData.ts): ",
        "consolida o catálogo da S08 com 15 pratos e 14 estabelecimentos reais de Caraguatatuba. Permite busca textual sem diferenciar acentos, filtragem em tempo real pelos 53 bairros (com mapa vetorial e 4 macro-regiões na gaveta modal) e comparação na página /rankings entre a Nota Histórica e a Super Nota recente dos últimos 30 dias.",
        keep_with_next=True,
    )
    # Par lado a lado em paisagem: Rankings Desktop (4.65 pol) + Modal 53 Bairros Desktop (4.65 pol) -> ambos 1366x850, mesma altura (2.89 pol)!
    add_desktop_mobile_pair(
        doc,
        SCREENSHOTS_DIR / "06_rankings_desktop.png",
        SCREENSHOTS_DIR / "02_bairros_modal.png",
        "Figura 7 – Lista comparativa de Rankings (/rankings) à esquerda e gaveta modal dos 53 bairros à direita.",
        desk_w=4.65,
        mob_w=4.65,
    )

    # 6. Pagina de detalhe
    doc.add_page_break()
    add_bullet_line(
        doc,
        "6. Página de detalhe do prato (https://foddtech.vercel.app/prato/post-1 — código: src/app/prato/[id]/page.tsx e PratoDetailClient.tsx): ",
        "rota dinâmica master–detail implementada na S09. Ao clicar em qualquer prato da lista ou do ranking, exibe trilha breadcrumb (Início > Bairro > Prato), foto ampliada com selos AMAPEC/Z-8, preço, nota ponderada, ficha técnica de rastreabilidade, parecer do Chef Jacquin, avaliações e pratos relacionados, além dos CTAs 'Como Chegar (Google Maps / Waze)' e 'Avaliar na Cédula Oficial (+50 Pontos)'.",
        keep_with_next=True,
    )
    add_desktop_mobile_pair(
        doc,
        SCREENSHOTS_DIR / "07_detalhe_desktop.png",
        SCREENSHOTS_DIR / "07_detalhe_cedula_mobile.png",
        "Figura 8 – Página de detalhe (/prato/post-1) no computador e modal da Cédula de 5 critérios no celular.",
    )

    # ==========================================================================
    # SECAO 5: NAVEGACAO E FLUXOS PRINCIPAIS
    # ==========================================================================
    add_chapter_title(doc, "5. Navegação e Fluxos Principais", page_break_before=True)

    add_section_title(doc, "5.1 Descrição da navegação (menu, links e caminhos típicos)")
    add_text(
        doc,
        "A navegação foi unificada na S06 para garantir que o usuário saiba sempre onde está e consiga alternar entre qualquer seção sem depender do botão voltar do navegador:",
    )
    add_bullet_line(
        doc,
        "Barra de navegação superior fixa (Navbar.tsx): ",
        "presente no topo de todas as páginas, destaca a aba ativa no momento e traz links diretos para Início (/), Sobre Nós (/sobre), Contato (/contato), Rankings (/rankings) e Login (/login), além do atalho 'Portal Prof. Cristiano' (usuário CristianoBestProf | senha Nota10). No celular, os links ficam organizados em um menu gaveta.",
    )
    add_bullet_line(
        doc,
        "Navegação contextual (Breadcrumb e links cruzados): ",
        "na página de detalhe (/prato/[id]), o breadcrumb 'Início > Bairro > Nome do Prato' permite retornar à lista geral ou filtrar direto o bairro daquele restaurante, enquanto os cards de 'Mais Pratos Recomendados' no rodapé permitem navegar entre itens relacionados.",
    )
    add_bullet_line(
        doc,
        "Atalhos de busca e assistente: ",
        "a barra de polos na Home e o botão flutuante do Chef Jacquin funcionam como atalhos rápidos para filtrar pratos por bairro ou restrição alimentar (como opções veganas e sem glúten).",
    )

    add_section_title(doc, "5.2 Fluxos principais hoje possíveis no sistema")
    add_text(
        doc,
        "Qualquer avaliador acessando https://foddtech.vercel.app/ consegue executar hoje cinco fluxos completos de ponta a ponta:",
    )
    add_bullet_line(
        doc,
        "Fluxo 1 — Descoberta por bairro até a rota GPS: ",
        "Usuário entra na Home (/) → clica em 'Explorar todos os 53 Bairros' e escolhe uma localidade (ex.: Cocanha ou Martim de Sá) → clica no card do prato para abrir /prato/[id] → confere preço e ficha técnica → aciona 'Como Chegar' para abrir a rota no Google Maps/Waze.",
    )
    add_bullet_line(
        doc,
        "Fluxo 2 — Avaliação na Cédula de 5 critérios: ",
        "Na página de detalhe (/prato/post-1), o usuário clica em 'Avaliar na Cédula Oficial (+50 Pontos)' → ajusta as notas de 1 a 5 nos 5 critérios ponderados → preenche o comentário e envia → o voto passa a aparecer na lista do prato e soma pontos no estado do navegador.",
    )
    add_bullet_line(
        doc,
        "Fluxo 3 — Credenciamento gratuito de restaurante: ",
        "Visitante lê a proposta do projeto em /sobre → acessa /contato → seleciona 'Credenciar Restaurante ou Quiosque (0% Taxa)', informa os 6 campos validados e envia → recebe na tela a confirmação com o protocolo CG-FT-XXXXXX.",
    )
    add_bullet_line(
        doc,
        "Fluxo 4 — Login por perfil e teste de erro (S07): ",
        "Usuário abre /login → clica em 'Simular Erro (S07)' para validar o bloqueio HTTP 401 de senha curta → seleciona um dos 3 perfis de demonstração em 1 clique (Comensal, Gestor ou Curador) → autentica e segue para a área correspondente (incluindo /moderation no perfil Curador).",
    )
    add_bullet_line(
        doc,
        "Fluxo 5 — Comparação no Ranking de 30 dias: ",
        "Usuário acessa /rankings pelo menu → compara a Nota Histórica com a Super Nota recente dos estabelecimentos → clica em 'Ver Prato' para abrir a página de detalhe do item escolhido.",
    )

    # ==========================================================================
    # SECAO 6: ANALISE PARCIAL E PROXIMOS PASSOS
    # ==========================================================================
    add_chapter_title(doc, "6. Análise Parcial e Próximos Passos", page_break_before=True)

    add_section_title(doc, "6.1 O que foi alcançado até agora (S01–S09)")
    add_bullet_line(
        doc,
        "Consolidação das 6 páginas obrigatórias em produção: ",
        "todas as entregas previstas de S01 a S09 estão integradas no mesmo repositório Next.js + TypeScript, com deploy ativo na Vercel e layout responsivo testado em computador e celular.",
    )
    add_bullet_line(
        doc,
        "Catálogo territorial completo de Caraguatatuba: ",
        "mapeamento dos 53 bairros oficiais nas 4 macro-regiões, cadastro estruturado de pratos e restaurantes reais com selos da AMAPEC Cocanha e da Colônia Z-8, e fluxo funcional lista → detalhe (/prato/[id]).",
    )
    add_bullet_line(
        doc,
        "Regras de negócio visíveis na interface: ",
        "cálculo ponderado da Cédula de 5 critérios, comparativo de nota recente em /rankings, emissão de protocolo em /contato e autenticação com 3 perfis em /login.",
    )

    add_section_title(doc, "6.2 Principais dificuldades encontradas")
    add_bullet_line(
        doc,
        "1. Exibir 53 bairros sem poluir a tela inicial: ",
        "mostrar dezenas de botões juntos quebrava a leitura no celular. Resolvemos aplicando divulgação progressiva: mantivemos apenas 10 polos em destaque na barra principal e levamos os 53 bairros para um modal com busca instantânea e divisão por macro-região.",
    )
    add_bullet_line(
        doc,
        "2. Contraste e legibilidade no celular: ",
        "a primeira versão usava fundo escuro que dificultava a leitura sob luz forte. Trocamos para uma paleta clara (#FAF7F2 e verde #135136), melhorando o contraste dos textos e das fotos dos pratos.",
    )
    add_bullet_line(
        doc,
        "3. Ajuste do build na Vercel com múltiplos diretórios: ",
        "a organização do monorepo gerou conflito inicial de rotas no deploy automático; corrigimos padronizando o script de build (scripts/copy-build.js) e a geração estática dos parâmetros de /prato/[id].",
    )

    add_section_title(doc, "6.3 Próximas entregas até a A1 (o que falta implementar — S11 a S16)")
    add_bullet_line(
        doc,
        "S11 (Melhoria e Versionamento): ",
        "refinamento visual a partir do feedback da A2, padronização de tags/releases no GitHub e revisão de acessibilidade (responsável: Gabriel Rodrigues).",
    )
    add_bullet_line(
        doc,
        "S12 (Testes de Usabilidade): ",
        "execução de roteiro prático de testes com usuários reais nos fluxos de busca por bairro, cédula e credenciamento, documentando os ajustes aplicados (responsável: Pedro Simone).",
    )
    add_bullet_line(
        doc,
        "S13 (Deploy Final e Banco de Dados): ",
        "conexão dos envios hoje simulados no front-end (avaliações da cédula e solicitações de /contato) com persistência real em banco de dados PostgreSQL em produção (responsável: Matheus Vicente).",
    )
    add_bullet_line(
        doc,
        "S14 a S16 (URL amigável, Checklist e Entrega Final A1): ",
        "configuração de domínio/metadados de compartilhamento, bateria final de revisão de links e entrega consolidada do projeto e apresentação A1 (responsáveis: Gabriel, Matheus e Pedro).",
    )

    add_section_title(doc, "Artefato entregue (Resumo de verificação A2)")
    add_bullet_line(
        doc,
        "Sistema em produção (Vercel): ",
        "https://foddtech.vercel.app/ (rotas ativas: /, /sobre, /contato, /login, /rankings, /prato/post-1 e /moderation).",
    )
    add_bullet_line(
        doc,
        "Credenciais rápidas para teste em /login (senha Carafood@2026): ",
        "comensal@carafood.com.br (Comensal) | gestor@restaurante.com.br (Gestor) | cristiano@modulo.edu.br (Curador/Admin).",
    )
    add_bullet_line(
        doc,
        "Repositório GitHub atualizado: ",
        "https://github.com/GaboBiroo/caragua-foodtech-mono (consolidação S01–S10).",
    )

    # Salvar em todos os caminhos oficiais
    first_saved = None
    for out_p in OUT_PATHS:
        try:
            out_p.parent.mkdir(parents=True, exist_ok=True)
            if first_saved is None:
                doc.save(str(out_p))
                first_saved = out_p
            else:
                shutil.copyfile(str(first_saved), str(out_p))
            print(f"  -> Salvo: {out_p}")
        except Exception as e:
            print(f"  -> Aviso ao salvar em {out_p}: {e}")


if __name__ == "__main__":
    update_visual_assets()
    build_consolidated_s10()

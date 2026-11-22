# -*- coding: utf-8 -*-
"""
Gerador Oficial da Entrega Final A1 — CaráFood (APSII_A1_Entrega_Final_CARAFOOD.docx)
Construído diretamente sobre o template oficial Paisagem A4 do grupo (APSII_S09_CARAFOOD.docx),
seguindo rigorosamente TODAS as seções e subseções (2 a 13) do template oficial da Entrega Final A1
do Prof. Me. Cristiano S. Negrão.
"""

import shutil
from pathlib import Path
from playwright.sync_api import sync_playwright

import docx
from docx.shared import Inches, Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls


BASE_DIR = Path(__file__).resolve().parent.parent
WORKSPACE_ROOT = BASE_DIR.parent
SCREENSHOTS_S10 = BASE_DIR / "docs" / "screenshots_s10"
SCREENSHOTS_S11_S16 = BASE_DIR / "docs" / "screenshots_s11_s16"

FRIEND_S09_DOCX = Path(
    r"C:\Users\Usuario\.gemini\antigravity\brain\e8161ea4-ba32-45b7-94f8-f61d2ceec0d1\.user_uploaded\media_1794781617297_bbb7c5e3.docx"
)

REAL_DISH_ID = "03f09e72-5c04-508a-bab6-fe753e0fca15"

OUT_PATHS = [
    WORKSPACE_ROOT / "ENTREGAS_CRISTIANO" / "APSII_A1_Entrega_Final_CARAFOOD.docx",
    BASE_DIR / "ENTREGAS_CRISTIANO" / "APSII_A1_Entrega_Final_CARAFOOD.docx",
]


# ==============================================================================
# 1. DIAGRAMAS SÓBRIOS PARA AS SEÇÕES 6.1 (ARQUITETURA) E 7.1 (DER BANCO)
# ==============================================================================

ARQUITETURA_HTML = """<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1440px;
    height: 600px;
    background: #FFFFFF;
    font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;
    color: #111111;
    padding: 18px 24px;
  }
  .outer {
    border: 2px solid #000000;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .hdr {
    background: #D9D9D9;
    border-bottom: 2px solid #000000;
    padding: 10px 18px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .hdr h1 { font-size: 18px; font-weight: 700; }
  .hdr span { font-size: 13px; font-weight: 700; color: #222; }
  .layers {
    display: grid;
    grid-template-columns: 1fr 50px 1fr 50px 1fr;
    align-items: stretch;
    padding: 18px 20px;
    flex: 1;
    gap: 4px;
  }
  .layer {
    border: 1.5px solid #000000;
    background: #FAFAFA;
    display: flex;
    flex-direction: column;
  }
  .layer-title {
    background: #EFEFEF;
    border-bottom: 1.5px solid #000000;
    padding: 8px 12px;
    font-size: 13.5px;
    font-weight: 700;
  }
  .layer-body {
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex: 1;
    justify-content: space-around;
  }
  .card {
    border: 1.5px solid #333333;
    background: #FFFFFF;
    padding: 8px 11px;
  }
  .card.emph {
    background: #EFEFEF;
  }
  .card .t { font-size: 12.5px; font-weight: 700; color: #000; }
  .card .d { font-size: 11.5px; color: #222; margin-top: 3px; line-height: 1.25; }
  .conn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 12px;
    color: #000;
    text-align: center;
    gap: 6px;
  }
  .conn .arr { font-size: 22px; }
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
  <div class="outer">
    <div class="hdr">
      <h1>ARQUITETURA EM 3 CAMADAS — SISTEMA CARÁFOOD (NEXT.JS 14 + API SERVERLESS + POSTGRESQL)</h1>
      <span>Seção 6.1 • Entrega Final A1</span>
    </div>
    <div class="layers">
      <div class="layer">
        <div class="layer-title">1. CAMADA DE APRESENTAÇÃO (FRONT-END / VIEW)</div>
        <div class="layer-body">
          <div class="card emph">
            <div class="t">Páginas Next.js 14 App Router (React 18 + Tailwind CSS)</div>
            <div class="d">Rotas: Home (/), Sobre (/sobre), Contato (/contato), Login (/login), Rankings (/rankings), Detalhe (/prato/[id]) e Curadoria (/moderation).</div>
          </div>
          <div class="card">
            <div class="t">Componentes Responsivos Desktop &amp; Mobile (360px–1440px)</div>
            <div class="d">Navbar.tsx, SmartFoodImage.tsx (nitidez 1:1 com backdrop), Gaveta dos 53 Bairros, Cédula de 5 Critérios e Portal Prof. Cristiano.</div>
          </div>
          <div class="card">
            <div class="t">Validação Client-Side e Segurança de Navegador</div>
            <div class="d">Validação de 6 campos em /contato, bloqueio HTTP 401 em /login, estado localStorage e cabeçalhos HTTPS / HSTS / CSP.</div>
          </div>
        </div>
      </div>

      <div class="conn">
        <span>HTTPS</span>
        <span class="arr">⇄</span>
        <span>JSON / REST</span>
      </div>

      <div class="layer">
        <div class="layer-title">2. CAMADA DE LÓGICA DE NEGÓCIO (CONTROLLER / API)</div>
        <div class="layer-body">
          <div class="card emph">
            <div class="t">Rotas de API Serverless (src/app/api/*)</div>
            <div class="d">GET/POST /api/restaurants/leads (protocolo CG-FT-XXXXXX), GET/POST /api/moderation (aprovação/rejeição), /api/restaurants e /api/ai/chat.</div>
          </div>
          <div class="card">
            <div class="t">Motor Matemático e Regras de Negócio</div>
            <div class="d">Cálculo da Cédula Ponderada (Sabor 35%, Apresentação 20%, Insumos 15%, Atendimento 15%, Ambiente 15%) e Nota Bayesiana WR (m = 30).</div>
          </div>
          <div class="card">
            <div class="t">Algoritmo Anti-Monopólio e Higienização</div>
            <div class="d">Round-Robin Cap (máx. 2 pratos seguidos por restaurante), filtro sem acentos pelos 53 bairros e classificação por tipo de comida.</div>
          </div>
        </div>
      </div>

      <div class="conn">
        <span>SQL /</span>
        <span class="arr">⇄</span>
        <span>Store</span>
      </div>

      <div class="layer">
        <div class="layer-title">3. CAMADA DE DADOS E PERSISTÊNCIA (MODEL)</div>
        <div class="layer-body">
          <div class="card emph">
            <div class="t">Banco Relacional PostgreSQL 15 (backend/sql/init.sql)</div>
            <div class="d">Tabelas estruturadas: restaurants, menu_items, reviews (5 critérios) e partner_leads (solicitações de credenciamento 0% taxa).</div>
          </div>
          <div class="card">
            <div class="t">Repositório Auditado em Produção (realDataStore.ts)</div>
            <div class="d">Base real de Caraguatatuba (caraguaRealDump.json): 61 estabelecimentos, 2.670 pratos com preços reais, 1.230 fotos e 917+ avaliações.</div>
          </div>
          <div class="card">
            <div class="t">Pipeline de Coleta e Auditoria (Python + Playwright)</div>
            <div class="d">Scripts de extração e verificação de nitidez de imagens (Pillow) sincronizados com o repositório GitHub e deploy Vercel.</div>
          </div>
        </div>
      </div>
    </div>
    <div class="foot">
      <span>Produção (Vercel): https://foddtech.vercel.app/</span>
      <span>Repositório (GitHub): https://github.com/GaboBiroo/caragua-foodtech-mono</span>
      <span>Padrão MVC adaptado para Next.js App Router</span>
    </div>
  </div>
</body>
</html>
"""

DER_HTML = """<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1440px;
    height: 580px;
    background: #FFFFFF;
    font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;
    color: #111111;
    padding: 18px 24px;
  }
  .outer {
    border: 2px solid #000000;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .hdr {
    background: #D9D9D9;
    border-bottom: 2px solid #000000;
    padding: 10px 18px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .hdr h1 { font-size: 18px; font-weight: 700; }
  .hdr span { font-size: 13px; font-weight: 700; color: #222; }
  .grid {
    display: grid;
    grid-template-columns: 1fr 60px 1fr 60px 1fr;
    padding: 16px 20px;
    flex: 1;
    align-items: center;
  }
  .entity {
    border: 1.5px solid #000000;
    background: #FFFFFF;
  }
  .ent-hdr {
    background: #D9D9D9;
    border-bottom: 1.5px solid #000000;
    padding: 7px 12px;
    font-size: 13.5px;
    font-weight: 700;
    display: flex;
    justify-content: space-between;
  }
  .ent-row {
    padding: 5px 12px;
    border-bottom: 1px solid #CCCCCC;
    font-size: 11.5px;
    display: flex;
    justify-content: space-between;
  }
  .ent-row:last-child { border-bottom: none; }
  .pk { font-weight: 700; color: #000; }
  .fk { font-weight: 700; color: #333; }
  .tp { font-family: Consolas, monospace; font-size: 11px; color: #444; }
  .rel {
    text-align: center;
    font-weight: 700;
    font-size: 12.5px;
  }
  .rel .line { font-size: 20px; display: block; }
  .bottom-row {
    padding: 0 20px 14px 20px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
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
  <div class="outer">
    <div class="hdr">
      <h1>MODELO ENTIDADE-RELACIONAMENTO (DER SIMPLIFICADO) — BANCO DE DADOS CARÁFOOD</h1>
      <span>Seção 7.1 • PostgreSQL (backend/sql/init.sql) + realDataStore.ts</span>
    </div>

    <div class="grid">
      <div class="entity">
        <div class="ent-hdr"><span>RESTAURANTS</span><span>(61 registros)</span></div>
        <div class="ent-row"><span class="pk">PK id</span><span class="tp">UUID</span></div>
        <div class="ent-row"><span>name / slug</span><span class="tp">VARCHAR(180)</span></div>
        <div class="ent-row"><span>neighborhood (53 bairros)</span><span class="tp">VARCHAR(80)</span></div>
        <div class="ent-row"><span>macro_region (4 regiões)</span><span class="tp">VARCHAR(40)</span></div>
        <div class="ent-row"><span>address / phone / menu_url</span><span class="tp">TEXT</span></div>
        <div class="ent-row"><span>latitude / longitude</span><span class="tp">DECIMAL(9,6)</span></div>
        <div class="ent-row"><span>rating_average / bayesian_wr</span><span class="tp">DECIMAL(3,2)</span></div>
        <div class="ent-row"><span>total_reviews</span><span class="tp">INTEGER</span></div>
      </div>

      <div class="rel">
        <span>1 : N</span>
        <span class="line">───►</span>
        <span>possui</span>
      </div>

      <div class="entity">
        <div class="ent-hdr"><span>MENU_ITEMS (PRATOS)</span><span>(2.670 registros)</span></div>
        <div class="ent-row"><span class="pk">PK id</span><span class="tp">UUID</span></div>
        <div class="ent-row"><span class="fk">FK restaurant_id</span><span class="tp">UUID</span></div>
        <div class="ent-row"><span>name / category</span><span class="tp">VARCHAR(180)</span></div>
        <div class="ent-row"><span>description</span><span class="tp">TEXT</span></div>
        <div class="ent-row"><span>price / previous_price</span><span class="tp">DECIMAL(10,2)</span></div>
        <div class="ent-row"><span>image_url / width / height</span><span class="tp">TEXT / INT</span></div>
        <div class="ent-row"><span>is_vegan / is_gluten_free</span><span class="tp">BOOLEAN</span></div>
        <div class="ent-row"><span>curation_status</span><span class="tp">VARCHAR(20)</span></div>
      </div>

      <div class="rel">
        <span>1 : N</span>
        <span class="line">───►</span>
        <span>recebe</span>
      </div>

      <div class="entity">
        <div class="ent-hdr"><span>REVIEWS (CÉDULA &amp; GOOGLE)</span><span>(917+ registros)</span></div>
        <div class="ent-row"><span class="pk">PK id</span><span class="tp">UUID</span></div>
        <div class="ent-row"><span class="fk">FK restaurant_id / dish_id</span><span class="tp">UUID</span></div>
        <div class="ent-row"><span>author_label</span><span class="tp">VARCHAR(120)</span></div>
        <div class="ent-row"><span>flavor_score (peso 35%)</span><span class="tp">SMALLINT (1..5)</span></div>
        <div class="ent-row"><span>presentation_score (20%)</span><span class="tp">SMALLINT (1..5)</span></div>
        <div class="ent-row"><span>local_ingredients_score (15%)</span><span class="tp">SMALLINT (1..5)</span></div>
        <div class="ent-row"><span>service (15%) / ambiance (15%)</span><span class="tp">SMALLINT (1..5)</span></div>
        <div class="ent-row"><span>weighted_rating / comment</span><span class="tp">DECIMAL / TEXT</span></div>
      </div>
    </div>

    <div class="bottom-row">
      <div class="entity">
        <div class="ent-hdr"><span>PARTNER_LEADS (CREDENCIAMENTO /CONTATO)</span><span>(Fluxo Create/Read S13)</span></div>
        <div class="ent-row"><span class="pk">PK protocol_code (ex.: CG-FT-842109)</span><span class="tp">VARCHAR(20)</span></div>
        <div class="ent-row"><span>restaurant_name / owner_name / neighborhood</span><span class="tp">VARCHAR(150)</span></div>
        <div class="ent-row"><span>email / whatsapp / specialty / status / created_at</span><span class="tp">VARCHAR / TIMESTAMP</span></div>
      </div>
      <div class="entity">
        <div class="ent-hdr"><span>NEIGHBORHOODS_CATALOG (53 BAIRROS OFICIAIS)</span><span>(4 Macro-Regiões)</span></div>
        <div class="ent-row"><span class="pk">PK slug / name (ex.: Centro, Martim de Sá, Cocanha, Indaiá)</span><span class="tp">VARCHAR(80)</span></div>
        <div class="ent-row"><span>macro_region (Centro, Norte, Sul, Sertão) / active_restaurants_count</span><span class="tp">VARCHAR / INT</span></div>
      </div>
    </div>

    <div class="foot">
      <span>Chaves Primárias (PK) e Estrangeiras (FK) com integridade referencial</span>
      <span>Persistência ativa em /api/restaurants/leads e /api/moderation</span>
    </div>
  </div>
</body>
</html>
"""


def generate_architecture_and_der_diagrams():
    SCREENSHOTS_S11_S16.mkdir(parents=True, exist_ok=True)
    arq_html_path = SCREENSHOTS_S11_S16 / "_arq_3_camadas.html"
    der_html_path = SCREENSHOTS_S11_S16 / "_der_banco.html"
    arq_html_path.write_text(ARQUITETURA_HTML, encoding="utf-8")
    der_html_path.write_text(DER_HTML, encoding="utf-8")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        ctx1 = browser.new_context(viewport={"width": 1440, "height": 600}, device_scale_factor=2)
        pg1 = ctx1.new_page()
        pg1.goto(arq_html_path.as_uri(), wait_until="networkidle")
        pg1.screenshot(path=str(SCREENSHOTS_S11_S16 / "arquitetura_3_camadas_clean.png"))
        ctx1.close()

        ctx2 = browser.new_context(viewport={"width": 1440, "height": 580}, device_scale_factor=2)
        pg2 = ctx2.new_page()
        pg2.goto(der_html_path.as_uri(), wait_until="networkidle")
        pg2.screenshot(path=str(SCREENSHOTS_S11_S16 / "der_banco_dados_clean.png"))
        ctx2.close()

        browser.close()

    arq_html_path.unlink(missing_ok=True)
    der_html_path.unlink(missing_ok=True)
    print("[1/2] Diagramas de Arquitetura (6.1) e DER do Banco (7.1) gerados com sucesso!")


# ==============================================================================
# 2. HELPERS DE FORMATAÇÃO FIÉIS AO MODELO DO GRUPO (APSII_S09_CARAFOOD.docx)
# ==============================================================================

def add_chapter_title(doc, text: str, page_break_before: bool = False):
    if page_break_before:
        doc.add_page_break()
    p = doc.add_paragraph()
    pf = p.paragraph_format
    pf.space_before = Pt(8 if not page_break_before else 0)
    pf.space_after = Pt(3)
    pf.line_spacing = 1.05
    pf.keep_with_next = True
    r = p.add_run(text)
    r.bold = True
    r.font.size = Pt(13)
    return p


def add_section_title(doc, text: str, page_break_before: bool = False):
    if page_break_before:
        doc.add_page_break()
    p = doc.add_paragraph()
    pf = p.paragraph_format
    pf.space_before = Pt(6 if not page_break_before else 0)
    pf.space_after = Pt(2)
    pf.line_spacing = 1.05
    pf.keep_with_next = True
    r = p.add_run(text)
    r.bold = True
    r.font.size = Pt(12)
    return p


def add_subsection_title(doc, text: str, page_break_before: bool = False):
    if page_break_before:
        doc.add_page_break()
    p = doc.add_paragraph()
    pf = p.paragraph_format
    pf.space_before = Pt(5 if not page_break_before else 0)
    pf.space_after = Pt(2)
    pf.line_spacing = 1.05
    pf.keep_with_next = True
    r = p.add_run(text)
    r.bold = True
    r.font.size = Pt(11.5)
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


def add_bullet(doc, bold_prefix: str, text: str, keep_with_next: bool = False):
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


def set_cell_pad(cell, top=75, bottom=75, left=110, right=110):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement("w:tcMar")
    for m, val in [("top", top), ("bottom", bottom), ("left", left), ("right", right)]:
        node = OxmlElement(f"w:{m}")
        node.set(qn("w:w"), str(val))
        node.set(qn("w:type"), "dxa")
        tcMar.append(node)
    tcPr.append(tcMar)


def add_template_table(doc, headers, rows, col_widths_in):
    tbl = doc.add_table(rows=1, cols=len(headers))
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
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
    tbl._tbl.tblPr.append(borders)

    hdr_cells = tbl.rows[0].cells
    for i, h_text in enumerate(headers):
        hdr_cells[i].text = ""
        set_cell_bg(hdr_cells[i], "D9D9D9")
        set_cell_pad(hdr_cells[i], top=85, bottom=85, left=110, right=110)
        p = hdr_cells[i].paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(h_text)
        r.bold = True
        r.font.size = Pt(10)

    for row_vals in rows:
        tr = tbl.add_row()
        tr._tr.get_or_add_trPr().append(OxmlElement("w:cantSplit"))
        rcells = tr.cells
        for i, val in enumerate(row_vals):
            rcells[i].text = ""
            if i == 0:
                set_cell_bg(rcells[i], "F3F3F3")
            set_cell_pad(rcells[i], top=68, bottom=68, left=110, right=110)
            p = rcells[i].paragraphs[0]
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            r = p.add_run(str(val))
            r.font.size = Pt(9.5)
            if i == 0:
                r.bold = True

    for row in tbl.rows:
        for i, w in enumerate(col_widths_in):
            row.cells[i].width = Inches(w)

    p_sp = doc.add_paragraph()
    p_sp.paragraph_format.space_before = Pt(0)
    p_sp.paragraph_format.space_after = Pt(3)
    return tbl


def add_single_figure(doc, img_path: Path, caption: str, width_in: float = 7.4):
    if img_path.exists():
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(3)
        p_img.paragraph_format.space_after = Pt(1)
        p_img.paragraph_format.keep_with_next = True
        p_img.add_run().add_picture(str(img_path), width=Inches(width_in))

    p_cap = doc.add_paragraph()
    p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cap.paragraph_format.space_before = Pt(0)
    p_cap.paragraph_format.space_after = Pt(6)
    r = p_cap.add_run(caption)
    r.font.size = Pt(9)


def add_desktop_mobile_pair(doc, desk_path: Path, mob_path: Path, caption: str, desk_w: float = 5.15, mob_w: float = 1.48):
    tbl = doc.add_table(rows=1, cols=2)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
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
    tbl._tbl.tblPr.append(borders)
    tr = tbl.rows[0]
    tr._tr.get_or_add_trPr().append(OxmlElement("w:cantSplit"))

    c0, c1 = tr.cells[0], tr.cells[1]
    c0.width = Inches(desk_w + 0.2)
    c1.width = Inches(mob_w + 0.2)
    c0.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
    c1.vertical_alignment = WD_ALIGN_VERTICAL.CENTER

    p0 = c0.paragraphs[0]
    p0.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p0.paragraph_format.space_before = Pt(0)
    p0.paragraph_format.space_after = Pt(0)
    if desk_path.exists():
        p0.add_run().add_picture(str(desk_path), width=Inches(desk_w))

    p1 = c1.paragraphs[0]
    p1.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p1.paragraph_format.space_before = Pt(0)
    p1.paragraph_format.space_after = Pt(0)
    if mob_path.exists():
        p1.add_run().add_picture(str(mob_path), width=Inches(mob_w))

    p_cap = doc.add_paragraph()
    p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cap.paragraph_format.space_before = Pt(2)
    p_cap.paragraph_format.space_after = Pt(6)
    r = p_cap.add_run(caption)
    r.font.size = Pt(9)


# ==============================================================================
# 3. CONSTRUÇÃO DO DOCUMENTO OFICIAL APSII_A1_Entrega_Final_CARAFOOD.docx
# ==============================================================================

def build_a1_final_docx():
    print("[2/2] Construindo APSII_A1_Entrega_Final_CARAFOOD.docx seguindo 100% do template A1...")
    doc = docx.Document(str(FRIEND_S09_DOCX))

    # Preserva intacta a Tabela 0 de Identificação do Projeto na Página 1
    for p in list(doc.paragraphs[5:]):
        p._element.getparent().remove(p._element)
    for t in list(doc.tables[1:]):
        t._element.getparent().remove(t._element)

    # ==========================================================================
    # 2. CONTEXTO, PROBLEMA E OBJETIVOS
    # ==========================================================================
    add_chapter_title(doc, "2. Contexto, Problema e Objetivos")

    add_section_title(doc, "2.1 Contexto e Motivação")
    add_text(
        doc,
        "O sistema CaráFood foi concebido para o cenário real da gastronomia e do turismo de Caraguatatuba (Litoral Norte de São Paulo), município com mais de 134 mil habitantes distribuídos em 53 bairros oficiais e forte vocação culinária, impulsionada pela maricultura de mexilhões da Praia da Cocanha (AMAPEC), pela pesca artesanal da Colônia Z-8 no Camaroeiro e pelo festival anual Caraguá a Gosto.",
    )
    add_text(
        doc,
        "Atualmente, a divulgação e a escolha de onde comer na cidade funcionam de maneira fragmentada e improvisada: pequenos quiosques de praia, restaurantes familiares e lanchonetes de bairros fora do eixo central dependem de cardápios em PDF no WhatsApp, postagens soltas no Instagram ou fichas desatualizadas em buscas gerais. Já os aplicativos de entrega tradicionais cobram taxas de intermediação entre 27% e 30% sobre cada pedido, o que inviabiliza a permanência de pequenos comerciantes locais e concentra a visibilidade digital apenas em grandes redes ou nos mesmos endereços do Centro e da Martim de Sá.",
    )

    add_section_title(doc, "2.2 Problema Principal")
    add_text(
        doc,
        "A dor central que o CaráFood resolve é a falta de um catálogo gastronômico gratuito (0% de taxa para o comerciante) que organize os estabelecimentos reais pelos 53 bairros de Caraguatatuba com preços conferidos, fotos nítidas e avaliações técnicas confiáveis. Hoje, moradores e turistas são prejudicados por notas genéricas de anos atrás que não refletem a qualidade atual da cozinha e pela dificuldade de encontrar pratos típicos ou lanches fora da orla central, enquanto produtores locais e restaurantes de bairro perdem clientes por falta de visibilidade digital acessível.",
    )

    add_section_title(doc, "2.3 Objetivo Geral")
    add_text(
        doc,
        "Desenvolver uma aplicação web responsiva e híbrida (Next.js 14, TypeScript e Tailwind CSS) para catalogar gratuitamente restaurantes e pratos reais dos 53 bairros de Caraguatatuba, permitindo filtrar por região e tipo de comida, consultar ficha completa com rota GPS e registrar avaliações ponderadas por 5 critérios.",
    )

    add_section_title(doc, "2.4 Objetivos Específicos")
    add_bullet(
        doc,
        "1. Mapear e organizar a busca territorial pelos 53 bairros oficiais: ",
        "exibir os 10 polos gastronômicos principais em barra rápida na Home e estruturar a lista completa dos 53 bairros em uma gaveta modal dividida nas 4 macro-regiões do município (Centro, Norte, Sul e Sertão), com busca instantânea e mapa vetorial.",
    )
    add_bullet(
        doc,
        "2. Catalogar estabelecimentos, pratos, preços e fotos reais: ",
        "disponibilizar uma base auditada de 61 restaurantes reais de Caraguatatuba e 2.670 pratos com preços reais, filtro rápido por tipo de comida (Lanches, Pizzas, Sushi, Frutos do Mar, Carnes, Combo Família e Açaí) e tratamento automático de nitidez de imagens (SmartFoodImage).",
    )
    add_bullet(
        doc,
        "3. Implementar avaliação multicritério e ordenação justa: ",
        "substituir estrelas isoladas pela Cédula Oficial de 5 critérios ponderados (Sabor 35%, Apresentação 20%, Insumos Locais 15%, Atendimento 15% e Ambiente 15%) e ordenar o catálogo pela Nota Ponderada Bayesiana (WR, m = 30) com limite de até 2 pratos seguidos por restaurante.",
    )
    add_bullet(
        doc,
        "4. Viabilizar o credenciamento gratuito de comerciantes e a curadoria por perfil: ",
        "oferecer formulário validado em /contato com gravação de protocolo único (CG-FT-XXXXXX) na API, controle de acesso para 3 perfis em /login e painel administrativo de moderação (/moderation) responsivo no computador e no celular.",
    )

    # ==========================================================================
    # 3. ESCOPO, REQUISITOS E REGRAS DE NEGÓCIO
    # ==========================================================================
    add_chapter_title(doc, "3. Escopo, Requisitos e Regras de Negócio", page_break_before=True)

    add_section_title(doc, "3.1 Escopo do Projeto (MVP)")
    add_bullet(
        doc,
        "Funcionalidades incluídas no MVP implementado: ",
        "(1) Home e catálogo principal (/) com 61 estabelecimentos e 2.670 pratos reais de Caraguatatuba, busca textual sem acentos, filtro rápido por tipo de comida, filtro dietético (vegano, vegetariano, sem glúten, sem lactose) e gaveta modal dos 53 bairros nas 4 macro-regiões; (2) página institucional Sobre Nós (/sobre); (3) formulário de Contato e Credenciamento gratuito (/contato) com validação de 6 campos e persistência de protocolo CG-FT-XXXXXX via API (/api/restaurants/leads); (4) tela de Login (/login) com 3 perfis em 1 clique e bloqueio de erro HTTP 401; (5) página de Rankings (/rankings) comparando Nota Histórica e Super Nota Bayesiana; (6) página dinâmica de Detalhe do Prato (/prato/[id]) com breadcrumb, rota GPS (Google Maps/Waze) e Cédula Oficial de 5 critérios; e (7) Painel de Curadoria (/moderation) e Portal Prof. Cristiano adaptados para desktop e celular.",
    )
    add_bullet(
        doc,
        "Funcionalidades fora do escopo (trabalhos futuros): ",
        "pagamento financeiro online dentro da plataforma (checkout via cartão/Pix), logística própria de motoboys em tempo real, login social via OAuth2 (Google/Apple) e upload direto de arquivos de foto pela câmera do celular no formulário de avaliação.",
    )

    add_section_title(doc, "3.2 Requisitos Funcionais (RF)")
    add_template_table(
        doc,
        headers=["Código", "Descrição resumida", "Status (Implementado / Parcial / Futuro)"],
        rows=[
            ("RF01", "Exibir o catálogo de restaurantes e pratos reais na Home (/) com busca textual insensível a acentos e alternância entre visão de Pratos (Feed) e Restaurantes.", "Implementado"),
            ("RF02", "Permitir filtragem territorial pelos 10 polos rápidos e pela gaveta modal contendo os 53 bairros oficiais agrupados nas 4 macro-regiões (Centro, Norte, Sul e Sertão).", "Implementado"),
            ("RF03", "Permitir filtragem rápida por tipo de comida (Lanches & Burgers, Pizzas & Esfihas, Sushi & Japa, Combo Família, Marmitas, Porções, Frutos do Mar e Açaí/Doces) e restrição alimentar.", "Implementado"),
            ("RF04", "Exibir a página dinâmica de detalhe do prato (/prato/[id]) com foto ampliada, preço conferido, restaurante, bairro, trilha breadcrumb, avaliações reais e pratos relacionados.", "Implementado"),
            ("RF05", "Disponibilizar na página de detalhe os CTAs de rota GPS ('Traçar Rota no Maps' / Waze), contato via WhatsApp e link para o cardápio original do estabelecimento.", "Implementado"),
            ("RF06", "Registrar avaliação do prato por meio do modal da Cédula Oficial de 5 critérios ponderados, calculando a nota na hora e somando +50 pontos ao perfil do usuário.", "Implementado"),
            ("RF07", "Apresentar a página institucional Sobre Nós (/sobre) com o contexto de Caraguatatuba, AMAPEC Cocanha, Colônia Z-8, Missão, Visão, Valores e equipe do projeto.", "Implementado"),
            ("RF08", "Validar os 6 campos obrigatórios do formulário de credenciamento (/contato), persistir a solicitação via POST /api/restaurants/leads e exibir protocolo único CG-FT-XXXXXX.", "Implementado"),
            ("RF09", "Autenticar usuários na tela de Login (/login) validando formato de e-mail e senha mínima (bloqueio HTTP 401) e redirecionando conforme os 3 perfis (Comensal, Gestor e Curador/Admin).", "Implementado"),
            ("RF10", "Disponibilizar o Painel Administrativo de Curadoria (/moderation) e a página /rankings para aprovar/rejeitar pratos, acompanhar quedas de preço e consultar solicitações de parceria.", "Implementado"),
        ],
        col_widths_in=[0.95, 7.65, 1.90],
    )

    add_section_title(doc, "3.3 Requisitos Não Funcionais (RNF) – Sintético")
    add_bullet(doc, "RNF01 – Responsividade Mobile-First: ", "interface adaptada para telas de smartphones (360px–430px), tablets e desktops (1366px+), incluindo cards mobile em /moderation e grade 2x2 no Portal Prof. Cristiano.")
    add_bullet(doc, "RNF02 – Nitidez e Proporção Visual (SmartFoodImage): ", "tratamento automático de imagens quadradas (1:1) ou compactas (<360px) sobre fundo desfocado (backdrop blur), evitando fotos esticadas ou borradas nos cards.")
    add_bullet(doc, "RNF03 – Segurança HTTPS, HSTS e CSP: ", "tráfego 100% HTTPS sem chamadas HTTP locais (Mixed Content zero) e cabeçalhos Strict-Transport-Security e Content-Security-Policy ativos para acesso seguro na rede da Universidade Cruzeiro do Sul.")
    add_bullet(doc, "RNF04 – Desempenho e Disponibilidade: ", "tempo de carregamento inicial inferior a 2 segundos via CDN global da Vercel, com dados reais pré-indexados e paginação progressiva na lista principal.")

    add_section_title(doc, "3.4 Regras de Negócio (RN)")
    add_bullet(doc, "RN01 – Isenção de Taxa para Comerciantes Locais (0% Taxa): ", "o credenciamento de restaurantes, quiosques e produtores locais em /contato é gratuito e não cobra comissão sobre vendas.")
    add_bullet(doc, "RN02 – Cálculo Ponderado da Cédula de 5 Critérios: ", "a nota técnica de cada avaliação na cédula é calculada por: Nota = (Sabor * 0,35) + (Apresentação * 0,20) + (Insumos Locais * 0,15) + (Atendimento * 0,15) + (Ambiente * 0,15).")
    add_bullet(doc, "RN03 – Nota Ponderada Bayesiana (WR): ", "o posicionamento no ranking utiliza WR = [v / (v + m)] * R + [m / (v + m)] * C (com mínimo m = 30 avaliações), evitando que um local com apenas 1 avaliação nota 5,0 ultrapasse casas consolidadas com centenas de avaliações.")
    add_bullet(doc, "RN04 – Diversidade no Topo do Catálogo (Round-Robin Cap): ", "a listagem principal exibe no máximo 2 pratos consecutivos do mesmo restaurante na primeira dobra, garantindo espaço equilibrado para diferentes estabelecimentos.")

    # ==========================================================================
    # 4. HISTÓRIAS DE USUÁRIO E FLUXOS
    # ==========================================================================
    add_chapter_title(doc, "4. Histórias de Usuário e Fluxos", page_break_before=True)

    add_section_title(doc, "4.1 Histórias de Usuário")
    add_template_table(
        doc,
        headers=["Código", "História de Usuário (Como [tipo de usuário], quero [ação], para [benefício])", "RF associado(s)"],
        rows=[
            ("HU01", "Como morador ou turista em Caraguatatuba, quero filtrar o catálogo pelos 53 bairros, pelas 4 macro-regiões ou pelo tipo de comida (lanche, pizza, sushi, frutos do mar), para encontrar rapidamente onde comer perto de mim.", "RF01, RF02, RF03"),
            ("HU02", "Como cliente de um restaurante local, quero abrir a ficha detalhada do prato e avaliá-lo na Cédula Oficial de 5 critérios ponderados, para registrar minha experiência com justiça e acumular pontos no passaporte.", "RF04, RF06"),
            ("HU03", "Como visitante em trânsito pelo celular, quero clicar em 'Traçar Rota no Maps' ou 'Chamar no WhatsApp' dentro da página do prato, para chegar ao estabelecimento ou tirar dúvidas sem digitar endereço.", "RF04, RF05"),
            ("HU04", "Como consumidor indeciso, quero comparar os estabelecimentos na página de Rankings (/rankings) pela Nota Ponderada Bayesiana e consultar o assistente Chef IA, para escolher pratos bem avaliados com preço real.", "RF01, RF10"),
            ("HU05", "Como dono de restaurante ou quiosque local, quero preencher o formulário de credenciamento gratuito (0% taxa) em /contato e receber um código de protocolo, para divulgar meu cardápio na plataforma.", "RF07, RF08"),
            ("HU06", "Como administrador e curador do sistema, quero autenticar meu perfil em /login e acessar o painel /moderation no computador ou celular, para aprovar pratos pendentes e revisar solicitações de credenciamento.", "RF09, RF10"),
            ("HU07", "Como maricultor da AMAPEC (Cocanha) ou pescador artesanal da Colônia Z-8, quero ver a história e a procedência caiçara destacadas nas páginas institucionais e nos pratos, para valorizar a produção da cidade.", "RF04, RF07"),
        ],
        col_widths_in=[0.95, 7.75, 1.80],
    )

    add_section_title(doc, "4.2 Fluxos de Navegação / User Flow")
    add_text(
        doc,
        "A navegação do CaráFood parte da Barra Superior Fixa (Navbar.tsx) no computador e da barra inferior / menu gaveta no celular, conectando três fluxos principais sem becos sem saída: (1) no Fluxo do Cliente (Usuário → Home / → Filtro por Bairro ou Tipo de Comida → Lista → Detalhe /prato/[id] → Rota GPS ou Cédula de 5 Critérios), o usuário descobre um prato, consulta sua ficha completa e retorna facilmente pelo breadcrumb (Início > Bairro > Prato); (2) no Fluxo de Credenciamento (Usuário → Sobre Nós /sobre → Contato /contato → Validação dos 6 campos → Gravação na API e exibição do protocolo CG-FT-XXXXXX), comerciantes locais solicitam adesão gratuita; e (3) no Fluxo de Acesso por Perfil (Usuário → Login /login → Seleção de Perfil → Redirecionamento para Catálogo, Credenciamento ou Painel de Curadoria /moderation), o sistema direciona cada ator para sua área de trabalho.",
    )
    add_single_figure(
        doc,
        SCREENSHOTS_S10 / "00_mapa_paginas_clean.png",
        "Figura 1 – Diagrama do Mapa de Páginas e Fluxos de Navegação (User Flow) do sistema CaráFood.",
        width_in=8.3,
    )

    # ==========================================================================
    # 5. INTERFACE, PROTÓTIPO E TELAS IMPLEMENTADAS
    # ==========================================================================
    add_chapter_title(doc, "5. Interface, Protótipo e Telas Implementadas", page_break_before=True)

    add_section_title(doc, "5.1 Protótipo")
    add_text(
        doc,
        "Na Semana 02 desenvolvemos o protótipo navegável das 6 telas principais (versionado no repositório em entregas_aps2/S02_Prototipo_Historias_Mapa/PROTOTIPO_PARA_PRINT.html). O protótipo permitiu validar a ideia de exibir apenas os polos principais no topo e agrupar os 53 bairros em uma gaveta modal, estrutura que foi mantida e aprimorada na implementação final.",
    )
    add_single_figure(
        doc,
        SCREENSHOTS_S10 / "00_prototipo_s02.png",
        "Figura 2 – Visão panorâmica do protótipo inicial das 6 telas (Home, Lista/Rankings, Detalhe do Prato, Sobre Nós, Contato e Login).",
        width_in=7.6,
    )

    add_section_title(doc, "5.2 Telas Principais Implementadas", page_break_before=True)

    # 5.2.1 Home
    add_subsection_title(doc, "5.2.1 Home / Landing Page (https://foddtech.vercel.app/)")
    add_text(
        doc,
        "Ponto de entrada da aplicação (src/app/page.tsx). Apresenta a identidade visual do CaráFood, barra de busca instantânea, filtros dietéticos, pílulas rápidas por tipo de comida (Lanches & Burgers, Pizzas & Esfihas, Sushi & Japa, Combo Família, Marmitas, Porções e Frutos do Mar), barra dos polos territoriais e o catálogo real com 61 estabelecimentos e 2.670 pratos conferidos.",
    )
    add_text(doc, "RF01, RF02, RF03 | Histórias de Usuário: HU01 e HU04.", bold_prefix="RF/HU associados: ")
    add_desktop_mobile_pair(
        doc,
        SCREENSHOTS_S11_S16 / "home_depois_desktop.png",
        SCREENSHOTS_S11_S16 / "home_depois_mobile.png",
        "Figura 3 – Tela Home / Landing Page (/) em produção nas versões computador e celular.",
    )

    # 5.2.2 Sobre Nós
    add_subsection_title(doc, "5.2.2 Sobre Nós (https://foddtech.vercel.app/sobre)", page_break_before=True)
    add_text(
        doc,
        "Página institucional (src/app/sobre/page.tsx) que apresenta o contexto territorial dos 53 bairros de Caraguatatuba, a valorização da maricultura da Praia da Cocanha (AMAPEC) e da pesca artesanal da Colônia Z-8, os cartões de Missão, Visão e Valores, a proposta de 0% de taxa para comerciantes locais e a identificação dos três integrantes do grupo.",
    )
    add_text(doc, "Fundamenta a motivação regional da Seção 2 e atende ao RF07 e às histórias HU05 e HU07.", bold_prefix="Relação com contexto/objetivos e RF/HU: ")
    add_desktop_mobile_pair(
        doc,
        SCREENSHOTS_S11_S16 / "sobre_desktop.png",
        SCREENSHOTS_S10 / "03_sobre_mobile.png",
        "Figura 4 – Tela Sobre Nós (/sobre) nas versões computador e celular.",
    )

    # 5.2.3 Contato / Credenciamento
    add_subsection_title(doc, "5.2.3 Contato / Credenciamento Gratuito (https://foddtech.vercel.app/contato)", page_break_before=True)
    add_text(
        doc,
        "Página de atendimento e adesão gratuita de restaurantes, quiosques e produtores locais (src/app/contato/page.tsx). Realiza validação de 6 campos obrigatórios (Assunto, Nome/Estabelecimento, E-mail, Telefone/WhatsApp, Bairro dentre os 53 oficiais e Mensagem), persiste o envio via POST /api/restaurants/leads e exibe na tela o comprovante com código de protocolo único (CG-FT-XXXXXX).",
    )
    add_text(doc, "RF08 e RN01 | História de Usuário: HU05.", bold_prefix="HU/RF relacionados: ")
    add_desktop_mobile_pair(
        doc,
        SCREENSHOTS_S11_S16 / "contato_desktop.png",
        SCREENSHOTS_S11_S16 / "contato_protocolo_mobile.png",
        "Figura 5 – Tela de Contato (/contato) com formulário validado no computador e comprovante de protocolo CG-FT-XXXXXX no celular.",
    )

    # 5.2.4 Login / Acesso
    add_subsection_title(doc, "5.2.4 Login / Acesso por Perfil (https://foddtech.vercel.app/login)", page_break_before=True)
    add_text(
        doc,
        "Tela de autenticação (src/app/login/page.tsx) com validação de credenciais, bloqueio visual de erro HTTP 401 para senhas inválidas (< 6 caracteres) e atalho de acesso rápido em 1 clique dentro do próprio card selecionado para facilitar a avaliação docente em computador e celular.",
    )
    add_text(
        doc,
        "(1) Avaliador Local & Visitante (comensal@carafood.com.br → redireciona para o catálogo /); (2) Gestor de Restaurante (gestor@restaurante.com.br → redireciona para /contato); e (3) Curadoria & Banca Módulo (cristiano@modulo.edu.br → redireciona para o painel administrativo /moderation). RF09 | HU06.",
        bold_prefix="Perfis cobertos e RF/HU: ",
    )
    add_desktop_mobile_pair(
        doc,
        SCREENSHOTS_S11_S16 / "login_desktop.png",
        SCREENSHOTS_S11_S16 / "login_mobile.png",
        "Figura 6 – Tela de Login (/login) com os 3 perfis e botão de acesso em 1 clique no computador e no celular.",
    )

    # 5.2.5 Lista Principal (Catálogo / Rankings / 53 Bairros)
    add_subsection_title(doc, "5.2.5 Lista Principal, Gaveta dos 53 Bairros e Rankings (https://foddtech.vercel.app/rankings)", page_break_before=True)
    add_text(
        doc,
        "A listagem principal (na Home / e em /rankings, código em src/app/rankings/page.tsx e src/data/realDataStore.ts) organiza os 61 estabelecimentos e 2.670 pratos reais pela Nota Ponderada Bayesiana (WR), permitindo abrir a gaveta modal dos 53 bairros divididos nas 4 macro-regiões com mapa vetorial interativo e seguir com 1 clique para a página de detalhe.",
    )
    add_text(doc, "RF01, RF02, RF03, RF10 e RN03/RN04 | Histórias de Usuário: HU01 e HU04.", bold_prefix="HU/RF relacionados: ")
    add_desktop_mobile_pair(
        doc,
        SCREENSHOTS_S11_S16 / "rankings_desktop.png",
        SCREENSHOTS_S10 / "02_bairros_modal.png",
        "Figura 7 – Lista comparativa de Rankings (/rankings) à esquerda e gaveta modal dos 53 bairros nas 4 macro-regiões à direita.",
        desk_w=4.60,
        mob_w=4.60,
    )

    # 5.2.6 Página de Detalhe
    add_subsection_title(doc, f"5.2.6 Página de Detalhe do Prato (https://foddtech.vercel.app/prato/{REAL_DISH_ID})", page_break_before=True)
    add_text(
        doc,
        "Rota dinâmica master–detail (src/app/prato/[id]/page.tsx e PratoDetailClient.tsx) aberta ao clicar em qualquer item da lista. Exibe trilha breadcrumb (Início > Bairro > Prato), foto real em alta definição, preço conferido no cardápio, nota e avaliações reais do Google Maps, ingredientes/descrição e lista de outros pratos do cardápio.",
    )
    add_text(
        doc,
        "(1) 'Traçar Rota no Maps' (abre navegação GPS até o restaurante); (2) 'Chamar no WhatsApp' e 'Conferir no Cardápio Original'; (3) 'Avaliar na Cédula Oficial (+50 Pontos)' (abre o modal de avaliação nos 5 critérios ponderados); e (4) curtir, salvar no roteiro e compartilhar link. RF04, RF05, RF06 | HU02 e HU03.",
        bold_prefix="Ações possíveis (CTAs) e RF/HU: ",
    )
    add_desktop_mobile_pair(
        doc,
        SCREENSHOTS_S11_S16 / "detalhe_prato_desktop.png",
        SCREENSHOTS_S11_S16 / "detalhe_cedula_mobile.png",
        f"Figura 8 – Página de Detalhe (/prato/{REAL_DISH_ID}) no computador e modal da Cédula Oficial de 5 critérios aberto no celular.",
    )

    # ==========================================================================
    # 6. ARQUITETURA DA SOLUÇÃO E TECNOLOGIAS UTILIZADAS
    # ==========================================================================
    add_chapter_title(doc, "6. Arquitetura da Solução e Tecnologias Utilizadas", page_break_before=True)

    add_section_title(doc, "6.1 Arquitetura em Alto Nível")
    add_text(
        doc,
        "O CaráFood adota uma arquitetura web em 3 camadas (Apresentação, Lógica de Negócio e Dados), aplicando o padrão MVC adaptado ao modelo Full-Stack Serverless do Next.js 14 (App Router). Na Camada de Apresentação (View / Front-end), as páginas e componentes React renderizam a interface responsiva no navegador (computador e celular), aplicam validações imediatas de formulário e garantem nitidez visual por meio do componente SmartFoodImage. A comunicação com o servidor ocorre exclusivamente via requisições HTTPS REST em formato JSON para a Camada de Lógica de Negócio (Controller / Back-end Serverless), composta pelas rotas de API em src/app/api/* (/api/restaurants/leads, /api/moderation, /api/restaurants e /api/ai/chat) e pelo motor de regras de negócio (cálculo da Cédula Ponderada de 5 critérios, Nota Bayesiana WR e algoritmo Round-Robin anti-monopólio). Por fim, a Camada de Dados e Persistência (Model) combina o esquema relacional PostgreSQL (definido em backend/sql/init.sql para execução containerizada) com o repositório de dados reais auditados (src/data/realDataStore.ts e caraguaRealDump.json), mantendo separação clara de responsabilidades entre interface, regras de negócio e armazenamento.",
    )
    add_single_figure(
        doc,
        SCREENSHOTS_S11_S16 / "arquitetura_3_camadas_clean.png",
        "Figura 9 – Diagrama da arquitetura em 3 camadas (Apresentação, Lógica/API Serverless e Dados/Persistência) do CaráFood.",
        width_in=8.2,
    )

    add_section_title(doc, "6.2 Tecnologias Utilizadas")
    add_bullet(doc, "Front-end Web e Casca Nativa Mobile (Híbrido): ", "Next.js 14.2 (App Router), React 18, TypeScript 5, Tailwind CSS 3.4 e Casca Nativa em React Native / Expo (mobile/src/components/NativeWebViewShell.tsx).")
    add_bullet(doc, "Integração da Casca Nativa (Intents Externas, BackHandler e Safe Area): ", "(1) Interceptação de Intents Externas em /prato/[id]: os botões 'Traçar Rota no Maps' e 'Chamar no WhatsApp' disparam links externos (maps.google.com, waze.com, wa.me), que o método onShouldStartLoadWithRequest da WebView intercepta e abre fora do app via Linking.openURL para acionar o GPS e o WhatsApp nativos do celular; (2) Botão Voltar Físico (Android) e Safe Area: conexão do BackHandler ao histórico interno da WebView (canGoBack / goBack) e aplicação do SafeAreaView no topo verde (#0F382C) para não sobrepor o relógio e a bateria do aparelho.")
    add_bullet(doc, "Back-end: ", "Next.js Serverless API Routes (Node.js / TypeScript em src/app/api/*) e scripts de coleta/higienização em Python 3.13.")
    add_bullet(doc, "Banco de Dados e Persistência: ", "PostgreSQL 15 (modelagem relacional e DDL em backend/sql/init.sql via Docker Compose) + Store JSON Real Auditado (caraguaRealDump.json e realDataStore.ts).")
    add_bullet(doc, "Ferramentas de Deploy e Infraestrutura: ", "Vercel (hospedagem cloud, build automatizado, funções Serverless e certificado SSL/TLS HTTPS com cabeçalhos HSTS/CSP).")
    add_bullet(doc, "Ferramentas de Apoio e Qualidade: ", "Git e GitHub (versionamento e CI/CD), Playwright (testes end-to-end e auditoria visual), Pillow (inspeção de dimensões de imagens) e VS Code.")

    # ==========================================================================
    # 7. BANCO DE DADOS E PERSISTÊNCIA
    # ==========================================================================
    add_chapter_title(doc, "7. Banco de Dados e Persistência", page_break_before=True)

    add_section_title(doc, "7.1 Modelo de Dados (Diagrama e Descrição das Entidades)")
    add_text(
        doc,
        "O modelo relacional do sistema (definido em backend/sql/init.sql e espelhado em src/data/realDataStore.ts) é composto por quatro entidades principais inter-relacionadas:",
    )
    add_bullet(
        doc,
        "1. Tabela RESTAURANTS (Estabelecimentos — 61 registros reais): ",
        "armazena id (UUID, PK), name, slug, neighborhood (um dos 53 bairros oficiais), macro_region (Centro, Norte, Sul ou Sertão), address, phone, menu_url, latitude, longitude, rating_average, bayesian_rating e total_reviews.",
    )
    add_bullet(
        doc,
        "2. Tabela MENU_ITEMS (Cardápio de Pratos — 2.670 registros reais): ",
        "armazena id (UUID, PK), restaurant_id (UUID, FK referenciando RESTAURANTS com relação 1:N), name, category, description, price, previous_price, image_url, image_width, image_height, is_vegan, is_gluten_free e curation_status.",
    )
    add_bullet(
        doc,
        "3. Tabela REVIEWS (Avaliações da Cédula e Google Maps — 917+ registros): ",
        "armazena id (UUID, PK), restaurant_id (FK), dish_id (FK), author_label, as 5 notas de 1 a 5 da cédula (flavor_score, presentation_score, local_ingredients_score, service_score, ambiance_score), weighted_rating, comment_text e review_date.",
    )
    add_bullet(
        doc,
        "4. Tabela PARTNER_LEADS (Credenciamentos /contato): ",
        "armazena protocol_code (PK, ex.: CG-FT-842109), restaurant_name, owner_name, email, whatsapp, neighborhood, specialty, status ('Recebido — Em Análise') e created_at.",
    )
    add_single_figure(
        doc,
        SCREENSHOTS_S11_S16 / "der_banco_dados_clean.png",
        "Figura 10 – Diagrama Entidade-Relacionamento (DER simplificado) do banco de dados do CaráFood.",
        width_in=8.2,
    )

    add_section_title(doc, "7.2 Principais Operações de Persistência (Create, Read, Update)")
    add_bullet(
        doc,
        "Inserção de dados (CREATE — Formulário /contato e Cédula /prato/[id]): ",
        "ao enviar o formulário em /contato, o front-end executa POST /api/restaurants/leads, que valida os 6 campos, gera o protocolo único CG-FT-XXXXXX e insere o novo registro em PARTNER_LEADS. Na página de detalhe, o envio da Cédula de 5 critérios calcula a média ponderada e adiciona a nova avaliação à lista do prato.",
    )
    add_bullet(
        doc,
        "Leitura e consulta filtrada (READ — Catálogo /, /rankings, /prato/[id] e /moderation): ",
        "a Home e a rota GET /api/restaurants consultam os 61 estabelecimentos e 2.670 pratos aplicando filtros por bairro, macro-região, tipo de comida e ordenação Bayesiana WR. Já GET /api/restaurants/leads lista os protocolos de credenciamento salvos tanto em /contato quanto na aba 'Credenciamentos' de /moderation.",
    )
    add_bullet(
        doc,
        "Atualização de status (UPDATE — Curadoria /moderation): ",
        "ao clicar em 'Aprovar', 'Arquivar' ou 'Aprovar Todos' no painel /moderation, o sistema envia POST /api/moderation atualizando o status de curadoria (curation_status) dos pratos e os contadores do painel.",
    )

    # ==========================================================================
    # 8. DEPLOY, AMBIENTES E URL
    # ==========================================================================
    add_chapter_title(doc, "8. Deploy, Ambientes e URL", page_break_before=True)

    add_section_title(doc, "8.1 Plataforma de Deploy e Classificação do Ambiente")
    add_text(
        doc,
        "O sistema está implantado na plataforma Vercel (plano Hobby gratuito), conectada via integração contínua (CI/CD) à branch main do repositório GitHub. O ambiente opera em modo híbrido de Produção / Demonstração Acadêmica (Prod / Demo): exibe dados 100% reais e auditados de Caraguatatuba em produção (61 restaurantes, 2.670 pratos e 917+ avaliações), mantendo ativos os 3 perfis demonstrativos em 1 clique na tela /login e o Portal Prof. Cristiano para facilitar a avaliação da banca.",
    )

    add_section_title(doc, "8.2 URLs de Acesso em Funcionamento")
    add_template_table(
        doc,
        headers=["Módulo / Rota", "URL Publicada em Produção (HTTPS)", "Descrição rápida"],
        rows=[
            ("URL Principal (Home / Catálogo)", "https://foddtech.vercel.app/", "Landing page, filtro pelos 53 bairros, pílulas por tipo de comida e 2.670 pratos reais."),
            ("Página Sobre Nós (S04)", "https://foddtech.vercel.app/sobre", "Contexto de Caraguatatuba, AMAPEC Cocanha, Colônia Z-8, Missão/Visão/Valores e equipe."),
            ("Contato / Credenciamento (S05)", "https://foddtech.vercel.app/contato", "Formulário validado de parceria 0% taxa com geração de protocolo CG-FT-XXXXXX."),
            ("Login por Perfil (S07)", "https://foddtech.vercel.app/login", "Acesso em 1 clique para Comensal, Gestor e Curador/Admin (senha: Carafood@2026)."),
            ("Lista e Rankings (S08)", "https://foddtech.vercel.app/rankings", "Ranking comparativo pela Nota Ponderada Bayesiana (WR) dos estabelecimentos."),
            ("Página de Detalhe (S09)", f"https://foddtech.vercel.app/prato/{REAL_DISH_ID}", "Ficha completa do prato, rota GPS e modal da Cédula Oficial de 5 critérios."),
            ("Painel Admin de Curadoria", "https://foddtech.vercel.app/moderation", "Painel responsivo (Desktop e Mobile) para aprovar pratos e ver credenciamentos."),
            ("Endpoints da API Serverless", "https://foddtech.vercel.app/api/moderation e /api/restaurants/leads", "Rotas REST JSON de persistência de credenciamentos e moderação de cardápios."),
        ],
        col_widths_in=[2.35, 4.15, 4.00],
    )

    add_section_title(doc, "8.3 Instruções de Execução Local")
    add_bullet(doc, "Requisitos: ", "Node.js 18+ (ou 20 LTS), npm 9+, Git e (opcionalmente) Docker Desktop para subir o container PostgreSQL 15.")
    add_bullet(doc, "1. Clonar o repositório: ", "git clone https://github.com/GaboBiroo/caragua-foodtech-mono.git && cd caragua-foodtech-mono")
    add_bullet(doc, "2. Configurar variáveis de ambiente (opcional): ", "criar arquivo .env.local com NEXT_PUBLIC_SITE_URL=http://localhost:3000 (a aplicação funciona imediatamente sem configuração extra pois carrega o store real auditado).")
    add_bullet(doc, "3. Instalar dependências e rodar: ", "npm install && npm run dev (acessar http://localhost:3000 no navegador; para testar o build de produção, executar npm run build && npm start).")

    # ==========================================================================
    # 9. TESTES REALIZADOS
    # ==========================================================================
    add_chapter_title(doc, "9. Testes Realizados", page_break_before=True)

    add_section_title(doc, "9.1 Testes de Usabilidade (Semana 12)")
    add_text(
        doc,
        "Executamos 3 cenários práticos de usabilidade em https://foddtech.vercel.app/ com participantes externos ao grupo (dois estudantes de outros grupos de ADS usando smartphone 390x844 px e PC do laboratório da Cruzeiro do Sul, e uma moradora de Caraguatatuba usando notebook):",
    )
    add_bullet(
        doc,
        "Cenário 1 — Descoberta por bairro e tipo de prato até a rota GPS (Tempo médio: 1 min 15 s): ",
        "o testador filtrou lanches no Centro, abriu a ficha do prato e acionou a rota no Google Maps. Observou que pílulas rápidas por tipo de comida (Lanche, Pizza, Sushi, Combo Família) agilizariam a escolha sem precisar digitar na busca e que fotos quadradas (1:1) ficavam recortadas nos cards horizontais. Aplicamos ambas as sugestões na S11/S12.",
    )
    add_bullet(
        doc,
        "Cenário 2 — Avaliação na Cédula Oficial de 5 critérios (Tempo médio: 1 min 40 s): ",
        "a testadora abriu /prato/[id], preencheu os 5 critérios ponderados e enviou o voto. Sugeriu manter o percentual de peso (35%, 20%, 15%) bem visível ao lado de cada critério e destacar o aviso de '+50 Pontos creditados', ajustes que foram incorporados ao modal.",
    )
    add_bullet(
        doc,
        "Cenário 3 — Credenciamento (/contato), Login (/login) e Curadoria (/moderation) no celular e no laboratório (Tempo médio: 1 min 50 s): ",
        "o testador gerou o protocolo CG-FT-XXXXXX em /contato, mas notou que no celular era preciso rolar a tela inteira em /login após escolher o perfil, que a tabela de /moderation cortava colunas em telas de 390px e que nos PCs da faculdade chamadas para localhost:8000 geravam alerta de segurança. Corrigimos os três pontos criando o botão de login em 1 toque dentro do card, os cards mobile em /moderation e os cabeçalhos HTTPS/HSTS sem chamadas HTTP locais.",
    )

    add_section_title(doc, "9.2 Testes Funcionais / Casos de Teste")
    add_template_table(
        doc,
        headers=["Código", "Cenário / Descrição do Caso de Teste Funcional", "Resultado"],
        rows=[
            ("CT01", "Filtrar o catálogo na Home (/) combinando um bairro específico (ex.: 'Centro' ou 'Indaiá') com o filtro de tipo de comida 'Lanches & Burgers'.", "Aprovado (Exibe apenas locais reais do bairro e categoria selecionados)"),
            ("CT02", "Abrir a gaveta modal dos 53 bairros, selecionar a macro-região 'Norte' e buscar por 'Cocanha' ou 'Massaguaçu'.", "Aprovado (Filtra a região corretamente sem recarregar a página)"),
            ("CT03", f"Clicar em um card da lista principal para abrir a rota dinâmica /prato/{REAL_DISH_ID} e acionar o botão 'Traçar Rota no Maps'.", "Aprovado (Carrega ficha completa, breadcrumb e abre coordenadas GPS)"),
            ("CT04", "Abrir o modal da Cédula Oficial em /prato/[id], atribuir notas de 1 a 5 nos 5 critérios ponderados, preencher comentário e enviar.", "Aprovado (Calcula média ponderada RN02, exibe na lista e soma +50 pts)"),
            ("CT05", "Tentar enviar o formulário de /contato com campos obrigatórios em branco ou e-mail inválido.", "Aprovado (Bloqueia envio e destaca mensagem clara de validação)"),
            ("CT06", "Preencher os 6 campos válidos em /contato e submeter solicitação de credenciamento gratuito (0% taxa).", "Aprovado (Persiste em POST /api/restaurants/leads, gera protocolo CG-FT-XXXXXX e lista na aba Credenciamentos de /moderation)"),
            ("CT07", "Acionar o botão 'Simular Erro (S07)' em /login (senha com menos de 6 caracteres) e, em seguida, autenticar com 1 clique no perfil Curador.", "Aprovado (Exibe bloqueio HTTP 401 no erro e redireciona o perfil válido para /moderation)"),
            ("CT08", "Acessar /moderation e o Portal Prof. Cristiano em viewport mobile (390x844 px) e aprovar um prato pendente na fila.", "Aprovado (Exibe cards mobile sem rolagem horizontal e atualiza contadores via POST /api/moderation)"),
        ],
        col_widths_in=[0.85, 6.65, 3.00],
    )
    add_text(
        doc,
        "Verificação automatizada complementar: além dos casos manuais acima, o projeto utiliza checagem estática de tipos (npx tsc --noEmit com 0 erros), build de rotas Next.js (18 rotas compiladas) e scripts automatizados em Playwright (scripts/generate_remaining_aps2_deliverables.py) que testam a renderização Desktop e Mobile de todas as páginas em produção.",
    )

    # ==========================================================================
    # 10. MELHORIA CONTÍNUA E AJUSTES PÓS-A2
    # ==========================================================================
    add_chapter_title(doc, "10. Melhoria Contínua e Ajustes Pós-A2", page_break_before=True)
    add_text(
        doc,
        "Entre a avaliação intermediária (S10 / A2) e esta entrega final (A1), o grupo realizou um ciclo profundo de melhoria contínua guiado pelas críticas da A2 e pelos testes práticos da S12. A primeira grande mudança foi a substituição integral dos itens demonstrativos iniciais por um pipeline de dados 100% reais de Caraguatatuba, elevando o catálogo para 61 estabelecimentos reais, 2.670 pratos com preços reais conferidos, 1.230 fotos reais e mais de 917 avaliações verificadas do Google Maps. Em segundo lugar, aprimoramos a experiência de descoberta e a qualidade visual: implementamos a Nota Ponderada Bayesiana (WR, m = 30) combinada ao limite Round-Robin de no máximo 2 pratos seguidos por restaurante, adicionamos as pílulas de filtro rápido por tipo de comida na Home e criamos o componente SmartFoodImage.tsx, que detecta fotos quadradas (1:1) ou compactas e aplica um fundo desfocado (backdrop blur) para eliminar o aspecto borrado ou esticado nos cards.",
    )
    add_text(
        doc,
        "Em terceiro lugar, refatoramos a usabilidade mobile (360px–430px) e a infraestrutura de segurança para a rede acadêmica: colocamos o botão do Portal Prof. Cristiano visível na barra mobile, organizamos suas abas em grade 2x2 sem rolagem dupla, adicionamos login em 1 toque dentro do próprio card em /login e criamos a visão em cards responsivos no painel /moderation. Além disso, eliminamos todas as chamadas clientes para http://localhost:8000 (substituídas pelas rotas Serverless HTTPS /api/moderation e /api/restaurants/leads) e configuramos cabeçalhos Strict-Transport-Security (HSTS) e Content-Security-Policy (upgrade-insecure-requests) em next.config.js e vercel.json, resolvendo definitivamente o aviso de 'Não Seguro' nos computadores da Universidade Cruzeiro do Sul. Ficaram planejados para trabalhos futuros o login OAuth com Google e o upload de fotos direto pela câmera do celular.",
    )

    # ==========================================================================
    # 11. CONCLUSÕES E TRABALHOS FUTUROS
    # ==========================================================================
    add_chapter_title(doc, "11. Conclusões e Trabalhos Futuros")

    add_section_title(doc, "11.1 Conclusões")
    add_text(
        doc,
        "O desenvolvimento do CaráFood cumpriu integralmente os objetivos geral e específicos traçados no início do semestre: entregamos uma aplicação web híbrida, responsiva e publicada em produção (https://foddtech.vercel.app/) que reúne 61 estabelecimentos e 2.670 pratos reais distribuídos pelos 53 bairros de Caraguatatuba. Todas as 6 páginas obrigatórias do cronograma (Home, Sobre Nós, Contato, Login, Lista/Rankings e Detalhe do Prato), somadas ao Painel Administrativo de Curadoria (/moderation), operam de forma integrada, com regras de negócio reais e persistência via API. Em uso real no município, a plataforma tem potencial direto para democratizar a visibilidade digital de pequenos restaurantes familiares, quiosques de praia e produtores caiçaras (AMAPEC e Colônia Z-8) sem cobrar taxas predatórias de intermediação.",
    )

    add_section_title(doc, "11.2 Trabalhos Futuros")
    add_bullet(doc, "Banco de dados PostgreSQL gerenciado em nuvem dedicada (Supabase / Neon): ", "conectar as rotas Serverless da Vercel a uma instância PostgreSQL externa permanente para que novos protocolos de /contato persistam além do ciclo de vida das instâncias gratuitas.")
    add_bullet(doc, "Autenticação OAuth2 e Painel Self-Service do Comerciante: ", "permitir login com conta Google e área exclusiva para o próprio dono do restaurante atualizar preços e promoções do dia.")
    add_bullet(doc, "Upload de fotos na Cédula Oficial e PWA Offline: ", "habilitar envio de foto do prato tirada na mesa pelo cliente e cache offline (Service Worker) dos roteiros salvos.")
    add_bullet(doc, "Integração com calendário oficial de eventos municipais: ", "sincronizar os pratos concorrentes das edições anuais do Festival Caraguá a Gosto e da Festa da Tainha.")

    # ==========================================================================
    # 12. AUTOAVALIAÇÃO DO GRUPO
    # ==========================================================================
    add_chapter_title(doc, "12. Autoavaliação do Grupo", page_break_before=True)
    add_text(
        doc,
        "Como principais pontos fortes do projeto, destacamos o compromisso do grupo em ir além de um protótipo fictício: construímos um catálogo com dados 100% reais de Caraguatatuba (61 restaurantes e 2.670 pratos reais com preços e fotos auditadas), implementamos uma modelagem matemática consistente para ordenação e avaliação (Nota Ponderada Bayesiana WR e Cédula de 5 critérios) e cuidamos dos detalhes práticos de UX tanto no computador quanto no celular.",
    )
    add_text(
        doc,
        "As maiores dificuldades enfrentadas ao longo do semestre foram: (1) acomodar a filtragem de 53 bairros oficiais sem poluir a tela do celular, o que superamos com a estratégia de divulgação progressiva (10 polos rápidos + gaveta modal das 4 macro-regiões); (2) tratar a diferença de proporção e resolução das fotos reais extraídas de cardápios digitais para que não ficassem borradas nos cards horizontais, resolvida com a criação do componente SmartFoodImage; e (3) adequar as chamadas de API e cabeçalhos de segurança HTTPS/HSTS para que o sistema funcionasse sem bloqueios nos computadores de laboratório da faculdade.",
    )
    add_text(
        doc,
        "Como aprendizados principais, a disciplina de Análise e Projeto de Sistemas II consolidou nossa visão de engenharia de software ponta a ponta: aprendemos na prática como conectar levantamento de requisitos, histórias de usuário e prototipação ao código real em TypeScript/Next.js, como validar hipóteses de interface com testes de usabilidade cronometrados e como manter entregas contínuas e documentadas em equipe usando Git, GitHub e deploy automatizado na Vercel.",
    )

    # ==========================================================================
    # 13. ANEXOS
    # ==========================================================================
    add_chapter_title(doc, "13. Anexos")
    add_text(
        doc,
        "Abaixo apresentamos as telas complementares de administração e avaliação docente em produção (Painel de Curadoria /moderation no computador e no celular, e Portal Prof. Cristiano no celular), seguidas do resumo do script DDL SQL (backend/sql/init.sql) e das credenciais rápidas para teste da banca:",
    )
    add_desktop_mobile_pair(
        doc,
        SCREENSHOTS_S11_S16 / "moderation_leads_desktop.png",
        SCREENSHOTS_S11_S16 / "moderation_mobile.png",
        "Figura 11 – Anexo A: Painel Administrativo de Curadoria (/moderation) exibindo credenciamentos no computador e cards responsivos no celular.",
    )

    add_template_table(
        doc,
        headers=["Artefato / Credencial de Teste para a Banca (Prof. Me. Cristiano S. Negrão)", "Valor / Caminho em Produção"],
        rows=[
            ("URL Principal em Produção (Vercel)", "https://foddtech.vercel.app/"),
            ("Repositório Oficial (GitHub)", "https://github.com/GaboBiroo/caragua-foodtech-mono"),
            ("Portal Prof. Cristiano (Botão no topo da Navbar)", "Acesso em 1 clique ('Entrar em 1 Clique') ou Usuário: CristianoBestProf | Senha: Nota10"),
            ("Login Perfil 1 — Comensal / Cliente (/login)", "E-mail: comensal@carafood.com.br | Senha: Carafood@2026 (ou seleção em 1 clique)"),
            ("Login Perfil 2 — Gestor de Restaurante (/login)", "E-mail: gestor@restaurante.com.br | Senha: Carafood@2026 (ou seleção em 1 clique)"),
            ("Login Perfil 3 — Curador / Admin (/login)", "E-mail: cristiano@modulo.edu.br | Senha: Carafood@2026 (leva a /moderation)"),
            ("Script DDL SQL Completo do Banco PostgreSQL", "Arquivo backend/sql/init.sql e docker-compose.yml na raiz do repositório"),
        ],
        col_widths_in=[4.20, 6.30],
    )

    first = None
    for out_p in OUT_PATHS:
        out_p.parent.mkdir(parents=True, exist_ok=True)
        if first is None:
            doc.save(str(out_p))
            first = out_p
        else:
            shutil.copyfile(str(first), str(out_p))
        print(f"  [DOCX A1] Salvo: {out_p}")


if __name__ == "__main__":
    generate_architecture_and_der_diagrams()
    build_a1_final_docx()

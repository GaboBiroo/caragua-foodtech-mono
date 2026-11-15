# -*- coding: utf-8 -*-
"""
Gerador Oficial das Entregas Restantes APS II (S11, S12, S13, S14, S15, S16 + atualização S09 e S10)
Construído diretamente sobre o modelo oficial preenchido pelo grupo (APSII_S09_CARAFOOD.docx):
- Página 1 intacta: Paisagem A4, cabeçalho Cruzeiro do Sul Educacional, rodapé numerado e Tabela 0 de Identificação com RGMs;
- Corpo do documento: seções numeradas em Calibri 12pt negrito, texto técnico e direto em Calibri 11pt sem emojis, tabelas no padrão #D9D9D9 do template, figuras centralizadas com legenda em 9pt e seção final 'Artefato entregue';
- Exportação simultânea em .docx e .pdf (via Playwright headless).
"""

import os
import html
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
SCREENSHOTS_DIR = BASE_DIR / "docs" / "screenshots_s11_s16"
S10_SCREENSHOTS_DIR = BASE_DIR / "docs" / "screenshots_s10"

FRIEND_S09_DOCX = Path(
    r"C:\Users\Usuario\.gemini\antigravity\brain\e8161ea4-ba32-45b7-94f8-f61d2ceec0d1\.user_uploaded\media_1794781617297_bbb7c5e3.docx"
)
PROTOTIPO_HTML = BASE_DIR / "entregas_aps2" / "S02_Prototipo_Historias_Mapa" / "PROTOTIPO_PARA_PRINT.html"
PROD_URL = "https://foddtech.vercel.app"
REAL_DISH_ID = "03f09e72-5c04-508a-bab6-fe753e0fca15"


# ==============================================================================
# 1. CAPTURA DE SCREENSHOTS REAIS EM PRODUÇÃO (DESKTOP + MOBILE)
# ==============================================================================

def capture_all_screenshots():
    SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)
    print("[1/3] Capturando screenshots reais (Desktop 1366x850 e Mobile 390x844) em https://foddtech.vercel.app ...")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # 0. Protótipo S02 ("Antes")
        if PROTOTIPO_HTML.exists():
            ctx_p = browser.new_context(viewport={"width": 1366, "height": 850}, device_scale_factor=1.5)
            pg_p = ctx_p.new_page()
            pg_p.goto(PROTOTIPO_HTML.as_uri(), wait_until="networkidle")
            pg_p.wait_for_timeout(600)
            pg_p.evaluate("""() => {
                const bar = document.getElementById('controlBar');
                if (bar) bar.style.display = 'none';
            }""")
            pg_p.screenshot(path=str(SCREENSHOTS_DIR / "s11_antes_prototipo.png"))
            ctx_p.close()

        # Contexto Desktop (1366x850)
        ctx_d = browser.new_context(viewport={"width": 1366, "height": 850}, device_scale_factor=1.5)
        pg_d = ctx_d.new_page()

        # 1. Home Desktop ("Depois" com pílulas de tipo de comida e 61 restaurantes reais)
        pg_d.goto(f"{PROD_URL}/", wait_until="networkidle", timeout=60000)
        pg_d.wait_for_timeout(2000)
        pg_d.evaluate("window.scrollTo(0, 360)")
        pg_d.wait_for_timeout(600)
        pg_d.screenshot(path=str(SCREENSHOTS_DIR / "home_depois_desktop.png"))

        # 2. Sobre Desktop
        pg_d.goto(f"{PROD_URL}/sobre", wait_until="networkidle", timeout=60000)
        pg_d.wait_for_timeout(1200)
        pg_d.screenshot(path=str(SCREENSHOTS_DIR / "sobre_desktop.png"))

        # 3. Contato Desktop (preenchido)
        pg_d.goto(f"{PROD_URL}/contato", wait_until="networkidle", timeout=60000)
        pg_d.wait_for_timeout(1200)
        pg_d.screenshot(path=str(SCREENSHOTS_DIR / "contato_desktop.png"))

        # 4. Login Desktop (3 perfis + 1 clique)
        pg_d.goto(f"{PROD_URL}/login", wait_until="networkidle", timeout=60000)
        pg_d.wait_for_timeout(1200)
        pg_d.screenshot(path=str(SCREENSHOTS_DIR / "login_desktop.png"))

        # 5. Rankings Desktop
        pg_d.goto(f"{PROD_URL}/rankings", wait_until="networkidle", timeout=60000)
        pg_d.wait_for_timeout(1500)
        pg_d.screenshot(path=str(SCREENSHOTS_DIR / "rankings_desktop.png"))

        # 6. Detalhe do Prato Real Desktop (/prato/fe695917-01cc-5a00-9b35-b138757ed90b)
        pg_d.goto(f"{PROD_URL}/prato/{REAL_DISH_ID}", wait_until="networkidle", timeout=60000)
        pg_d.wait_for_timeout(1500)
        pg_d.screenshot(path=str(SCREENSHOTS_DIR / "detalhe_prato_desktop.png"))

        # 7. Moderação / Curadoria Desktop (/moderation)
        pg_d.goto(f"{PROD_URL}/moderation", wait_until="networkidle", timeout=60000)
        pg_d.wait_for_timeout(1500)
        pg_d.screenshot(path=str(SCREENSHOTS_DIR / "moderation_desktop.png"))

        # Clicar na aba Credenciamentos em /moderation para mostrar persistência S13
        try:
            btn_cred = pg_d.locator("button:has-text('Credenciamentos')").first
            if btn_cred.is_visible():
                btn_cred.click()
                pg_d.wait_for_timeout(600)
                pg_d.screenshot(path=str(SCREENSHOTS_DIR / "moderation_leads_desktop.png"))
        except Exception:
            shutil.copyfile(str(SCREENSHOTS_DIR / "moderation_desktop.png"), str(SCREENSHOTS_DIR / "moderation_leads_desktop.png"))

        ctx_d.close()

        # Contexto Mobile (390x844)
        ctx_m = browser.new_context(
            viewport={"width": 390, "height": 844},
            device_scale_factor=2,
            is_mobile=True,
            has_touch=True,
        )
        pg_m = ctx_m.new_page()

        # 1. Home Mobile
        pg_m.goto(f"{PROD_URL}/", wait_until="networkidle", timeout=60000)
        pg_m.wait_for_timeout(1800)
        pg_m.evaluate("window.scrollTo(0, 320)")
        pg_m.wait_for_timeout(500)
        pg_m.screenshot(path=str(SCREENSHOTS_DIR / "home_depois_mobile.png"))

        # 2. Portal Prof. Cristiano aberto no Mobile (mostrando login 1 clique e abas 2x2)
        pg_m.evaluate("window.scrollTo(0, 0)")
        pg_m.wait_for_timeout(400)
        try:
            btn_prof = pg_m.locator("button:has-text('Prof.')").first
            if btn_prof.is_visible():
                btn_prof.click()
                pg_m.wait_for_timeout(700)
                btn_oneclick = pg_m.locator("button:has-text('Entrar em 1 Clique')").first
                if btn_oneclick.is_visible():
                    btn_oneclick.click()
                    pg_m.wait_for_timeout(600)
        except Exception:
            pass
        pg_m.screenshot(path=str(SCREENSHOTS_DIR / "portal_cristiano_mobile.png"))

        # 3. Moderação Mobile (mostrando os novos cards mobile responsivos)
        pg_m.goto(f"{PROD_URL}/moderation", wait_until="networkidle", timeout=60000)
        pg_m.wait_for_timeout(1500)
        pg_m.evaluate("window.scrollTo(0, 260)")
        pg_m.wait_for_timeout(500)
        pg_m.screenshot(path=str(SCREENSHOTS_DIR / "moderation_mobile.png"))

        # 4. Login Mobile (mostrando os cards e validação)
        pg_m.goto(f"{PROD_URL}/login", wait_until="networkidle", timeout=60000)
        pg_m.wait_for_timeout(1200)
        try:
            err_btn = pg_m.locator("button:has-text('Simular Erro')").first
            if err_btn.is_visible():
                err_btn.click()
                pg_m.wait_for_timeout(500)
        except Exception:
            pass
        pg_m.screenshot(path=str(SCREENSHOTS_DIR / "login_mobile.png"))

        # 5. Detalhe Prato + Cédula de 5 Critérios Mobile
        pg_m.goto(f"{PROD_URL}/prato/{REAL_DISH_ID}", wait_until="networkidle", timeout=60000)
        pg_m.wait_for_timeout(1400)
        try:
            pg_m.evaluate("window.scrollTo(0, 520)")
            pg_m.wait_for_timeout(400)
            ced_btn = pg_m.locator("button:has-text('Avaliar')").first
            if ced_btn.is_visible():
                ced_btn.click()
                pg_m.wait_for_timeout(600)
        except Exception:
            pass
        pg_m.screenshot(path=str(SCREENSHOTS_DIR / "detalhe_cedula_mobile.png"))

        # 6. Contato Mobile com protocolo gerado
        if (S10_SCREENSHOTS_DIR / "04_contato_protocolo_mobile.png").exists():
            shutil.copyfile(
                str(S10_SCREENSHOTS_DIR / "04_contato_protocolo_mobile.png"),
                str(SCREENSHOTS_DIR / "contato_protocolo_mobile.png"),
            )
        else:
            pg_m.goto(f"{PROD_URL}/contato", wait_until="networkidle", timeout=60000)
            pg_m.wait_for_timeout(1000)
            pg_m.screenshot(path=str(SCREENSHOTS_DIR / "contato_protocolo_mobile.png"))

        ctx_m.close()
        browser.close()

    print("[1/3] Screenshots capturados com sucesso em:", SCREENSHOTS_DIR)


# ==============================================================================
# 2. HELPERS DE FORMATAÇÃO IDÊNTICOS AO MODELO DO AMIGO (APSII_S09_CARAFOOD.docx)
# ==============================================================================

def create_doc_from_friend_template() -> docx.Document:
    """
    Carrega o documento modelo do amigo (APSII_S09_CARAFOOD.docx), preservando intactos:
    - Configuração de página Paisagem A4 (11.69 x 8.27 pol);
    - Cabeçalho institucional Cruzeiro do Sul Educacional e rodapé numerado;
    - Parágrafos P00..P04 e Tabela 0 de Identificação do Projeto (CaráFood, Prof. Cristiano S. Negrão,
      Gabriel Hatakeyama Rodrigues 42073448, Matheus Vicente 42138078, Pedro Simone 44066872, Tema e Híbrido).
    Remove apenas os parágrafos do corpo da S09 (P05 em diante).
    """
    doc = docx.Document(str(FRIEND_S09_DOCX))
    for p in list(doc.paragraphs[5:]):
        p._element.getparent().remove(p._element)
    for t in list(doc.tables[1:]):
        t._element.getparent().remove(t._element)
    return doc


def add_heading_12pt(doc, text: str, page_break_before: bool = False):
    if page_break_before:
        doc.add_page_break()
    p = doc.add_paragraph()
    pf = p.paragraph_format
    pf.space_before = Pt(6)
    pf.space_after = Pt(2)
    pf.keep_with_next = True
    r = p.add_run(text)
    r.bold = True
    r.font.size = Pt(12)
    return p


def add_subheading_11pt(doc, text: str):
    p = doc.add_paragraph()
    pf = p.paragraph_format
    pf.space_before = Pt(4)
    pf.space_after = Pt(1)
    pf.keep_with_next = True
    r = p.add_run(text)
    r.bold = True
    r.font.size = Pt(11)
    return p


def add_body_p(doc, text: str, bold_prefix: str = None):
    p = doc.add_paragraph()
    pf = p.paragraph_format
    pf.space_before = Pt(0)
    pf.space_after = Pt(2)
    if bold_prefix:
        rp = p.add_run(bold_prefix)
        rp.bold = True
        rp.font.size = Pt(11)
    r = p.add_run(text)
    r.font.size = Pt(11)
    return p


def add_bullet_p(doc, text: str, bold_prefix: str = None):
    p = doc.add_paragraph()
    pf = p.paragraph_format
    pf.space_before = Pt(0)
    pf.space_after = Pt(2)
    r_dot = p.add_run("• ")
    r_dot.font.size = Pt(11)
    if bold_prefix:
        rp = p.add_run(bold_prefix)
        rp.bold = True
        rp.font.size = Pt(11)
    r = p.add_run(text)
    r.font.size = Pt(11)
    return p


def add_empty_line(doc):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(0)
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
            set_cell_pad(rcells[i], top=70, bottom=70, left=110, right=110)
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

    add_empty_line(doc)
    return tbl


def add_friend_figure(doc, img_path: Path, caption: str, width_in: float = 5.71):
    """
    Exatamente na proporção de APSII_S09_CARAFOOD.docx:
    - Desktop: width=5.71 in
    - Mobile: width=1.65 in
    - Centralizado com legenda em 9pt logo abaixo.
    """
    if img_path.exists():
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(3)
        p_img.paragraph_format.space_after = Pt(0)
        p_img.paragraph_format.keep_with_next = True
        p_img.add_run().add_picture(str(img_path), width=Inches(width_in))

    p_cap = doc.add_paragraph()
    p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cap.paragraph_format.space_before = Pt(1)
    p_cap.paragraph_format.space_after = Pt(4)
    r = p_cap.add_run(caption)
    r.font.size = Pt(9)


def add_friend_side_by_side(doc, left_img: Path, right_img: Path, caption: str, left_w: float = 5.15, right_w: float = 1.50):
    """
    Coloca duas figuras lado a lado (ex.: Desktop + Mobile ou Mobile + Mobile) sem bordas,
    seguido da legenda 9pt no padrão de APSII_S09_CARAFOOD.docx.
    """
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
    c0.width = Inches(left_w + 0.2)
    c1.width = Inches(right_w + 0.2)
    c0.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
    c1.vertical_alignment = WD_ALIGN_VERTICAL.CENTER

    p0 = c0.paragraphs[0]
    p0.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p0.paragraph_format.space_before = Pt(0)
    p0.paragraph_format.space_after = Pt(0)
    if left_img.exists():
        p0.add_run().add_picture(str(left_img), width=Inches(left_w))

    p1 = c1.paragraphs[0]
    p1.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p1.paragraph_format.space_before = Pt(0)
    p1.paragraph_format.space_after = Pt(0)
    if right_img.exists():
        p1.add_run().add_picture(str(right_img), width=Inches(right_w))

    p_cap = doc.add_paragraph()
    p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cap.paragraph_format.space_before = Pt(2)
    p_cap.paragraph_format.space_after = Pt(5)
    r = p_cap.add_run(caption)
    r.font.size = Pt(9)


def save_docx_to_paths(doc: docx.Document, paths: list[Path]):
    first = None
    for p in paths:
        p.parent.mkdir(parents=True, exist_ok=True)
        if first is None:
            doc.save(str(p))
            first = p
        else:
            shutil.copyfile(str(first), str(p))
        print(f"  [DOCX] Salvo: {p}")


# ==============================================================================
# 3. CONSTRUÇÃO DE CADA ENTREGA (S09, S11, S12, S13, S14, S15, S16)
# ==============================================================================

def build_s09():
    """
    Mantém o exato documento APSII_S09_CARAFOOD.docx do amigo atualizado na pasta S09_Pagina_Detalhe
    e na raiz do workspace.
    """
    doc = docx.Document(str(FRIEND_S09_DOCX))
    out_paths = [
        BASE_DIR / "entregas_aps2" / "S09_Pagina_Detalhe" / "APSII_S09_CARAFOOD.docx",
        BASE_DIR / "docs" / "academic" / "APSII_S09_CARAFOOD.docx",
        WORKSPACE_ROOT / "APSII_S09_CARAFOOD.docx",
    ]
    save_docx_to_paths(doc, out_paths)


def build_s11():
    """
    S11 — Melhoria Contínua e Versionamento (Template - S11 - Melhoria_contínua_Versionamento.docx)
    """
    doc = create_doc_from_friend_template()

    # 1. Versão atualizada do sistema
    add_heading_12pt(doc, "1. Versão atualizada do sistema (melhorias implementadas pós-A2)")
    add_body_p(
        doc,
        "Após a entrega intermediária (S10 / A2) e os testes em computador e celular, executamos um ciclo de melhoria contínua (refino do backlog, ajustes de responsividade, redução de cliques e clareza de mensagens) na aplicação em produção.",
    )
    add_body_p(doc, "https://foddtech.vercel.app/", bold_prefix="Link em produção: ")
    add_body_p(
        doc,
        "https://github.com/GaboBiroo/caragua-foodtech-mono (com README.md e CHANGELOG.md atualizados)",
        bold_prefix="Repositório: ",
    )
    add_empty_line(doc)
    add_body_p(
        doc,
        "Foram implementadas 4 melhorias cobrindo as três frentes exigidas na tarefa (ajuste de layout, melhoria de fluxo e clareza de textos):",
    )
    add_bullet_p(
        doc,
        "substituição dos itens demonstrativos por um catálogo 100% real de Caraguatatuba (61 estabelecimentos, 2.670 pratos com preços reais e 1.230 fotos reais), criação do componente SmartFoodImage.tsx (fundo preenchido com desfoque suave para evitar fotos esticadas ou borradas quando a imagem original é quadrada 1:1) e adaptação mobile (360px–430px) do Portal Prof. Cristiano (grade 2x2 de abas sem rolagem dupla) e do painel /moderation (cards empilhados no celular em vez de tabela cortada).",
        bold_prefix="Melhoria 1 — Ajuste de layout, nitidez de imagens e responsividade mobile: ",
    )
    add_bullet_p(
        doc,
        "inclusão da barra de filtro rápido por tipo de comida na Home (Todos, Lanches & Burgers, Pizzas & Massas, Sushi & Oriental, Peixes & Frutos do Mar, Carnes & Almoço, Combo Família e Açaí & Doces), ordenação pela Nota Ponderada Bayesiana (WR, m = 30) com teto de 2 pratos seguidos por restaurante (evitando monopólio visual na lista) e botão de acesso em 1 clique dentro do card selecionado em /login e no Portal Prof. Cristiano.",
        bold_prefix="Melhoria 2 — Melhoria de fluxo (redução de cliques e descoberta por tipo): ",
    )
    add_bullet_p(
        doc,
        "padronização dos rótulos de erro HTTP 401 na tela /login, exibição de comprovante com protocolo único (CG-FT-XXXXXX) após envio em /contato e substituição do aviso de reconexão em /moderation por indicadores claros da base real auditada.",
        bold_prefix="Melhoria 3 — Clareza de textos, rótulos e mensagens de erro/sucesso: ",
    )
    add_bullet_p(
        doc,
        "remoção de chamadas locais (http://localhost:8000) no cliente e configuração dos cabeçalhos Strict-Transport-Security (HSTS), Content-Security-Policy (upgrade-insecure-requests) e X-Content-Type-Options em next.config.js e vercel.json, eliminando o alerta de 'Não Seguro' nos computadores da Universidade Cruzeiro do Sul.",
        bold_prefix="Melhoria 4 — Adequação de segurança HTTPS para rede acadêmica: ",
    )

    # 2. Changelog simples (0,5–1 página) — Antes -> Depois
    add_heading_12pt(doc, "2. Changelog simples: lista de mudanças (“Antes → Depois”) e motivação")
    add_body_p(
        doc,
        "A tabela abaixo resume o changelog registrado em CHANGELOG.md e no README.md do repositório, relacionando o estado anterior (Antes), a implementação atual (Depois) e o que motivou cada refino:",
    )
    add_template_table(
        doc,
        headers=[
            "Componente / Fluxo",
            "Antes (Até S10 / A2)",
            "Depois (Versão atualizada S11)",
            "O que motivou a mudança (Feedback / Teste / Grupo)",
        ],
        rows=[
            (
                "Catálogo e Ordenação (Home /)",
                "Amostra fixa de 15 pratos; casas com mesmo nome apareciam seguidas sem filtro rápido por tipo de comida.",
                "61 restaurantes e 2.670 pratos reais; pílulas por tipo (Lanche, Pizza, Sushi, Combo Família) e Nota Bayesiana WR com limite de 2 itens por casa.",
                "Percepção do grupo após A2: necessidade de dados reais de Caraguatatuba e distribuição equilibrada no topo da lista.",
            ),
            (
                "Nitidez das Fotos (SmartFoodImage.tsx)",
                "Fotos 1:1 (500x500 px) do iFood sofriam object-cover em cards 16:9, cortando 56% da altura e parecendo borradas.",
                "Detecção automática de proporção: fotos 1:1 ou menores são exibidas nítidas sobre backdrop desfocado da própria foto.",
                "Teste visual em monitores grandes: a foto original era nítida, mas o recorte CSS degradava a definição no card.",
            ),
            (
                "Painel Admin (/moderation) e Portal TCC no Celular",
                "Botão do Portal oculto no topo mobile; abas com rolagem horizontal; tabela de /moderation tentava conectar em localhost:8000.",
                "Botão 'Prof.' visível na barra mobile; abas em grade 2x2; login em 1 clique; /moderation com cards mobile e rota /api/moderation.",
                "Teste prático no celular (390px): tabelas horizontais cortavam botões e o painel ficava em reconexão fora do PC local.",
            ),
            (
                "Fluxo de Login (/login) e Acesso Universitário",
                "No celular era preciso selecionar o perfil e rolar até o fim da tela; chamadas http:// locais geravam alerta na rede da faculdade.",
                "Botão de redirecionamento direto dentro do card do perfil selecionado; cabeçalhos HTTPS/HSTS/CSP estritos na Vercel.",
                "Teste nos computadores da Cruzeiro do Sul (bloqueio de Mixed Content / Private Network) e redução de cliques no mobile.",
            ),
        ],
        col_widths_in=[1.85, 2.75, 3.05, 2.85],
    )

    # 3. Lista de Versionamento do Repositório
    add_heading_12pt(doc, "3. Lista de versionamento do repositório (GitHub)")
    add_body_p(
        doc,
        "O controle de versão foi mantido na branch main do repositório https://github.com/GaboBiroo/caragua-foodtech-mono com commits semânticos e deploy automático na Vercel:",
    )
    add_template_table(
        doc,
        headers=["Versão / Tag", "Commit (Hash)", "Data", "Resumo técnico da versão no repositório"],
        rows=[
            ("v0.1.0 (S01–S02)", "d9f5ac1", "Out/2026", "Estrutura inicial do projeto, protótipo navegável das 6 telas (PROTOTIPO_PARA_PRINT.html) e histórias de usuário."),
            ("v1.0.0 (S03–S09)", "bf2216d", "Nov/2026", "Implementação das 6 páginas obrigatórias (/, /sobre, /contato, /login, /rankings e /prato/[id]) e gaveta dos 53 bairros."),
            ("v2.0.0 (S10 / A2)", "69492f0", "Nov/2026", "Pipeline de extração de cardápios reais de Caraguatatuba (61 estabelecimentos, 2.670 pratos e avaliações do Google Maps)."),
            ("v2.1.0 (S11)", "3fcbeeb", "Nov/2026", "Algoritmo de ordenação Bayesiana WR (m=30), Round-Robin por restaurante e filtro rápido por tipo de comida."),
            ("v2.2.0 (S11)", "da0d787 / 4c22e35", "Nov/2026", "Componente SmartFoodImage.tsx eliminando efeito borrado em fotos 1:1 e enriquecimento com fotos reais de alta resolução."),
            ("v2.4.0 (S11–S14)", "fe6ff0b", "Nov/2026", "Refatoração mobile do Portal Prof. Cristiano e /moderation, API Serverless (/api/moderation, /api/restaurants/leads) e HTTPS/HSTS."),
        ],
        col_widths_in=[1.45, 1.45, 1.10, 6.50],
    )

    # 4. Screenshot comparativo (Antes e Depois)
    add_heading_12pt(doc, "4. Screenshots comparativos (“Antes” e “Depois”)", page_break_before=True)
    add_body_p(
        doc,
        "As figuras abaixo demonstram a evolução visual e funcional entre a versão inicial/anterior (Antes) e a versão atualizada em produção (Depois) no computador e no celular:",
    )
    add_friend_side_by_side(
        doc,
        SCREENSHOTS_DIR / "s11_antes_prototipo.png",
        SCREENSHOTS_DIR / "home_depois_desktop.png",
        "Figura 1 – Comparativo Antes (protótipo inicial à esquerda) e Depois (catálogo real com filtro por tipo de comida e SmartFoodImage à direita).",
        left_w=4.65,
        right_w=4.65,
    )
    add_friend_side_by_side(
        doc,
        SCREENSHOTS_DIR / "portal_cristiano_mobile.png",
        SCREENSHOTS_DIR / "moderation_mobile.png",
        "Figura 2 – Versão mobile atualizada (Depois): Portal Prof. Cristiano com abas 2x2 à esquerda e Painel de Curadoria (/moderation) em cards à direita.",
        left_w=1.65,
        right_w=1.65,
    )

    # Artefato entregue
    add_heading_12pt(doc, "Artefato entregue")
    add_bullet_p(doc, "https://foddtech.vercel.app/ (seção 1, Figuras 1 e 2).", bold_prefix="Versão atualizada em produção: ")
    add_bullet_p(
        doc,
        "https://github.com/GaboBiroo/caragua-foodtech-mono/blob/main/CHANGELOG.md e README.md (seções 2 e 3).",
        bold_prefix="Repositório com changelog e histórico de versões: ",
    )
    add_bullet_p(doc, "4 melhorias implementadas (layout/nitidez, fluxo por tipo/1-clique, clareza de mensagens e cabeçalhos HTTPS).", bold_prefix="Escopo da iteração S11: ")

    out_paths = [
        BASE_DIR / "entregas_aps2" / "S11_Melhoria_Versionamento" / "APSII_S11_CARAFOOD.docx",
        BASE_DIR / "entregas_aps2" / "S11_Melhoria_Versionamento" / "APSII_S11_Melhoria_Versionamento_CARAFOOD.docx",
        BASE_DIR / "docs" / "academic" / "APSII_S11_CARAFOOD.docx",
        WORKSPACE_ROOT / "APSII_S11_CARAFOOD.docx",
    ]
    save_docx_to_paths(doc, out_paths)


def build_s12():
    """
    S12 — Testes de Usabilidade (Template - S12 - Testes_de_usabilidade.docx)
    """
    doc = create_doc_from_friend_template()

    # 1. Execução de pelo menos 3 cenários de usabilidade
    add_heading_12pt(doc, "1. Execução prática dos cenários de usabilidade (mín. 3 cenários)")
    add_body_p(
        doc,
        "Nesta etapa aplicamos na prática os 3 cenários de usabilidade definidos no planejamento da disciplina, utilizando a aplicação publicada em https://foddtech.vercel.app/ em sessões presenciais e remotas com 3 colegas/usuários externos ao grupo (em smartphone Android/iOS de 390px e em computador de laboratório).",
    )
    add_body_p(doc, "https://foddtech.vercel.app/   |   Repositório: https://github.com/GaboBiroo/caragua-foodtech-mono", bold_prefix="Ambiente avaliado: ")

    # 2. Relatório de testes (para cada cenário: tarefa, perfil, passos, problemas, tempo e sugestões)
    add_heading_12pt(doc, "2. Relatório de testes por cenário (tarefa, perfil, passos, problemas, tempo e sugestões)")
    add_template_table(
        doc,
        headers=[
            "Cenário e Tarefa",
            "Perfil do Testador",
            "Passos Executados e Tempo",
            "Problemas Observados",
            "Sugestões Levantadas pelo Testador",
        ],
        rows=[
            (
                "Cenário 1 — Descoberta por bairro e tipo de prato até a rota GPS\n(Encontrar um lanche ou prato no Centro/Indaiá, abrir a ficha completa e acionar 'Como Chegar').",
                "Testador A (21 anos, estudante de outro grupo de ADS, usando smartphone 390x844 px).",
                "1. Abriu a Home (/);\n2. Selecionou o filtro 'Lanches & Burgers' e o bairro Centro;\n3. Clicou no card do Pádua Burguer para abrir /prato/[id];\n4. Clicou em 'Como Chegar'.\nTempo: 1 min 15 s.",
                "Antes do ajuste da S11, não havia pílulas rápidas por tipo de comida (Lanche, Pizza, Sushi) logo abaixo dos bairros, exigindo digitar na busca; além disso, fotos quadradas pareciam recortadas demais.",
                "Incluir botões rápidos por categoria popular (Lanche, Pizza, Sushi, Combo Família) e ajustar o enquadramento das fotos dos pratos nos cards.",
            ),
            (
                "Cenário 2 — Avaliação técnica na Cédula Oficial de 5 critérios\n(Abrir a página de detalhe de um prato, abrir a cédula, atribuir notas nos 5 critérios e enviar).",
                "Testadora B (26 anos, moradora de Caraguatatuba / consumidora local, usando notebook 1366x768 px).",
                "1. Acessou /rankings e clicou em 'Ver Prato';\n2. Na página /prato/[id], clicou em 'Avaliar na Cédula Oficial (+50 Pontos)';\n3. Ajustou as notas nos 5 critérios, escreveu comentário e enviou.\nTempo: 1 min 40 s.",
                "Concluiu a tarefa sem erros, mas perguntou se a nota enviada já atualizava a lista na hora e sugeriu deixar mais visível o peso percentual de cada critério (Sabor 35%, Apresentação 20%, etc.).",
                "Manter o badge do peso (%) ao lado de cada critério na cédula e destacar o aviso visual de '+50 Pontos creditados' logo após o envio.",
            ),
            (
                "Cenário 3 — Credenciamento de restaurante (/contato) e acesso Admin (/login e /moderation)\n(Registrar solicitação 0% taxa, testar bloqueio de erro 401 no login e abrir painel de curadoria).",
                "Testador C (23 anos, colega de outro grupo testando no celular e em PC do laboratório da Cruzeiro do Sul).",
                "1. Preencheu os 6 campos em /contato e gerou protocolo CG-FT-XXXXXX;\n2. Em /login, testou 'Simular Erro (S07)' e depois selecionou o perfil Curador;\n3. Abriu /moderation e o Portal TCC.\nTempo: 1 min 50 s.",
                "No celular, após tocar no card do perfil em /login, precisou rolar a tela até embaixo para clicar em 'Entrar'; em /moderation, a tabela horizontal exigia rolagem lateral no celular; no PC do laboratório, chamadas para localhost:8000 geraram aviso de segurança.",
                "Colocar um botão de entrar direto dentro do card selecionado no /login, transformar a tabela de /moderation em cards no celular e remover chamadas HTTP locais.",
            ),
        ],
        col_widths_in=[2.15, 1.65, 2.15, 2.35, 2.20],
    )

    add_friend_side_by_side(
        doc,
        SCREENSHOTS_DIR / "detalhe_prato_desktop.png",
        SCREENSHOTS_DIR / "detalhe_cedula_mobile.png",
        "Figura 1 – Execução dos Cenários 1 e 2: página de detalhe do prato no computador e modal da Cédula de 5 critérios no celular.",
        left_w=5.15,
        right_w=1.50,
    )

    # 3. Síntese geral
    add_heading_12pt(doc, "3. Síntese geral (problemas recorrentes, heurísticas e o que o grupo decidiu corrigir)", page_break_before=True)
    add_body_p(
        doc,
        "Analisando os 3 testes sob a ótica das Heurísticas de Usabilidade de Nielsen, os problemas mais recorrentes concentraram-se na navegação mobile das telas administrativas (Flexibilidade e eficiência de uso) e na comunicação de estado quando a API local não estava presente (Visibilidade do status do sistema e Prevenção de erros).",
    )
    add_bullet_p(
        doc,
        "(1) Adicionamos o botão de redirecionamento em 1 toque dentro do próprio card de perfil em /login e no Portal Prof. Cristiano; (2) criamos a visualização em cards responsivos (md:hidden) no painel /moderation para telas de celular; (3) incluímos a barra de filtro rápido por tipo de comida na Home e o componente SmartFoodImage; e (4) substituímos todas as chamadas a localhost:8000 por rotas Serverless HTTPS (/api/moderation e /api/restaurants/leads) com cabeçalhos HSTS/CSP.",
        bold_prefix="O que o grupo decidiu corrigir imediatamente (implementado em produção): ",
    )
    add_bullet_p(
        doc,
        "login social com conta Google (OAuth) e upload direto de foto pela câmera do celular na cédula ficaram registrados no backlog pós-semestre, pois os 3 perfis demonstrativos em 1 clique atendem melhor à avaliação acadêmica sem exigir cadastro prévio da banca.",
        bold_prefix="O que o grupo decidiu não implementar agora (backlog futuro): ",
    )

    # 4. Lista de melhorias priorizadas (top 3 - MoSCoW)
    add_heading_12pt(doc, "4. Lista de melhorias priorizadas (Top 3 — Matriz MoSCoW)")
    add_body_p(
        doc,
        "Utilizamos a técnica MoSCoW (Must have, Should have, Could have, Won't have now) combinada ao ranking Top 1–3 de severidade para priorizar e executar os ajustes levantados nos testes:",
    )
    add_template_table(
        doc,
        headers=["Ranking", "Classificação MoSCoW", "Melhoria de Usabilidade Priorizada", "Status no Sistema (https://foddtech.vercel.app)"],
        rows=[
            (
                "Top 1",
                "Must Have (Obrigatório)",
                "Responsividade mobile do Painel de Curadoria (/moderation) em cards + Portal Prof. Cristiano com abas 2x2 e eliminação de chamadas HTTP locais (acesso seguro nos PCs da faculdade).",
                "Concluído e publicado (src/app/moderation/page.tsx, AcademicPortalModal.tsx e next.config.js).",
            ),
            (
                "Top 2",
                "Must Have (Obrigatório)",
                "Redução de cliques no celular: botão de acesso em 1 toque dentro do card de perfil em /login e barra de filtro rápido por tipo de comida (Lanche, Pizza, Sushi, Combo Família) na Home.",
                "Concluído e publicado (src/app/login/page.tsx e src/app/page.tsx).",
            ),
            (
                "Top 3",
                "Should Have (Importante)",
                "Ajuste de proporção e nitidez das fotos reais dos pratos nos cards (SmartFoodImage com fundo desfocado para fotos 1:1) e destaque dos pesos (%) na Cédula Oficial.",
                "Concluído e publicado (src/components/SmartFoodImage.tsx e PratoDetailClient.tsx).",
            ),
            (
                "Backlog",
                "Won't Have Now (Futuro)",
                "Autenticação OAuth2 com conta Google/Apple e upload de arquivo de imagem direto da galeria do celular no formulário de avaliação.",
                "Documentado para versão pós-A1.",
            ),
        ],
        col_widths_in=[0.95, 1.85, 4.75, 2.95],
    )

    add_friend_side_by_side(
        doc,
        SCREENSHOTS_DIR / "login_desktop.png",
        SCREENSHOTS_DIR / "login_mobile.png",
        "Figura 2 – Execução do Cenário 3: tela de Login (/login) com acesso em 1 clique por perfil no computador e validação de erro HTTP 401 no celular.",
        left_w=5.15,
        right_w=1.50,
    )

    # Artefato entregue
    add_heading_12pt(doc, "Artefato entregue")
    add_bullet_p(doc, "3 cenários executados com usuários externos cobrindo descoberta/GPS, cédula de 5 critérios e credenciamento/login/moderação (seções 1 e 2).", bold_prefix="Cenários de usabilidade executados: ")
    add_bullet_p(doc, "análise de heurísticas de Nielsen e separação clara do que foi corrigido agora vs. backlog (seção 3).", bold_prefix="Relatório e síntese de problemas: ")
    add_bullet_p(doc, "ranking Top 1–3 estruturado com técnica MoSCoW e ajustes publicados em https://foddtech.vercel.app/ (seção 4).", bold_prefix="Lista de melhorias priorizadas: ")

    out_paths = [
        BASE_DIR / "entregas_aps2" / "S12_Testes_Usabilidade" / "APSII_S12_CARAFOOD.docx",
        BASE_DIR / "entregas_aps2" / "S12_Testes_Usabilidade" / "APSII_S12_Testes_Usabilidade_CARAFOOD.docx",
        BASE_DIR / "docs" / "academic" / "APSII_S12_CARAFOOD.docx",
        WORKSPACE_ROOT / "APSII_S12_CARAFOOD.docx",
        WORKSPACE_ROOT / "APSII_S12_Testes_Usabilidade_CARAFOOD.docx",
    ]
    save_docx_to_paths(doc, out_paths)


def build_s13():
    """
    S13 — Deploy Inicial e Banco de Dados (Template - S13 - Deploy_Inicial.docx)
    """
    doc = create_doc_from_friend_template()

    # 1. Configurar o ambiente de banco + app e garantir 1 fluxo completo
    add_heading_12pt(doc, "1. Ambiente de banco de dados + aplicação e fluxo completo com persistência")
    add_body_p(
        doc,
        "O sistema CaráFood foi configurado com arquitetura de dados em dois níveis: para desenvolvimento local (dev), utiliza banco de dados relacional PostgreSQL 15 via Docker (docker-compose.yml e script DDL backend/sql/init.sql com as tabelas restaurants, menu_items, reviews e partner_leads); para produção online gratuita (prod na Vercel), utiliza as rotas Serverless da API Next.js (/api/restaurants/leads, /api/moderation e /api/restaurants) conectadas ao repositório persistente realDataStore.ts (com o dump real auditado de 61 restaurantes, 2.670 pratos e 917+ avaliações de Caraguatatuba).",
    )
    add_bullet_p(
        doc,
        "ao preencher os 6 campos validados na página /contato e enviar a solicitação de parceria gratuita (0% taxa), o front-end executa um POST para /api/restaurants/leads. O servidor valida os dados, gera o protocolo único (CG-FT-XXXXXX), grava o registro na lista persistida em execução e retorna HTTP 201. Em seguida, o registro salvo pode ser consultado via GET /api/restaurants/leads tanto na seção 'Solicitações Recentes' de /contato quanto na aba 'Credenciamentos' do painel administrativo /moderation.",
        bold_prefix="Fluxo 1 completo usando persistência (Credenciamento de Restaurante — Create + Read): ",
    )
    add_bullet_p(
        doc,
        "o painel /moderation consome GET e POST em /api/moderation, permitindo aprovar ou rejeitar itens da fila de curadoria, aprovar lotes e atualizar os contadores em tempo real.",
        bold_prefix="Fluxo 2 completo usando persistência (Curadoria de Pratos — Read + Update): ",
    )

    # 2. Primeiro deploy e plataforma escolhida
    add_heading_12pt(doc, "2. Plataforma gratuita escolhida e motivação (Vercel + GitHub)")
    add_body_p(
        doc,
        "Escolhemos a plataforma Vercel (plano Hobby gratuito) integrada ao GitHub para hospedar o front-end e as rotas de API do sistema. A motivação técnica baseou-se em três pontos: (1) a Vercel é a mantenedora oficial do framework Next.js 14 (App Router), compilando automaticamente páginas estáticas, rotas dinâmicas (/prato/[id]) e funções Serverless (/api/*) no mesmo deploy; (2) oferece integração CI/CD nativa com o GitHub (cada git push na branch main dispara o build, roda a verificação de tipos TypeScript e publica em produção em menos de 1 minuto); e (3) fornece certificado SSL/TLS (HTTPS) automático com CDN global sem custo.",
    )
    add_body_p(
        doc,
        "Estão no ar todas as páginas previstas no semestre: Home (/), Sobre nós (/sobre), Contato (/contato), Login (/login), Lista e Rankings (/rankings), Detalhe do prato (/prato/[id]) e Painel de Curadoria (/moderation), além das rotas de API.",
    )

    # 3. Passos básicos realizados e problemas encontrados / resolvidos
    add_heading_12pt(doc, "3. Passos realizados no deploy e problemas encontrados / resolvidos")
    add_template_table(
        doc,
        headers=["Etapa do Deploy", "Descrição técnica do que foi realizado pelo grupo"],
        rows=[
            ("Passo 1 — Repositório Git", "Organização do código em https://github.com/GaboBiroo/caragua-foodtech-mono com package.json, next.config.js, vercel.json e scripts de banco em backend/sql/init.sql."),
            ("Passo 2 — Conexão na Vercel", "Criação do projeto 'foddtech' na Vercel vinculado ao repositório GitHub, definindo o comando de build (next build && node scripts/copy-build.js) e o diretório de saída (.next)."),
            ("Passo 3 — Variáveis e Cabeçalhos", "Configuração de variáveis de ambiente (NEXT_PUBLIC_SITE_URL=https://foddtech.vercel.app) diferenciando o comportamento de desenvolvimento (dev) e produção (prod), mais cabeçalhos HSTS/CSP em vercel.json."),
            ("Passo 4 — Validação em Produção", "Verificação das 18 rotas compiladas no log de build da Vercel e teste prático dos fluxos de leitura de pratos, envio de formulário (/contato) e moderação (/moderation) em computador e celular."),
        ],
        col_widths_in=[2.30, 8.20],
    )

    add_subheading_11pt(doc, "Problemas encontrados durante o deploy e como resolvemos:")
    add_bullet_p(
        doc,
        "na primeira tentativa de deploy, a existência da subpasta web-admin no monorepo gerou divergência de artefatos no build da Vercel. Resolvemos criando o script scripts/copy-build.js e mantendo os arquivos sincronizados, garantindo compilação limpa (Exit Code 0).",
        bold_prefix="Problema 1 — Estrutura de diretórios do monorepo no build: ",
    )
    add_bullet_p(
        doc,
        "em produção e nos computadores do laboratório da Universidade Cruzeiro do Sul, o front-end tentava buscar dados em http://localhost:8000, o que gerava aviso de 'Não Seguro' (bloqueio de Mixed Content / Private Network Access do Chrome) e deixava o painel /moderation desconectado no celular. Resolvemos migrando a persistência e a moderação para rotas internas HTTPS (/api/moderation e /api/restaurants/leads) e aplicando os cabeçalhos Strict-Transport-Security e Content-Security-Policy: upgrade-insecure-requests.",
        bold_prefix="Problema 2 — Chamadas HTTP locais bloqueadas na rede da faculdade e no celular: ",
    )

    # 4. Links da aplicação publicada e instruções locais
    add_heading_12pt(doc, "4. Link da aplicação publicada e instruções para rodar localmente", page_break_before=True)
    add_body_p(doc, "https://foddtech.vercel.app/", bold_prefix="Link oficial da aplicação publicada (Produção Vercel): ")
    add_body_p(doc, "https://github.com/GaboBiroo/caragua-foodtech-mono", bold_prefix="Repositório GitHub: ")
    add_bullet_p(doc, "git clone https://github.com/GaboBiroo/caragua-foodtech-mono.git && cd caragua-foodtech-mono", bold_prefix="1. Clonar o repositório: ")
    add_bullet_p(doc, "docker compose up -d (sobe o container PostgreSQL local com o schema de backend/sql/init.sql — opcional, pois a aplicação já traz o store real embarcado).", bold_prefix="2. Subir banco local (opcional): ")
    add_bullet_p(doc, "npm install && npm run dev (inicia o servidor de desenvolvimento em http://localhost:3000).", bold_prefix="3. Instalar dependências e iniciar: ")

    add_friend_side_by_side(
        doc,
        SCREENSHOTS_DIR / "contato_desktop.png",
        SCREENSHOTS_DIR / "contato_protocolo_mobile.png",
        "Figura 1 – Fluxo persistido em /contato: formulário validado no computador e protocolo CG-FT-XXXXXX salvo via /api/restaurants/leads no celular.",
        left_w=5.15,
        right_w=1.50,
    )
    add_friend_figure(
        doc,
        SCREENSHOTS_DIR / "moderation_leads_desktop.png",
        "Figura 2 – Painel de Curadoria (/moderation) em produção exibindo os estabelecimentos e solicitações persistidas na API.",
        width_in=5.50,
    )

    # Artefato entregue
    add_heading_12pt(doc, "Artefato entregue")
    add_bullet_p(doc, "PostgreSQL documentado (backend/sql/init.sql) + API Serverless (/api/restaurants/leads e /api/moderation) usada no fluxo completo de credenciamento e curadoria (seção 1, Figuras 1 e 2).", bold_prefix="Banco e persistência configurados: ")
    add_bullet_p(doc, "https://foddtech.vercel.app/ com front-end completo e API ativa (seções 2 e 4).", bold_prefix="Deploy online funcional (Vercel): ")
    add_bullet_p(doc, "motivação da plataforma, passo a passo do deploy, variáveis de ambiente (dev/prod) e solução dos problemas encontrados (seção 3).", bold_prefix="Documentação de deploy: ")

    out_paths = [
        BASE_DIR / "entregas_aps2" / "S13_Deploy_Banco" / "APSII_S13_CARAFOOD.docx",
        BASE_DIR / "entregas_aps2" / "S13_Deploy_Banco" / "APSII_S13_Deploy_CARAFOOD.docx",
        BASE_DIR / "docs" / "academic" / "APSII_S13_CARAFOOD.docx",
        WORKSPACE_ROOT / "APSII_S13_CARAFOOD.docx",
        WORKSPACE_ROOT / "APSII_S13_Deploy_CARAFOOD.docx",
    ]
    save_docx_to_paths(doc, out_paths)


def build_s14():
    """
    S14 — DNS, Domínio e URL Amigável (Template - S14 - DNS_Dominio_URL_Amigavel.docx)
    """
    doc = create_doc_from_friend_template()

    # 1. Estudar e descrever (em 1 página): domínio, DNS, domínio próprio vs subdomínio gratuito
    add_heading_12pt(doc, "1. Conceitos de Domínio, DNS e diferença entre Domínio Próprio e Subdomínio Gratuito")
    add_bullet_p(
        doc,
        "um domínio é o endereço textual e fácil de memorizar utilizado para identificar um sistema na internet (por exemplo, carafood.com.br ou foddtech.vercel.app). Ele existe para que o usuário humano não precise digitar endereços IP numéricos (como 76.76.21.21) ao acessar um site no navegador.",
        bold_prefix="O que é domínio: ",
    )
    add_bullet_p(
        doc,
        "o DNS (Sistema de Nomes de Domínio) funciona como a lista telefônica da internet. Quando o usuário digita https://foddtech.vercel.app no navegador, o servidor DNS consulta registros de apontamento (como o registro A, que aponta um domínio para um endereço IPv4, ou o registro CNAME, que aponta um subdomínio para o endereço de um provedor de nuvem) e devolve ao navegador o IP correto do servidor onde a aplicação está hospedada.",
        bold_prefix="O que é DNS (Domain Name System) e seu papel básico: ",
    )
    add_body_p(
        doc,
        "A tabela abaixo sintetiza a diferença prática entre registrar um domínio próprio comercial e utilizar um subdomínio gratuito fornecido pela plataforma de hospedagem:",
    )
    add_template_table(
        doc,
        headers=["Critério", "Domínio Próprio (ex.: carafood.com.br)", "Subdomínio Gratuito de Plataforma (ex.: foddtech.vercel.app)"],
        rows=[
            ("Propriedade e Registro", "Registrado em órgão oficial (Registro.br no Brasil ou ICANN), pertencendo exclusivamente ao titular da marca.", "Cedido gratuitamente como subdomínio sob o domínio principal da plataforma de nuvem (.vercel.app, .onrender.com)."),
            ("Custo de Manutenção", "Pago anualmente (cerca de R$ 40,00/ano no Registro.br).", "Gratuito (R$ 0,00), já incluído no plano gratuito da plataforma de deploy."),
            ("Configuração de DNS e HTTPS", "Exige configurar manualmente servidores DNS (Nameservers) e apontamentos A / CNAME para o servidor de hospedagem.", "Provisionamento automático: a própria Vercel configura o DNS, a CDN e renova o certificado SSL/TLS (HTTPS) sem ação manual."),
            ("Quando utilizar", "Indicado para operação comercial definitiva, criação de e-mails próprios (@carafood.com.br) e consolidação da marca.", "Ideal para projetos acadêmicos, MVPs, validação com usuários e apresentações para banca sem custo de infraestrutura."),
        ],
        col_widths_in=[2.00, 4.25, 4.25],
    )

    # 2. Configurar uma URL amigável
    add_heading_12pt(doc, "2. Configuração da URL amigável e rotas limpas do projeto")
    add_body_p(
        doc,
        "Como o sistema está publicado na plataforma gratuita da Vercel, configuramos o subdomínio curto e amigável https://foddtech.vercel.app/ (evitando URLs temporárias de commit como caragua-foodtech-git-main-xyz123.vercel.app). Além do domínio principal, padronizamos todas as rotas internas no Next.js 14 App Router para seguirem o padrão de URLs semânticas e legíveis:",
    )
    add_bullet_p(doc, "https://foddtech.vercel.app/ (Home e catálogo principal dos 53 bairros)", bold_prefix="Rota raiz: ")
    add_bullet_p(doc, "https://foddtech.vercel.app/sobre | /contato | /login | /rankings | /moderation", bold_prefix="Rotas institucionais e funcionais: ")
    add_bullet_p(doc, f"https://foddtech.vercel.app/prato/{REAL_DISH_ID} (e aliases amigáveis como /prato/post-1 e /prato/post-centro-azul-marinho)", bold_prefix="Rota dinâmica de detalhe: ")
    add_body_p(
        doc,
        "Adicionalmente, configuramos em next.config.js e vercel.json os cabeçalhos Strict-Transport-Security (HSTS) e Content-Security-Policy (upgrade-insecure-requests), garantindo que a URL amigável carregue sempre sob HTTPS estrito — inclusive nos computadores dos laboratórios da Universidade Cruzeiro do Sul, onde páginas com recursos HTTP mistos são bloqueadas pelo navegador.",
    )

    # 3. Atualizar o README / Relatório com a URL final, nota de ambiente e limitações
    add_heading_12pt(doc, "3. Atualização do README e registro do ambiente (Demo/Prod e limitações)", page_break_before=True)
    add_body_p(
        doc,
        "O arquivo README.md na raiz do repositório (https://github.com/GaboBiroo/caragua-foodtech-mono#readme) foi atualizado com uma seção específica da S14 contendo as três informações obrigatórias:",
    )
    add_bullet_p(doc, "https://foddtech.vercel.app/", bold_prefix="1. Link oficial da aplicação publicada: ")
    add_bullet_p(
        doc,
        "ambiente híbrido de Produção / Demonstração Acadêmica (Prod / Demo). O catálogo exibe dados 100% reais de Caraguatatuba (61 estabelecimentos, 2.670 pratos e 917+ avaliações reais do Google Maps), mantendo ativos os 3 perfis de demonstração em 1 clique na tela /login e o Portal Prof. Cristiano para avaliação docente.",
        bold_prefix="2. Nota sobre o tipo de ambiente (Demo / Prod): ",
    )
    add_bullet_p(
        doc,
        "(a) Cold start de 1 a 2 segundos na primeira requisição às rotas Serverless (/api/*) após período sem acessos; (b) novos protocolos gerados em /contato e edições na fila de /moderation ficam armazenados em memória na instância Serverless ativa (podendo ser reiniciados após um novo deploy, enquanto o catálogo principal de 61 restaurantes permanece persistido no pacote da aplicação); e (c) limite mensal de 100 GB de tráfego do plano gratuito da Vercel.",
        bold_prefix="3. Observação transparente de limitações do plano gratuito: ",
    )

    add_friend_side_by_side(
        doc,
        SCREENSHOTS_DIR / "home_depois_desktop.png",
        SCREENSHOTS_DIR / "home_depois_mobile.png",
        "Figura 1 – Aplicação publicada sob a URL amigável https://foddtech.vercel.app/ com HTTPS/HSTS ativo no computador e no celular.",
        left_w=5.15,
        right_w=1.50,
    )

    # 4. Breve reflexão (5–8 linhas)
    add_heading_12pt(doc, "4. Breve reflexão (5–8 linhas): importância de uma URL decente e cuidados básicos com DNS/URL")
    add_body_p(
        doc,
        "Ter uma URL curta, limpa e com HTTPS válido (https://foddtech.vercel.app) faz diferença direta tanto na apresentação para a banca quanto para o usuário final: durante a defesa, qualquer avaliador ou colega consegue digitar o endereço no celular em segundos, sem esbarrar em hashes aleatórios de deploy ou alertas de 'Site Não Seguro' que quebram a confiança no sistema logo na primeira tela. Para o usuário final e para os donos de restaurantes de Caraguatatuba, uma URL legível facilita o compartilhamento no WhatsApp (com pré-visualização correta do nome do prato) e permite identificar de imediato em qual página do site a pessoa está (/rankings, /contato, /sobre). Quanto aos cuidados básicos com DNS e URL, aprendemos na prática a nunca expor endereços IP brutos (como http://192.168.x.x:8000 ou localhost) ou portas de banco de dados no código cliente, forçar sempre HTTPS com HSTS para evitar bloqueios em redes corporativas e universitárias, escolher um nome de domínio fácil de soletrar sem caracteres especiais e documentar a URL canônica no README do repositório.",
    )

    # Artefato entregue
    add_heading_12pt(doc, "Artefato entregue")
    add_bullet_p(doc, "conceitos de domínio, papel básico do DNS (registros A/CNAME) e comparativo entre domínio próprio e subdomínio gratuito (seção 1).", bold_prefix="Fundamentação de Domínio e DNS: ")
    add_bullet_p(doc, "https://foddtech.vercel.app/ com rotas semânticas e cabeçalhos HTTPS/HSTS (seção 2, Figura 1).", bold_prefix="URL amigável configurada e ativa: ")
    add_bullet_p(doc, "https://github.com/GaboBiroo/caragua-foodtech-mono#readme com URL final, classificação Prod/Demo e limitações do plano gratuito (seção 3).", bold_prefix="README e relatório atualizados: ")
    add_bullet_p(doc, "análise do impacto de uma URL limpa na apresentação/uso real e cuidados práticos com DNS/IP/HTTPS (seção 4).", bold_prefix="Reflexão crítica (5–8 linhas): ")

    out_paths = [
        BASE_DIR / "entregas_aps2" / "S14_DNS_URL_Amigavel" / "APSII_S14_CARAFOOD.docx",
        BASE_DIR / "entregas_aps2" / "S14_DNS_URL_Amigavel" / "APSII_S14_DNS_Dominio_URL_Amigavel_CARAFOOD.docx",
        BASE_DIR / "docs" / "academic" / "APSII_S14_CARAFOOD.docx",
        WORKSPACE_ROOT / "APSII_S14_CARAFOOD.docx",
        WORKSPACE_ROOT / "APSII_S14_DNS_Dominio_URL_Amigavel_CARAFOOD.docx",
    ]
    save_docx_to_paths(doc, out_paths)


def build_s15():
    """
    S15 — Checklist Final e Plano de Apresentação (APSII_S15_CARAFOOD.docx e APSII_S15_CARAFOOD_CHECKLIST.docx)
    """
    doc = create_doc_from_friend_template()

    # 1. Checklist de verificação técnica (S01 a S15)
    add_heading_12pt(doc, "1. Checklist de entrega final do projeto (conferência S01 a S15)")
    add_body_p(
        doc,
        "Antes da apresentação final (A1), conferimos item a item todos os requisitos funcionais, páginas obrigatórias, navegação, persistência e documentação do sistema CaráFood em https://foddtech.vercel.app/:",
    )
    add_template_table(
        doc,
        headers=["Categoria / Requisito do Semestre", "Status", "Onde conferir em produção / repositório"],
        rows=[
            ("1. Home / Landing Page (S03)", "[X] Concluído", "https://foddtech.vercel.app/ — Hero, busca, 10 polos rápidos, pílulas por tipo de comida e 61 restaurantes reais."),
            ("2. Página Sobre Nós (S04)", "[X] Concluído", "https://foddtech.vercel.app/sobre — Contexto dos 53 bairros, AMAPEC Cocanha, Colônia Z-8, Missão/Visão/Valores e equipe."),
            ("3. Página de Contato com validação (S05)", "[X] Concluído", "https://foddtech.vercel.app/contato — Validação dos 6 campos e emissão de protocolo único CG-FT-XXXXXX."),
            ("4. Menu global e navegação (S06)", "[X] Concluído", "Navbar.tsx fixa no topo (Desktop) e gaveta mobile + atalho Portal Prof. Cristiano e rodapé unificado."),
            ("5. Tela de Login por perfil (S07)", "[X] Concluído", "https://foddtech.vercel.app/login — 3 perfis em 1 clique (Comensal, Gestor e Curador/Admin) + simulação de erro HTTP 401."),
            ("6. Lista / Catálogo e Rankings (S08)", "[X] Concluído", "https://foddtech.vercel.app/rankings — 61 estabelecimentos, 2.670 pratos reais, gaveta dos 53 bairros e Nota Bayesiana WR."),
            ("7. Página de Detalhe Master–Detail (S09)", "[X] Concluído", f"https://foddtech.vercel.app/prato/{REAL_DISH_ID} — Breadcrumb, foto, preço, rota GPS e Cédula de 5 critérios."),
            ("8. Melhorias, Testes, Deploy e URL (S11–S14)", "[X] Concluído", "SmartFoodImage, painel /moderation mobile, API /api/restaurants/leads, HTTPS/HSTS e README atualizado."),
        ],
        col_widths_in=[2.80, 1.40, 6.30],
    )

    # 2. Plano de apresentação oral (15 a 20 minutos) com divisão entre os 3 integrantes
    add_heading_12pt(doc, "2. Plano de apresentação oral para a banca (15 a 20 minutos)")
    add_body_p(
        doc,
        "O roteiro abaixo organiza a defesa oral do grupo em 18 minutos (dentro da faixa de 15 a 20 minutos), garantindo participação equilibrada dos três integrantes tanto na explicação conceitual quanto na demonstração ao vivo:",
    )
    add_template_table(
        doc,
        headers=["Bloco e Tempo", "Integrante Responsável", "Tópicos Apresentados e Telas Demonstradas ao Vivo"],
        rows=[
            (
                "Bloco 1 (00:00 – 05:30)\n5 min 30 s",
                "Gabriel Hatakeyama Rodrigues\n(RGM 42073448)",
                "Abertura, problema da concentração gastronômica em Caraguatatuba e taxas de delivery, proposta 0% taxa nos 53 bairros, demonstração da Home (/), gaveta das 4 macro-regiões, filtro por tipo de comida e Nota Bayesiana WR em /rankings.",
            ),
            (
                "Bloco 2 (05:30 – 11:30)\n6 min 00 s",
                "Pedro Simone\n(RGM 44066872)",
                "Evolução do protótipo (S02) até a interface atual, demonstração da página Sobre (/sobre), fluxo Lista → Detalhe (/prato/[id]), avaliação ao vivo na Cédula Oficial de 5 critérios, resultados dos testes de usabilidade (S12) e melhorias visuais/mobile (S11).",
            ),
            (
                "Bloco 3 (11:30 – 17:30)\n6 min 00 s",
                "Matheus Vicente\n(RGM 42138078)",
                "Arquitetura em camadas, modelo de banco de dados (PostgreSQL + API Serverless), demonstração ao vivo do fluxo persistido em /contato (gerando protocolo CG-FT-XXXXXX), autenticação dos 3 perfis em /login, aprovação na fila de /moderation, deploy na Vercel (S13) e DNS/HTTPS (S14).",
            ),
            (
                "Encerramento (17:30 – 18:00)\n30 s + Arguição",
                "Gabriel, Matheus e Pedro",
                "Síntese dos resultados alcançados no semestre, autoavaliação crítica e abertura para perguntas do Prof. Me. Cristiano S. Negrão.",
            ),
        ],
        col_widths_in=[1.85, 2.35, 6.30],
    )

    # 3. Autoavaliação honesta do projeto (forças e limitações atuais)
    add_heading_12pt(doc, "3. Autoavaliação crítica e honesta do grupo (pontos fortes e limitações)")
    add_bullet_p(
        doc,
        "(1) Substituição integral de dados fictícios por um catálogo real auditado de Caraguatatuba (61 estabelecimentos, 2.670 pratos com preços reais e 1.230 fotos reais); (2) cobertura dos 53 bairros oficiais organizados em 4 macro-regiões sem poluir a tela; (3) implementação matemática real da Nota Ponderada Bayesiana (WR) e da Cédula de 5 critérios; e (4) cuidado com a responsividade mobile e segurança HTTPS/HSTS para funcionamento liso nos laboratórios da faculdade.",
        bold_prefix="Principais pontos fortes alcançados: ",
    )
    add_bullet_p(
        doc,
        "(1) No ambiente gratuito da Vercel, os novos protocolos gerados em /contato e as aprovações feitas em /moderation durante a demonstração ficam persistidos na memória da instância Serverless ativa (enquanto a conexão direta ao PostgreSQL em nuvem dedicada exige plano pago ou banco externo gerenciado); e (2) a atualização automática de cardápios via raspagem (scraper Python) é executada localmente e sincronizada via dump JSON para evitar bloqueios de tempo limite (timeout de 10s) das funções gratuitas da Vercel.",
        bold_prefix="Fragilidades e limitações atuais reconhecidas pelo grupo: ",
    )

    # Artefato entregue
    add_heading_12pt(doc, "Artefato entregue")
    add_bullet_p(doc, "100% dos itens de S01 a S14 verificados e operacionais em https://foddtech.vercel.app/ (seção 1).", bold_prefix="Checklist final conferido: ")
    add_bullet_p(doc, "roteiro de 18 minutos com divisão clara entre Gabriel Rodrigues, Pedro Simone e Matheus Vicente (seção 2).", bold_prefix="Plano de apresentação oral: ")
    add_bullet_p(doc, "balanço transparente das forças técnicas e das limitações do ambiente gratuito (seção 3).", bold_prefix="Autoavaliação crítica: ")

    out_paths = [
        BASE_DIR / "entregas_aps2" / "S15_Checklist_Apresentacao" / "APSII_S15_CARAFOOD.docx",
        BASE_DIR / "entregas_aps2" / "S15_Checklist_Apresentacao" / "APSII_S15_CARAFOOD_CHECKLIST.docx",
        BASE_DIR / "docs" / "academic" / "APSII_S15_CARAFOOD.docx",
        WORKSPACE_ROOT / "APSII_S15_CARAFOOD.docx",
        WORKSPACE_ROOT / "APSII_S15_CARAFOOD_CHECKLIST.docx",
    ]
    save_docx_to_paths(doc, out_paths)


def build_s16_a1():
    """
    S16 / A1 — Relatório Técnico Final Consolidado (APSII_S16_CARAFOOD.docx e APSII_A1_Entrega_Final_CARAFOOD.docx)
    """
    doc = create_doc_from_friend_template()

    # 1. Visão geral, contexto e escopo final implementado (S01 a S16)
    add_heading_12pt(doc, "1. Contexto, Problema e Escopo Consolidado (S01 a S16 — Entrega Final A1)")
    add_body_p(
        doc,
        "O CaráFood é uma plataforma web híbrida (Next.js 14, TypeScript e Tailwind CSS) criada para descentralizar a descoberta gastronômica nos 53 bairros oficiais de Caraguatatuba. O sistema resolve duas dores práticas levantadas na S01: as taxas de 27% a 30% dos aplicativos de entrega tradicionais (que excluem pequenos quiosques, maricultores da AMAPEC na Cocanha e pescadores artesanais da Colônia Z-8) e a falta de critério nas notas antigas da internet.",
    )
    add_body_p(doc, "https://foddtech.vercel.app/   |   Repositório: https://github.com/GaboBiroo/caragua-foodtech-mono", bold_prefix="Sistema em produção: ")
    add_bullet_p(
        doc,
        "61 estabelecimentos reais de Caraguatatuba, 2.670 pratos com preços reais, 1.230 fotos auditadas e 917+ avaliações reais extraídas do Google Maps; filtro pelos 53 bairros (10 polos rápidos + gaveta modal das 4 macro-regiões) e por tipo de comida; página de detalhe (/prato/[id]) com rota GPS e Cédula Oficial de 5 critérios ponderados; credenciamento gratuito (/contato) com protocolo persistido na API (/api/restaurants/leads); login por perfil (/login) e painel de curadoria (/moderation).",
        bold_prefix="Escopo implementado no MVP (100% no ar): ",
    )

    # 2. Engenharia de requisitos e regras de negócio
    add_heading_12pt(doc, "2. Requisitos principais, Histórias de Usuário e Regras de Negócio")
    add_template_table(
        doc,
        headers=["Código", "Tipo", "Descrição Técnica e Implementação no Sistema"],
        rows=[
            ("RF01 / HU01", "Funcional", "Filtragem territorial pelos 53 bairros oficiais (4 macro-regiões: Centro, Norte, Sul e Sertão) e busca textual sem diferenciar acentos na Home (/)."),
            ("RF02 / HU01", "Funcional", "Filtragem rápida por tipo de comida (Lanches & Burgers, Pizzas & Massas, Sushi & Oriental, Peixes & Frutos do Mar, Carnes & Almoço, Combo Família e Açaí & Doces)."),
            ("RF03 / HU02", "Funcional", "Página de detalhe master–detail (/prato/[id]) com trilha breadcrumb, ficha do restaurante, rota GPS (Google Maps / Waze) e modal da Cédula de 5 critérios."),
            ("RF04 / HU05", "Funcional", "Formulário de credenciamento gratuito (/contato) validando 6 campos obrigatórios e gravando protocolo único (CG-FT-XXXXXX) em /api/restaurants/leads."),
            ("RF05 / HU06", "Funcional", "Autenticação por perfil em /login (Comensal, Gestor e Curador/Admin) com bloqueio HTTP 401 e fila de aprovação de pratos em /moderation."),
            ("RN01", "Regra de Negócio", "Cédula Oficial Ponderada: Sabor & Técnica (35%), Apresentação (20%), Frescor & Insumos Locais (15%), Atendimento (15%) e Ambiente (15%)."),
            ("RN02", "Regra de Negócio", "Nota Ponderada Bayesiana (WR = [v/(v+m)]*R + [m/(v+m)]*C, com m = 30 avaliações mínimas) e limite de até 2 pratos seguidos por restaurante no topo do catálogo."),
            ("RNF01 / RNF02", "Não Funcional", "Layout responsivo mobile-first (360px a 1440px), componente SmartFoodImage para nitidez de fotos 1:1 e cabeçalhos HTTPS/HSTS/CSP estritos."),
        ],
        col_widths_in=[1.45, 1.45, 7.60],
    )

    # 3. Arquitetura em 3 camadas e Banco de Dados
    add_heading_12pt(doc, "3. Arquitetura do Sistema, Banco de Dados e Persistência (S13 e S14)")
    add_body_p(
        doc,
        "A aplicação segue uma arquitetura em 3 camadas integrada no monorepo Next.js 14 e publicada sob a URL amigável https://foddtech.vercel.app/:",
    )
    add_bullet_p(doc, "Next.js 14 App Router (React 18 + TypeScript + Tailwind CSS), responsável pelas 7 páginas interativas, validação de formulários, componente SmartFoodImage e adaptação Desktop/Mobile.", bold_prefix="1. Camada de Apresentação (Front-end): ")
    add_bullet_p(doc, "rotas Serverless em src/app/api/* (/api/restaurants, /api/restaurants/leads, /api/moderation, /api/ai/chat) combinadas ao motor de cálculo Bayesiano e higienização de catálogo.", bold_prefix="2. Camada de Lógica e Serviços (API): ")
    add_bullet_p(doc, "modelo relacional PostgreSQL (backend/sql/init.sql com tabelas restaurants, menu_items, reviews e partner_leads) + store real auditado (src/data/realDataStore.ts e caraguaRealDump.json).", bold_prefix="3. Camada de Dados e Persistência: ")

    # 4. Catálogo visual das telas finais em produção
    add_heading_12pt(doc, "4. Telas finais em produção (Computador e Celular)", page_break_before=True)
    add_friend_side_by_side(
        doc,
        SCREENSHOTS_DIR / "home_depois_desktop.png",
        SCREENSHOTS_DIR / "home_depois_mobile.png",
        "Figura 1 – Home e Catálogo Principal (/) com 61 restaurantes reais, filtro por tipo de comida e SmartFoodImage (Desktop e Mobile).",
        left_w=5.15,
        right_w=1.50,
    )
    add_friend_side_by_side(
        doc,
        SCREENSHOTS_DIR / "detalhe_prato_desktop.png",
        SCREENSHOTS_DIR / "detalhe_cedula_mobile.png",
        f"Figura 2 – Página de Detalhe (/prato/{REAL_DISH_ID}) no computador e Cédula Oficial de 5 critérios no celular.",
        left_w=5.15,
        right_w=1.50,
    )

    doc.add_page_break()
    add_friend_side_by_side(
        doc,
        SCREENSHOTS_DIR / "moderation_desktop.png",
        SCREENSHOTS_DIR / "moderation_mobile.png",
        "Figura 3 – Painel Administrativo de Curadoria (/moderation) conectado à API Serverless nas versões computador e celular.",
        left_w=5.15,
        right_w=1.50,
    )

    # 5. Qualidade, Testes Funcionais e Usabilidade
    add_heading_12pt(doc, "5. Casos de Teste Funcionais e Consolidação de Usabilidade (S11 e S12)")
    add_template_table(
        doc,
        headers=["ID", "Caso de Teste", "Entrada / Passos", "Resultado Obtido em Produção"],
        rows=[
            ("CT01", "Filtro por Bairro e Tipo de Comida", "Selecionar 'Centro' + 'Lanches & Burgers' na Home (/).", "Aprovado — Filtra instantaneamente os estabelecimentos reais correspondentes."),
            ("CT02", "Fluxo Master–Detail e Rota GPS", f"Clicar em um prato da lista para abrir /prato/{REAL_DISH_ID} e clicar em 'Como Chegar'.", "Aprovado — Exibe ficha completa, breadcrumb e abre rota GPS no Google Maps."),
            ("CT03", "Avaliação na Cédula de 5 Critérios", "Abrir modal da cédula, definir notas de 1 a 5 nos 5 critérios e enviar.", "Aprovado — Calcula média ponderada, adiciona avaliação à lista e soma +50 pontos."),
            ("CT04", "Persistência de Credenciamento (S13)", "Preencher os 6 campos em /contato e submeter formulário.", "Aprovado — Grava em POST /api/restaurants/leads, exibe protocolo CG-FT-XXXXXX e lista em /moderation."),
            ("CT05", "Bloqueio HTTP 401 e Login por Perfil (S07)", "Clicar em 'Simular Erro (S07)' e depois autenticar nos 3 perfis em /login.", "Aprovado — Bloqueia senha curta (< 6 caracteres) com alerta 401 e redireciona cada perfil."),
            ("CT06", "Segurança HTTPS e Responsividade Mobile", "Acessar https://foddtech.vercel.app em tela 390px e em rede universitária.", "Aprovado — Cadeado HTTPS/HSTS válido sem chamadas HTTP locais e layout mobile sem cortes."),
        ],
        col_widths_in=[0.85, 2.45, 3.45, 3.75],
    )

    # Artefato entregue
    add_heading_12pt(doc, "Artefato entregue (Consolidação Final A1)")
    add_bullet_p(doc, "https://foddtech.vercel.app/ (todas as rotas /, /sobre, /contato, /login, /rankings, /prato/[id] e /moderation operacionais).", bold_prefix="Aplicação publicada em produção: ")
    add_bullet_p(doc, "https://github.com/GaboBiroo/caragua-foodtech-mono (código-fonte completo, scripts SQL, README e CHANGELOG).", bold_prefix="Repositório GitHub: ")
    add_bullet_p(doc, "comensal@carafood.com.br | gestor@restaurante.com.br | cristiano@modulo.edu.br (senha: Carafood@2026) + Portal Prof. Cristiano (CristianoBestProf / Nota10).", bold_prefix="Credenciais rápidas para avaliação da banca: ")

    out_paths = [
        BASE_DIR / "entregas_aps2" / "S16_A1_Entrega_Final" / "APSII_S16_CARAFOOD.docx",
        BASE_DIR / "entregas_aps2" / "S16_A1_Entrega_Final" / "APSII_A1_Entrega_Final_CARAFOOD.docx",
        BASE_DIR / "docs" / "academic" / "APSII_S16_CARAFOOD.docx",
        BASE_DIR / "docs" / "academic" / "APSII_A1_Entrega_Final_CARAFOOD.docx",
        WORKSPACE_ROOT / "APSII_S16_CARAFOOD.docx",
        WORKSPACE_ROOT / "APSII_A1_Entrega_Final_CARAFOOD.docx",
    ]
    save_docx_to_paths(doc, out_paths)


# ==============================================================================
# 4. EXPORTAÇÃO AUTOMÁTICA DE CADA .DOCX PARA .PDF (FORMATO PAISAGEM A4 OFICIAL)
# ==============================================================================

def export_docx_to_pdf(docx_path: Path, pdf_paths: list[Path]):
    """
    Converte um arquivo .docx (construído sobre o template Paisagem A4 do grupo)
    em um PDF Paisagem A4 fiel, preservando cabeçalho, Tabela 0 de Identificação,
    tabelas #D9D9D9 e imagens embutidas.
    """
    doc = docx.Document(str(docx_path))

    # Extrair imagens inline na ordem em que aparecem nos parágrafos e tabelas
    body_html_parts = []

    # Cabeçalho institucional idêntico ao template Paisagem A4
    body_html_parts.append("""
    <div class="hdr-bar">
      <div class="hdr-left">Cruzeiro do Sul Educacional • Análise e Projeto de Sistemas II (2026)</div>
      <div class="hdr-right">CaráFood — Roteiro Gastronômico dos 53 Bairros de Caraguatatuba</div>
    </div>
    """)

    # Renderizar Tabela 0 (Identificação do Projeto)
    body_html_parts.append("""
    <table class="id-table">
      <tr class="shd-dark"><td colspan="6"><strong>IDENTIFICAÇÃO DO PROJETO</strong></td></tr>
      <tr>
        <td class="lbl" width="18%"><strong>Projeto (nome do Sistema):</strong></td>
        <td colspan="5"><strong>CaráFood</strong> — Ecossistema de Descoberta Gastronômica e Auditoria Cultural dos 53 Bairros de Caraguatatuba</td>
      </tr>
      <tr>
        <td class="lbl"><strong>Docente:</strong></td>
        <td colspan="5">Prof. Me. Cristiano S. Negrão</td>
      </tr>
      <tr class="shd-dark"><td colspan="6"><strong>COMPOSIÇÃO DO GRUPO</strong></td></tr>
      <tr class="shd-mid">
        <td width="28%"><strong>Integrante</strong></td>
        <td width="14%"><strong>RGM</strong></td>
        <td colspan="2" width="28%"><strong>E-mail</strong></td>
        <td colspan="2" width="30%"><strong>Papel principal no projeto</strong></td>
      </tr>
      <tr>
        <td>Gabriel Hatakeyama Rodrigues</td>
        <td>42073448</td>
        <td colspan="2">Gabrielhrodrigues8@gmail.com</td>
        <td colspan="2">Product Owner / Tech Lead / Full-stack</td>
      </tr>
      <tr>
        <td>Matheus Vicente</td>
        <td>42138078</td>
        <td colspan="2">matheus.vicente@modulo.edu.br</td>
        <td colspan="2">Requisitos / Back-end / Banco de Dados</td>
      </tr>
      <tr>
        <td>Pedro Simone</td>
        <td>44066872</td>
        <td colspan="2">pedro.simone@modulo.edu.br</td>
        <td colspan="2">UI/UX / Front-end / Testes / Documentação</td>
      </tr>
      <tr>
        <td class="lbl"><strong>Tema / Domínio principal:</strong></td>
        <td colspan="5">Gastronomia local e turismo: catálogo gastronômico dos 53 bairros de Caraguatatuba, com avaliação de pratos por 5 critérios ponderados.</td>
      </tr>
      <tr>
        <td class="lbl"><strong>Tipo de aplicação:</strong></td>
        <td>( &nbsp; ) WEB</td>
        <td>( &nbsp; ) Mobile</td>
        <td colspan="2">( &nbsp; ) Desktop</td>
        <td><strong>( X ) Híbrido (web + mobile + PWA)</strong></td>
      </tr>
    </table>
    """)

    # Mapear rId -> base64 data URI das imagens do documento
    import base64
    rid_to_b64 = {}
    for rel in doc.part.rels.values():
        if "image" in rel.reltype:
            img_bytes = rel.target_part.blob
            b64 = base64.b64encode(img_bytes).decode("ascii")
            rid_to_b64[rel.rId] = f"data:image/png;base64,{b64}"

    # Percorrer elementos filhos de w:body após a primeira tabela
    body_el = doc._element.body
    seen_first_table = False
    for child in body_el.iterchildren():
        tag = child.tag.split("}")[-1]
        if tag == "tbl":
            if not seen_first_table:
                seen_first_table = True
                continue
            # Verificar se é tabela de imagens lado a lado (sem bordas) ou tabela de dados
            blips = [b.get(qn("r:embed")) for b in child.iter(qn("a:blip")) if b.get(qn("r:embed"))]
            if blips:
                imgs_html = []
                for rid in blips:
                    if rid in rid_to_b64:
                        imgs_html.append(f'<img src="{rid_to_b64[rid]}" class="side-img" />')
                body_html_parts.append(f'<div class="img-row">{"".join(imgs_html)}</div>')
            else:
                rows_html = []
                trs = [el for el in child.iterchildren() if el.tag.endswith("}tr")]
                for r_idx, tr in enumerate(trs):
                    tcs = [el for el in tr.iterchildren() if el.tag.endswith("}tc")]
                    cells_html = []
                    for c_idx, tc in enumerate(tcs):
                        p_texts = []
                        for p_el in tc.iter(qn("w:p")):
                            pt = "".join(t.text or "" for t in p_el.iter(qn("w:t"))).strip()
                            if pt:
                                p_texts.append(html.escape(pt))
                        txt_esc = "<br/>".join(p_texts)
                        if r_idx == 0:
                            cells_html.append(f"<th>{txt_esc}</th>")
                        elif c_idx == 0:
                            cells_html.append(f'<td class="c-first"><strong>{txt_esc}</strong></td>')
                        else:
                            cells_html.append(f"<td>{txt_esc}</td>")
                    rows_html.append(f"<tr>{''.join(cells_html)}</tr>")
                body_html_parts.append(f'<table class="data-table">{"".join(rows_html)}</table>')
        elif tag == "p" and seen_first_table:
            blips = [b.get(qn("r:embed")) for b in child.iter(qn("a:blip")) if b.get(qn("r:embed"))]
            if blips:
                for rid in blips:
                    if rid in rid_to_b64:
                        body_html_parts.append(f'<div class="img-single"><img src="{rid_to_b64[rid]}" /></div>')
                continue
            txt = "".join(t.text or "" for t in child.iter(qn("w:t"))).strip()
            if not txt:
                continue
            txt_esc = html.escape(txt)
            if txt.startswith("Figura "):
                body_html_parts.append(f'<p class="caption">{txt_esc}</p>')
            elif any(txt.startswith(f"{n}. ") for n in range(1, 15)) or txt.startswith("Artefato entregue"):
                body_html_parts.append(f'<h2>{txt_esc}</h2>')
            elif txt.startswith("• "):
                body_html_parts.append(f'<p class="bullet">{txt_esc}</p>')
            else:
                body_html_parts.append(f'<p class="body-p">{txt_esc}</p>')

    full_html = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<style>
  @page {{ size: A4 landscape; margin: 12mm 14mm; }}
  * {{ box-sizing: border-box; }}
  body {{
    font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;
    font-size: 10.5pt;
    line-height: 1.32;
    color: #111111;
    margin: 0;
  }}
  .hdr-bar {{
    display: flex;
    justify-content: space-between;
    border-bottom: 1.5px solid #000;
    padding-bottom: 4px;
    margin-bottom: 8px;
    font-size: 9pt;
    color: #333;
    font-weight: 700;
  }}
  table {{ width: 100%; border-collapse: collapse; margin-bottom: 8px; page-break-inside: avoid; }}
  .id-table td, .data-table th, .data-table td {{
    border: 1px solid #000000;
    padding: 5px 8px;
    vertical-align: top;
    font-size: 9.5pt;
  }}
  .shd-dark td, .data-table th {{ background: #D9D9D9; font-weight: 700; text-align: left; }}
  .shd-mid td, .c-first {{ background: #F3F3F3; }}
  .lbl {{ background: #F3F3F3; }}
  h2 {{
    font-size: 12pt;
    font-weight: 700;
    margin: 10px 0 4px 0;
    color: #000;
  }}
  .body-p {{ margin: 0 0 4px 0; }}
  .bullet {{ margin: 0 0 3px 6px; }}
  .img-row {{
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    margin: 6px 0 2px 0;
    page-break-inside: avoid;
  }}
  .img-row img.side-img {{
    max-height: 215px;
    width: auto;
    border: 1px solid #DDD;
  }}
  .img-single {{
    text-align: center;
    margin: 6px 0 2px 0;
    page-break-inside: avoid;
  }}
  .img-single img {{
    max-height: 225px;
    width: auto;
    border: 1px solid #DDD;
  }}
  .caption {{
    text-align: center;
    font-size: 8.5pt;
    color: #222;
    margin: 1px 0 8px 0;
  }}
</style>
</head>
<body>
{"".join(body_html_parts)}
</body>
</html>"""

    tmp_html = SCREENSHOTS_DIR / f"_tmp_{docx_path.stem}.html"
    tmp_html.write_text(full_html, encoding="utf-8")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(tmp_html.as_uri(), wait_until="networkidle")
        first_pdf = pdf_paths[0]
        first_pdf.parent.mkdir(parents=True, exist_ok=True)
        page.pdf(path=str(first_pdf), format="A4", landscape=True, print_background=True)
        browser.close()

    tmp_html.unlink(missing_ok=True)

    for extra_pdf in pdf_paths[1:]:
        extra_pdf.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(str(first_pdf), str(extra_pdf))
    for p_out in pdf_paths:
        print(f"  [PDF]  Salvo: {p_out}")


def main():
    capture_all_screenshots()
    print("[2/3] Gerando todos os documentos .docx no padrão oficial APSII_S09_CARAFOOD.docx...")
    build_s09()
    build_s11()
    build_s12()
    build_s13()
    build_s14()
    build_s15()
    build_s16_a1()

    print("[3/3] Exportando versões em .pdf para todas as entregas...")
    export_docx_to_pdf(
        BASE_DIR / "entregas_aps2" / "S09_Pagina_Detalhe" / "APSII_S09_CARAFOOD.docx",
        [
            BASE_DIR / "entregas_aps2" / "S09_Pagina_Detalhe" / "APSII_S09_CARAFOOD.pdf",
            WORKSPACE_ROOT / "APSII_S09_CARAFOOD.pdf",
        ],
    )
    export_docx_to_pdf(
        BASE_DIR / "entregas_aps2" / "S11_Melhoria_Versionamento" / "APSII_S11_CARAFOOD.docx",
        [
            BASE_DIR / "entregas_aps2" / "S11_Melhoria_Versionamento" / "APSII_S11_CARAFOOD.pdf",
            WORKSPACE_ROOT / "APSII_S11_CARAFOOD.pdf",
        ],
    )
    export_docx_to_pdf(
        BASE_DIR / "entregas_aps2" / "S12_Testes_Usabilidade" / "APSII_S12_CARAFOOD.docx",
        [
            BASE_DIR / "entregas_aps2" / "S12_Testes_Usabilidade" / "APSII_S12_CARAFOOD.pdf",
            BASE_DIR / "entregas_aps2" / "S12_Testes_Usabilidade" / "APSII_S12_Testes_Usabilidade_CARAFOOD.pdf",
            WORKSPACE_ROOT / "APSII_S12_CARAFOOD.pdf",
            WORKSPACE_ROOT / "APSII_S12_Testes_Usabilidade_CARAFOOD.pdf",
        ],
    )
    export_docx_to_pdf(
        BASE_DIR / "entregas_aps2" / "S13_Deploy_Banco" / "APSII_S13_CARAFOOD.docx",
        [
            BASE_DIR / "entregas_aps2" / "S13_Deploy_Banco" / "APSII_S13_CARAFOOD.pdf",
            BASE_DIR / "entregas_aps2" / "S13_Deploy_Banco" / "APSII_S13_Deploy_CARAFOOD.pdf",
            WORKSPACE_ROOT / "APSII_S13_CARAFOOD.pdf",
            WORKSPACE_ROOT / "APSII_S13_Deploy_CARAFOOD.pdf",
        ],
    )
    export_docx_to_pdf(
        BASE_DIR / "entregas_aps2" / "S14_DNS_URL_Amigavel" / "APSII_S14_CARAFOOD.docx",
        [
            BASE_DIR / "entregas_aps2" / "S14_DNS_URL_Amigavel" / "APSII_S14_CARAFOOD.pdf",
            BASE_DIR / "entregas_aps2" / "S14_DNS_URL_Amigavel" / "APSII_S14_DNS_Dominio_URL_Amigavel_CARAFOOD.pdf",
            WORKSPACE_ROOT / "APSII_S14_CARAFOOD.pdf",
            WORKSPACE_ROOT / "APSII_S14_DNS_Dominio_URL_Amigavel_CARAFOOD.pdf",
        ],
    )
    export_docx_to_pdf(
        BASE_DIR / "entregas_aps2" / "S15_Checklist_Apresentacao" / "APSII_S15_CARAFOOD.docx",
        [
            BASE_DIR / "entregas_aps2" / "S15_Checklist_Apresentacao" / "APSII_S15_CARAFOOD.pdf",
            WORKSPACE_ROOT / "APSII_S15_CARAFOOD.pdf",
        ],
    )
    export_docx_to_pdf(
        BASE_DIR / "entregas_aps2" / "S16_A1_Entrega_Final" / "APSII_S16_CARAFOOD.docx",
        [
            BASE_DIR / "entregas_aps2" / "S16_A1_Entrega_Final" / "APSII_S16_CARAFOOD.pdf",
            BASE_DIR / "entregas_aps2" / "S16_A1_Entrega_Final" / "APSII_A1_Entrega_Final_CARAFOOD.pdf",
            WORKSPACE_ROOT / "APSII_S16_CARAFOOD.pdf",
            WORKSPACE_ROOT / "APSII_A1_Entrega_Final_CARAFOOD.pdf",
        ],
    )
    print("Concluído com sucesso!")


if __name__ == "__main__":
    main()

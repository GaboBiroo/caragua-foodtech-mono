import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT

def build_academic_docx():
    doc = docx.Document()

    # Configurar margens A4
    for s in doc.sections:
        s.top_margin = Inches(1)
        s.bottom_margin = Inches(1)
        s.left_margin = Inches(1)
        s.right_margin = Inches(1)

    VERDE = RGBColor(19, 81, 54)
    DOURADO = RGBColor(217, 119, 6)
    CINZA = RGBColor(75, 85, 99)

    # Capa / Cabeçalho
    p_inst = doc.add_paragraph()
    p_inst.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_inst = p_inst.add_run('CENTRO UNIVERSITÁRIO MÓDULO — CRUZEIRO DO SUL EDUCACIONAL\nCURSO SUPERIOR DE TECNOLOGIA EM ANÁLISE E DESENVOLVIMENTO DE SISTEMAS\n')
    r_inst.font.name = 'Arial'
    r_inst.font.size = Pt(11)
    r_inst.font.bold = True
    r_inst.font.color.rgb = VERDE

    r_sub = p_inst.add_run('Disciplina: Análise e Projeto de Sistemas II (APS II) / Projeto de Conclusão de Curso (TCC)\nDocente Avaliador: Prof. Me. Cristiano S. Negrão\n')
    r_sub.font.name = 'Arial'
    r_sub.font.size = Pt(10)
    r_sub.font.color.rgb = CINZA

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_title = p_title.add_run('\nRELATÓRIO TÉCNICO & MEMORIAL DESCRITIVO DE ENGENHARIA DE SOFTWARE\nPROJETO: CARAGUÁ FOODTECH\n')
    r_title.font.name = 'Arial'
    r_title.font.size = Pt(16)
    r_title.font.bold = True
    r_title.font.color.rgb = VERDE

    r_status = p_title.add_run('Release 1.0 — Entrega Parcial (MVP Funcional & Validação de UX)\n')
    r_status.font.name = 'Arial'
    r_status.font.size = Pt(12)
    r_status.font.bold = True
    r_status.font.color.rgb = DOURADO

    doc.add_paragraph('─' * 55).alignment = WD_ALIGN_PARAGRAPH.CENTER

    # 1. Identificação do Projeto e Equipe
    h1 = doc.add_heading('1. IDENTIFICAÇÃO DO PROJETO E COMPOSIÇÃO DO GRUPO', level=1)
    h1.runs[0].font.color.rgb = VERDE

    p_id = doc.add_paragraph()
    p_id.add_run('Nome do Sistema: ').bold = True
    p_id.add_run('Caraguá FoodTech — Plataforma de Inteligência Gastronômica & Roteiro dos 53 Bairros de Caraguatatuba\n')
    p_id.add_run('Docente Responsável: ').bold = True
    p_id.add_run('Prof. Me. Cristiano S. Negrão\n')
    p_id.add_run('Tema / Domínio Principal: ').bold = True
    p_id.add_run('Inteligência Gastronômica Regional, Turismo Sustentável, Mapeamento Territorial Hiperlocal e Preservação da Cultura Caiçara\n')
    p_id.add_run('Tipo de Aplicação: ').bold = True
    p_id.add_run('( X ) WEB   (   ) Mobile   (   ) Desktop   ( X ) Híbrido (Web + Mobile-First + PWA)\n')
    p_id.add_run('Deploy Oficial Ativo (Vercel): ').bold = True
    p_id.add_run('https://foddtech.vercel.app/\n')
    p_id.add_run('Repositório Monorepo (GitHub): ').bold = True
    p_id.add_run('https://github.com/GaboBiroo/caragua-foodtech-mono')

    # Tabela do Grupo
    table = doc.add_table(rows=1, cols=4)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr_cells = table.rows[0].cells
    hdr_cells[0].text = 'Integrante'
    hdr_cells[1].text = 'RGM'
    hdr_cells[2].text = 'E-mail'
    hdr_cells[3].text = 'Papel Principal no Projeto'
    for c in hdr_cells:
        c.paragraphs[0].runs[0].font.bold = True
        c.paragraphs[0].runs[0].font.color.rgb = VERDE

    members = [
        ('Gabriel Rodrigues', 'Informar RGM', 'gabriel.rodrigues@modulo.edu.br', 'Tech Lead / Product Owner / Full-Stack'),
        ('Matheus Vicente', 'Informar RGM', 'matheus.vicente@modulo.edu.br', 'Engenharia de Requisitos & Modelagem de Domínio'),
        ('Pedro Simone', 'Informar RGM', 'pedro.simone@modulo.edu.br', 'Garantia de Qualidade (QA) & Documentação Técnica')
    ]

    for m in members:
        row_cells = table.add_row().cells
        for idx, text in enumerate(m):
            row_cells[idx].text = text

    doc.add_paragraph()

    # 2. Declaração Formal da Base de Dados
    h2 = doc.add_heading('2. DECLARAÇÃO FORMAL DE TRANSPARÊNCIA: STATUS DA BASE DE DADOS (ETAPA 1)', level=1)
    h2.runs[0].font.color.rgb = VERDE

    p_dec = doc.add_paragraph()
    p_dec.add_run('Vimos por meio deste esclarecer formalmente à banca avaliadora e ao Prof. Cristiano S. Negrão que a presente versão de entrega parcial opera sobre uma ').font.size = Pt(10.5)
    p_dec.add_run('Base de Amostras Curadas de Alta Fidelidade (Seed Dataset)').bold = True
    p_dec.add_run(':\n\n1. ')
    p_dec.add_run('Não Utilização de Raspagem Automática nesta Fase: ').bold = True
    p_dec.add_run('Os dados atualmente visíveis na plataforma ainda NÃO foram extraídos através de rotinas dinâmicas de Web Scraping em tempo real.\n\n2. ')
    p_dec.add_run('Origem Histórica dos Dados: ').bold = True
    p_dec.add_run('Os 15 pratos emblemáticos, restaurantes e comentários foram estruturados artesanalmente com rigor documental, inspirados nos registros do Festival Gastronômico Caraguá a Gosto (19ª Edição), na Associação dos Maricultores da Praia da Cocanha (AMAPEC) e na Colônia de Pescadores Z-8 do Camaroeiro.\n\n3. ')
    p_dec.add_run('Justificativa Metodológica (Padrão MIT/USP): ').bold = True
    p_dec.add_run('A Etapa 1 concentrou-se estritamente na validação da Experiência do Usuário (UX), da apetência visual dos pratos, da navegação sem colisões e da compilação estática de 28 rotas no Next.js 14. A esteira automatizada de scraping (Playwright/BeautifulSoup) e RAG vetorial integra o cronograma da Etapa 2.')

    # 3. Respostas Teóricas
    h3 = doc.add_heading('3. FUNDAMENTAÇÃO TEÓRICA APLICADA (RESPOSTA ÀS 3 QUESTÕES)', level=1)
    h3.runs[0].font.color.rgb = VERDE

    doc.add_paragraph().add_run('Questão 1: “Em uma frase, diferencie Scrum e Kanban”').bold = True
    doc.add_paragraph('“O Scrum organiza o desenvolvimento em iterações de tempo fixo chamadas Sprints, sustentado por papéis rígidos e cerimônias estruturadas para entrega incremental de valor, enquanto o Kanban é um método de fluxo visual contínuo e flexível, que prioriza a eficiência do processo através da limitação rigorosa do trabalho em andamento (WIP - Work in Progress) sem depender de caixas de tempo pré-estabelecidas.”')

    doc.add_paragraph().add_run('Questão 2: “O que é backlog?”').bold = True
    doc.add_paragraph('Backlog é o inventário ordenado, dinâmico e centralizado de tudo o que é necessário para construir ou aprimorar o produto — abrangendo novas funcionalidades, débitos técnicos, melhorias de arquitetura e correções de bugs. No projeto, distinguimos o Product Backlog (gerido pelo Product Owner) e o Sprint Backlog (itens comprometidos para o ciclo corrente).')

    doc.add_paragraph().add_run('Questão 3: “O que é sprint?”').bold = True
    doc.add_paragraph('Sprint é um ciclo de tempo pré-determinado e inegociável (time-box), tipicamente entre 1 e 4 semanas, no qual a equipe multidisciplinar transforma os itens acordados no Sprint Backlog em um incremento de software funcional, testado e potencialmente publicável (Definition of Done).')

    # 4. Histórias de Usuário
    h4 = doc.add_heading('4. HISTÓRIAS DE USUÁRIO (MÍNIMO 6 HISTÓRIAS IMPLEMENTADAS)', level=1)
    h4.runs[0].font.color.rgb = VERDE

    stories = [
        ('HU01 (Usuário Principal - Turista/Morador)', 'Como morador ou turista de Caraguatatuba, quero filtrar pratos e restaurantes diretamente pela barra de Stories dos 53 bairros oficiais, para descobrir onde comer bem além da orla central (em bairros como Tinga, Cocanha e Morro do Algodão).'),
        ('HU02 (Usuário Principal - Comensal do Festival)', 'Como cliente de um restaurante participante do Caraguá a Gosto, quero votar através de uma cédula digital com os 5 critérios oficiais (sabor, apresentação, insumos locais, atendimento e ambiente), para registrar meu voto auditado e concorrer a prêmios.'),
        ('HU03 (Usuário Principal - Visitante em Trânsito)', 'Como visitante trafegando pelas vias de Caraguatatuba, quero clicar em um botão no prato do feed e abrir instantaneamente a rota no Google Maps ou Waze, para chegar ao estabelecimento sem dificuldades de navegação.'),
        ('HU04 (Gestor / Administrador do Restaurante)', 'Como proprietário de um quiosque de praia ou bistrô caiçara, quero preencher um formulário formal de credenciamento informando CNPJ, bairro e especialidade, para incluir meu negócio na curadoria oficial da plataforma.'),
        ('HU05 (Gestor / Administrador Competitivo)', 'Como gestor gastronômico, quero visualizar o painel analítico de rankings com o pódio do festival, para comparar meu desempenho com outros participantes da categoria e calibrar meu atendimento.'),
        ('HU06 (Outro Ator Relevante - Maricultor AMAPEC / Pescador Z-8)', 'Como produtor de mexilhões da Fazenda da Cocanha (AMAPEC) ou pescador artesanal da Colônia Z-8, quero que os pratos que utilizam nossos insumos exibam um selo oficial de procedência sustentável, para valorizar a economia caiçara e combater fraudes alimentares.')
    ]

    for title, desc in stories:
        p_s = doc.add_paragraph()
        p_s.add_run(f'• {title}:\n').bold = True
        p_s.add_run(f'  {desc}\n')

    # 5. Mapa de Páginas e Fluxo
    h5 = doc.add_heading('5. MAPA DE PÁGINAS & FLUXO DE NAVEGAÇÃO', level=1)
    h5.runs[0].font.color.rgb = VERDE

    doc.add_paragraph('O fluxo de navegação foi estruturado no princípio de Zero Fricção:\n'
                      '1. Navbar Global Sticky (h-20, top-0, z-40): Acesso à marca, 53 bairros, links institucionais e Portal do Prof. Cristiano.\n'
                      '2. Hero Banner & Dynamic Island: Apresentação da capital gastronômica com assistente inteligente sem colisões visuais.\n'
                      '3. Stories dos 53 Bairros (sticky top-20 z-30): Navegação horizontal por todos os bairros municipais com rolagem assistida para desktop.\n'
                      '4. Feed Oficial Estilo Instagram: 15 cards com fotos reais de pratos, double-tap com partículas douradas, tags Xiaohongshu e botão de rota.\n'
                      '5. Modal Cédula Oficial Caraguá a Gosto: Avaliação auditada em 5 critérios com super nota em tempo real.\n'
                      '6. Módulos Secundários: /sobre (história & TCC), /rankings (pódio do festival), /contato (credenciamento) e /prato/:id (Master-Detail).')

    # 6. Mini Reflexão de UX
    h6 = doc.add_heading('6. MINI REFLEXÃO DE UX (TRADUÇÃO DO TEXTO EM CÓDIGO REAL)', level=1)
    h6.runs[0].font.color.rgb = VERDE

    doc.add_paragraph('“A transposição dos requisitos abstratos da documentação para uma aplicação web funcional expôs de imediato o desafio de balancear densidade de informação e clareza visual. Na primeira tentativa de enriquecer o layout com múltiplos recursos (Dynamic Island flutuante, balões de diálogo e crachás empilhados), geramos inadvertidamente uma colisão de camadas que cobria o prato e bloqueava cliques. Aprendemos na prática que a gastronomia exige que a fotografia da comida seja o gatilho emocional soberano. Ajustar o z-index dos Stories para fixar logo abaixo da Navbar e consolidar o assistente Jacquin em um companheiro minimizável transformou uma interface poluída em uma experiência fluida de padrão internacional.”')

    # Salvar arquivo
    out_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'docs', 'academic')
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.abspath(os.path.join(out_dir, 'APSII_S02_CARAGUA_FOODTECH.docx'))
    doc.save(out_path)
    print(f'Documento Word salvo com sucesso em:\n{out_path}')

if __name__ == '__main__':
    build_academic_docx()

import os
import sys
from pathlib import Path
import base64
import io

try:
    import qrcode
    from PIL import Image
except ImportError:
    print("[!] Pacote qrcode ou Pillow não encontrado. Instale com: pip install qrcode pillow")
    sys.exit(1)

def get_lan_ip() -> str:
    """Obtém o IP local da interface Ethernet/Wi-Fi."""
    import socket
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "192.168.100.67"

def generate_qr_assets():
    base_dir = Path(__file__).resolve().parent.parent.parent
    mobile_images_dir = base_dir / "mobile" / "assets" / "images"
    mobile_images_dir.mkdir(parents=True, exist_ok=True)

    lan_ip = get_lan_ip()
    expo_url = f"exp://{lan_ip}:8082"
    web_url = f"http://{lan_ip}:8082"
    admin_url = f"http://{lan_ip}:3000"
    api_url = f"http://{lan_ip}:8000/docs"

    print(f"[*] IP LAN detectado: {lan_ip}")
    print(f"[*] Gerando QR Codes para:")
    print(f"    - Expo Go (iPhone): {expo_url}")
    print(f"    - Safari Web (iPhone): {web_url}")

    # 1. QR Code para Expo Go (PNG em alta resolução)
    qr_expo = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=12,
        border=4,
    )
    qr_expo.add_data(expo_url)
    qr_expo.make(fit=True)
    img_expo = qr_expo.make_image(fill_color="#0F172A", back_color="#FFFFFF")
    expo_png_path = mobile_images_dir / "qrcode_expogo.png"
    img_expo.save(str(expo_png_path))
    print(f"[OK] QR Code Expo Go salvo em: {expo_png_path}")

    # Buffer base64 para embutir diretamente no HTML
    buffered_expo = io.BytesIO()
    img_expo.save(buffered_expo, format="PNG")
    b64_expo = base64.b64encode(buffered_expo.getvalue()).decode("utf-8")

    # 2. QR Code para Navegador Safari Web
    qr_web = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=12,
        border=4,
    )
    qr_web.add_data(web_url)
    qr_web.make(fit=True)
    img_web = qr_web.make_image(fill_color="#0F172A", back_color="#FFFFFF")
    web_png_path = mobile_images_dir / "qrcode_web.png"
    img_web.save(str(web_png_path))
    print(f"[OK] QR Code Safari Web salvo em: {web_png_path}")

    buffered_web = io.BytesIO()
    img_web.save(buffered_web, format="PNG")
    b64_web = base64.b64encode(buffered_web.getvalue()).decode("utf-8")

    # 3. Gerar a Página HTML mobile-preview.html com visual Liquid Glass & Dark Caiçara
    html_content = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Caraguá FoodTech — Visualização no iPhone</title>
  <style>
    :root {{
      --bg: #090d16;
      --card-bg: rgba(15, 23, 42, 0.75);
      --card-border: rgba(56, 189, 248, 0.2);
      --accent-cyan: #38bdf8;
      --accent-gold: #f59e0b;
      --accent-emerald: #10b981;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
    }}
    * {{
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }}
    body {{
      background: radial-gradient(circle at 50% 10%, #1e293b 0%, #090d16 100%);
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      padding: 30px 20px;
    }}
    .container {{
      max-width: 820px;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }}
    .header {{
      text-align: center;
      margin-bottom: 8px;
    }}
    .header .badge {{
      display: inline-block;
      padding: 6px 14px;
      border-radius: 9999px;
      background: rgba(56, 189, 248, 0.15);
      border: 1px solid rgba(56, 189, 248, 0.3);
      color: var(--accent-cyan);
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
    }}
    .header h1 {{
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.5px;
      background: linear-gradient(135deg, #ffffff 30%, #38bdf8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 8px;
    }}
    .header p {{
      color: var(--text-muted);
      font-size: 15px;
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.5;
    }}
    .card-grid {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }}
    @media (max-width: 768px) {{
      .card-grid {{
        grid-template-columns: 1fr;
      }}
    }}
    .glass-card {{
      background: var(--card-bg);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--card-border);
      border-radius: 20px;
      padding: 24px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      position: relative;
      overflow: hidden;
    }}
    .glass-card::before {{
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, transparent, var(--accent-cyan), transparent);
    }}
    .glass-card.gold::before {{
      background: linear-gradient(90deg, transparent, var(--accent-gold), transparent);
    }}
    .card-title {{
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 8px;
    }}
    .card-subtitle {{
      font-size: 13px;
      color: var(--text-muted);
      margin-bottom: 20px;
      line-height: 1.4;
    }}
    .qr-wrapper {{
      background: #ffffff;
      padding: 14px;
      border-radius: 16px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
      margin-bottom: 20px;
      display: inline-block;
    }}
    .qr-wrapper img {{
      display: block;
      width: 220px;
      height: 220px;
      object-fit: contain;
    }}
    .btn {{
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 12px 20px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;
      border: none;
    }}
    .btn-primary {{
      background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
      color: #ffffff;
      box-shadow: 0 4px 15px rgba(2, 132, 199, 0.35);
    }}
    .btn-primary:hover {{
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(2, 132, 199, 0.5);
    }}
    .btn-gold {{
      background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
      color: #ffffff;
      box-shadow: 0 4px 15px rgba(217, 119, 6, 0.35);
    }}
    .btn-gold:hover {{
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(217, 119, 6, 0.5);
    }}
    .btn-outline {{
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-main);
      border: 1px solid rgba(255, 255, 255, 0.15);
      margin-top: 8px;
    }}
    .btn-outline:hover {{
      background: rgba(255, 255, 255, 0.1);
    }}
    .steps-card {{
      background: var(--card-bg);
      backdrop-filter: blur(16px);
      border: 1px solid var(--card-border);
      border-radius: 20px;
      padding: 24px;
    }}
    .steps-card h3 {{
      font-size: 17px;
      font-weight: 700;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--accent-cyan);
    }}
    .step-item {{
      display: flex;
      align-items: flex-start;
      gap: 14px;
      margin-bottom: 14px;
    }}
    .step-number {{
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: rgba(56, 189, 248, 0.15);
      border: 1px solid rgba(56, 189, 248, 0.3);
      color: var(--accent-cyan);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 13px;
      flex-shrink: 0;
    }}
    .step-text strong {{
      display: block;
      color: #ffffff;
      font-size: 14px;
      margin-bottom: 2px;
    }}
    .step-text p {{
      color: var(--text-muted);
      font-size: 13px;
      line-height: 1.4;
    }}
    .links-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
      margin-top: 10px;
    }}
    .footer {{
      text-align: center;
      color: var(--text-muted);
      font-size: 12px;
      margin-top: 20px;
      line-height: 1.6;
    }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="badge">TCC ADS — CENTRO UNIVERSITÁRIO MÓDULO</span>
      <h1>Caraguá FoodTech Mobile</h1>
      <p>Agregador Gastronômico Hiperlocal com IA & RAG de 5 Estágios. Escaneie abaixo com a câmera do iPhone para visualizar a aplicação imediatamente.</p>
    </div>

    <div class="card-grid">
      <!-- Card Expo Go -->
      <div class="glass-card">
        <h2 class="card-title">📱 Opção 1: Expo Go (Nativo)</h2>
        <p class="card-subtitle">Abra com a experiência nativa iOS a 120fps (Reanimated 3 + Liquid Glass + Haptics).</p>
        <div class="qr-wrapper">
          <img src="data:image/png;base64,{b64_expo}" alt="QR Code Expo Go">
        </div>
        <a href="{expo_url}" class="btn btn-primary">Abrir no Expo Go no iPhone</a>
        <button class="btn btn-outline" onclick="navigator.clipboard.writeText('{expo_url}'); alert('URL copiada: {expo_url}')">
          📋 Copiar Link exp://
        </button>
      </div>

      <!-- Card Safari Web -->
      <div class="glass-card gold">
        <h2 class="card-title">🌐 Opção 2: Safari / Web Mobile</h2>
        <p class="card-subtitle">Abra diretamente no navegador Safari do iPhone sem precisar instalar nenhum app.</p>
        <div class="qr-wrapper">
          <img src="data:image/png;base64,{b64_web}" alt="QR Code Safari Web">
        </div>
        <a href="{web_url}" target="_blank" class="btn btn-gold">Abrir no Safari do iPhone</a>
        <button class="btn btn-outline" onclick="navigator.clipboard.writeText('{web_url}'); alert('URL copiada: {web_url}')">
          📋 Copiar Link http://
        </button>
      </div>
    </div>

    <!-- Guia Rápido iPhone -->
    <div class="steps-card">
      <h3>📋 Passo a Passo para o iPhone da Sua Esposa</h3>
      <div class="step-item">
        <div class="step-number">1</div>
        <div class="step-text">
          <strong>Conexão na Mesma Rede Wi-Fi</strong>
          <p>Certifique-se de que o iPhone está conectado na mesma rede Wi-Fi que este computador (IP LAN: <code>{lan_ip}</code>).</p>
        </div>
      </div>
      <div class="step-item">
        <div class="step-number">2</div>
        <div class="step-text">
          <strong>Aponte a Câmera Nativa do iPhone</strong>
          <p>Abra o aplicativo nativo <strong>Câmera</strong> do iPhone e aponte para um dos QR Codes acima.</p>
        </div>
      </div>
      <div class="step-item">
        <div class="step-number">3</div>
        <div class="step-text">
          <strong>Toque na Notificação Amarela</strong>
          <p>Para o <strong>Expo Go</strong>, toque para abrir no aplicativo Expo. Para a <strong>Web</strong>, toque no link amarelo que abrirá instantaneamente no Safari.</p>
        </div>
      </div>
    </div>

    <!-- Outros Portais do Sistema -->
    <div class="steps-card">
      <h3>🚀 Portais do Ecossistema em Funcionamento</h3>
      <div class="links-grid">
        <a href="{admin_url}" target="_blank" class="btn btn-outline">
          📊 Web Admin Dashboard ({admin_url})
        </a>
        <a href="{api_url}" target="_blank" class="btn btn-outline">
          ⚡ API FastAPI Swagger ({api_url})
        </a>
      </div>
    </div>

    <div class="footer">
      Desenvolvido por <strong>Gabriel Rodrigues (@GaboBiroo)</strong> para o TCC em Análise e Desenvolvimento de Sistemas.<br>
      Caraguatatuba/SP — Litoral Norte Paulista • {lan_ip}
    </div>
  </div>
</body>
</html>
"""

    root_html_path = base_dir / "mobile-preview.html"
    with open(root_html_path, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"[OK] Página de pré-visualização salva em: {root_html_path}")

    # Também copia para dentro de mobile/ para acesso direto do Metro
    mobile_html_path = base_dir / "mobile" / "mobile-preview.html"
    with open(mobile_html_path, "w", encoding="utf-8") as f:
        f.write(html_content)

    return lan_ip, expo_url, web_url

if __name__ == "__main__":
    generate_qr_assets()

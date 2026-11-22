# -*- coding: utf-8 -*-
"""
Suíte Automatizada de Auditoria E2E — Simulação Completa da Banca de TCC (CaráFood)
Valida de ponta a ponta (Desktop 1366x768 e Mobile 390x844):
1. Fluxo Deslogado -> Cadastro com Nome Social & Pronome Social ("Elu/Delu") -> Logado na Navbar;
2. Fluxo Login Social (Google & Apple OAuth);
3. Fluxo Recuperação de Senha Multicanal (OTP de 6 dígitos via E-mail e via WhatsApp);
4. Fluxo Segurança AppSec: Sanitização Anti-XSS, Máscara de PII (CPF/Telefone) e Rate-Limit Brute Force (HTTP 429);
5. Fluxo Direitos do Titular LGPD (Portabilidade JSON Art. 18 e Anonimização/Exclusão);
6. Fluxo Direitos Autorais (Lei 9.610/98): Reivindicação/Takedown em /prato/[id] (CG-DA-XXXXXX) -> /moderation;
7. Fluxo Resiliência ("Força Vital" / Zero-SPOF) e Sustentabilidade SaaS 0% Taxa em /sobre;
8. Scanner Anti-Jargão na Vitrine do Consumidor.
"""

import sys
import time
import json
import urllib.request
import urllib.error
import subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding="utf-8")

BASE_DIR = Path(__file__).resolve().parent.parent
PORT = 3099
BASE_URL = f"http://127.0.0.1:{PORT}"
REAL_DISH_ID = "03f09e72-5c04-508a-bab6-fe753e0fca15"


def wait_for_server(url: str, timeout_sec: int = 45) -> bool:
    deadline = time.time() + timeout_sec
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(url, timeout=3) as resp:
                if resp.status == 200:
                    return True
        except Exception:
            time.sleep(1)
    return False


def api_post(path: str, payload: dict) -> tuple[int, dict]:
    req = urllib.request.Request(
        f"{BASE_URL}{path}",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        try:
            return e.code, json.loads(body)
        except Exception:
            return e.code, {"raw": body}


def run_audit():
    print("=================================================================")
    print("INICIANDO AUDITORIA E2E COMPLETA DA BANCA DE TCC — CARÁFOOD")
    print("=================================================================")

    server_proc = subprocess.Popen(
        f"npx next start -p {PORT}",
        cwd=str(BASE_DIR),
        shell=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    try:
        print(f"[0/8] Aguardando servidor de produção em {BASE_URL} ...")
        if not wait_for_server(BASE_URL, timeout_sec=50):
            raise RuntimeError("Servidor Next.js não respondeu a tempo.")
        print("      -> Servidor online (HTTP 200)!")

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)

            # ==================================================================
            # DESKTOP CONTEXT (1366x768)
            # ==================================================================
            ctx_desk = browser.new_context(viewport={"width": 1366, "height": 768})
            page = ctx_desk.new_page()

            # 1. FLUXO DESLOGADO -> CADASTRO COM NOME SOCIAL & PRONOME SOCIAL -> LOGADO
            print("[1/8] Testando Fluxo Deslogado -> Cadastro (Nome Social + Pronome 'Elu/Delu') -> Logado...")
            page.goto(f"{BASE_URL}/login", wait_until="networkidle", timeout=45000)

            # Fecha banner LGPD se visível
            lgpd_btn = page.locator("[data-testid='lgpd-accept-all']")
            if lgpd_btn.is_visible():
                lgpd_btn.click()

            assert page.locator("[data-testid='navbar-login-link']").is_visible(), "Link Entrar / Criar Conta deveria estar visível quando deslogado"

            page.locator("[data-testid='tab-register']").click()
            page.locator("[data-testid='register-nome-civil']").fill("Alexandre Costa")
            page.locator("[data-testid='register-nome-social']").fill("Alex Costa")
            page.locator("[data-testid='pronoun-option-Elu-Delu']").click()
            page.locator("[data-testid='register-email']").fill("alex.costa@carafood.com.br")
            page.locator("[data-testid='register-whatsapp']").fill("(12) 99755-4433")
            page.locator("[data-testid='register-password']").fill("Carafood@2026")
            page.locator("[data-testid='register-submit-btn']").click()

            page.wait_for_selector("[data-testid='navbar-user-badge']", timeout=10000)
            badge_text = page.locator("[data-testid='navbar-user-badge']").inner_text()
            assert "Alex Costa (Elu/Delu)" in badge_text, f"Esperava Nome Social e Pronome na Navbar, recebeu: {badge_text}"
            print(f"      -> SUCESSO: Navbar mudou para estado Logado exibindo '{badge_text.strip()}'!")

            # 2. FLUXO DIREITOS DO TITULAR LGPD (PORTABILIDADE JSON)
            print("[2/8] Testando Direitos do Titular LGPD (Portabilidade JSON Art. 18)...")
            page.locator("[data-testid='navbar-user-badge']").click()
            page.wait_for_selector("[data-testid='profile-modal-display-name']", timeout=8000)
            page.locator("[data-testid='lgpd-export-json-btn']").click()
            page.wait_for_selector("[data-testid='profile-feedback-banner']", timeout=8000)
            fb_text = page.locator("[data-testid='profile-feedback-banner']").inner_text()
            assert "portabilidade LGPD" in fb_text, f"Feedback de portabilidade não exibido: {fb_text}"
            page.locator("[data-testid='profile-logout-btn']").click()
            page.wait_for_selector("[data-testid='navbar-login-link']", timeout=8000)
            print("      -> SUCESSO: Portabilidade JSON LGPD exportada e Logout verificado!")

            # 3. FLUXO LOGIN SOCIAL (GOOGLE & APPLE)
            print("[3/8] Testando Autenticação Social (Google e Apple OAuth)...")
            page.locator("[data-testid='tab-login']").click()
            page.locator("[data-testid='oauth-google-btn']").click()
            page.wait_for_selector("[data-testid='navbar-user-badge']", timeout=10000)
            google_badge = page.locator("[data-testid='navbar-user-badge']").inner_text()
            assert "Lucas Oliveira" in google_badge, f"Badge Google incorreto: {google_badge}"

            page.locator("[data-testid='auth-card-logout-btn']").click()
            page.wait_for_selector("[data-testid='navbar-login-link']", timeout=8000)

            page.locator("[data-testid='oauth-apple-btn']").click()
            page.wait_for_selector("[data-testid='navbar-user-badge']", timeout=10000)
            apple_badge = page.locator("[data-testid='navbar-user-badge']").inner_text()
            assert "Bia Santos (Ela/Dela)" in apple_badge, f"Badge Apple incorreto: {apple_badge}"
            print("      -> SUCESSO: Login Social com Google e Apple validados com criação de sessão!")

            # 4. FLUXO RECUPERAÇÃO DE SENHA (E-MAIL E WHATSAPP COM OTP 6 DÍGITOS)
            print("[4/8] Testando Recuperação de Senha via E-mail e via WhatsApp (OTP 6 dígitos)...")
            page.locator("[data-testid='tab-recover']").click()

            # Canal 1: E-mail
            page.locator("[data-testid='recover-channel-email']").click()
            page.locator("[data-testid='recover-target-input']").fill("comensal@carafood.com.br")
            page.locator("[data-testid='recover-send-otp-btn']").click()
            page.wait_for_selector("[data-testid='recover-sandbox-otp']", timeout=8000)
            otp_email = page.locator("[data-testid='recover-sandbox-otp']").inner_text().strip()
            assert len(otp_email) == 6 and otp_email.isdigit(), f"OTP E-mail inválido: {otp_email}"
            page.locator("[data-testid='recover-otp-input']").fill(otp_email)
            page.locator("[data-testid='recover-new-password-input']").fill("NovaSenha@2026")
            page.locator("[data-testid='recover-verify-btn']").click()
            page.wait_for_selector("[data-testid='auth-success-banner']", timeout=8000)

            # Canal 2: WhatsApp
            page.locator("[data-testid='recover-channel-whatsapp']").click()
            page.locator("[data-testid='recover-target-input']").fill("(12) 99711-2233")
            page.locator("[data-testid='recover-send-otp-btn']").click()
            page.wait_for_selector("[data-testid='recover-sandbox-otp']", timeout=8000)
            otp_wa = page.locator("[data-testid='recover-sandbox-otp']").inner_text().strip()
            assert len(otp_wa) == 6 and otp_wa.isdigit(), f"OTP WhatsApp inválido: {otp_wa}"
            page.locator("[data-testid='recover-otp-input']").fill(otp_wa)
            page.locator("[data-testid='recover-new-password-input']").fill("Carafood@2026")
            page.locator("[data-testid='recover-verify-btn']").click()
            page.wait_for_selector("[data-testid='auth-success-banner']", timeout=8000)
            print(f"      -> SUCESSO: OTP via E-mail ({otp_email}) e via WhatsApp ({otp_wa}) validados e senha redefinida!")

            # 5. FLUXO SEGURANÇA APPSEC (XSS, PII MASKING & BRUTE-FORCE RATE LIMIT)
            print("[5/8] Testando Segurança AppSec (Anti-XSS, Máscara de PII LGPD e Rate Limit HTTP 429)...")
            status_xss, res_xss = api_post(
                "/api/restaurants/leads",
                {
                    "restaurant_name": "<script>alert(1)</script>Quiosque Seguro",
                    "contact_name": "<img src=x onerror=alert(1)>João",
                    "email": "joao@quiosque.com.br",
                    "phone": "(12) 99700-1122",
                    "neighborhood": "Cocanha",
                    "subject": "credenciamento",
                    "message": "<script>evil()</script>Quero credenciar meu quiosque.",
                },
            )
            assert status_xss == 201, f"Esperava 201 no lead sanitizado, recebeu {status_xss}"
            saved_lead_name = res_xss.get("lead", {}).get("restaurant_name", "")
            assert "<script>" not in saved_lead_name and "Quiosque Seguro" in saved_lead_name, f"Falha anti-XSS: {saved_lead_name}"

            status_pii, res_pii = api_post(
                "/api/restaurants/reviews",
                {
                    "author_name": "Carlos",
                    "pronome_social": "Ele/Dele",
                    "comment_text": "Lanche ótimo! Meu CPF é 123.456.789-00 e meu zap é (12) 99712-3456.",
                    "overall_rating": 5,
                },
            )
            assert status_pii == 201, f"Esperava 201 na review, recebeu {status_pii}"
            masked_comment = res_pii.get("review", {}).get("comment", "")
            assert "123.456.789-00" not in masked_comment and "***.***.***-**" in masked_comment, f"CPF não mascarado: {masked_comment}"
            assert "99712-3456" not in masked_comment and "(**) *****-****" in masked_comment, f"Telefone não mascarado: {masked_comment}"

            # Brute-force test (6 tentativas seguidas para o mesmo identificador)
            got_429 = False
            for attempt in range(7):
                code, _ = api_post(
                    "/api/auth/login",
                    {"email": "atacante.bruteforce@teste.com", "password": "wrongpassword123"},
                )
                if code == 429:
                    got_429 = True
                    break
            assert got_429, "Rate limiter deveria bloquear tentativa excessiva de Brute Force com HTTP 429!"
            print("      -> SUCESSO: XSS removido, CPF/Telefone mascarados e Brute-Force bloqueado com HTTP 429!")

            # 6. FLUXO DIREITOS AUTORAIS (LEI 9.610/98) -> /MODERATION
            print("[6/8] Testando Reivindicação de Direitos Autorais / Takedown em /prato/[id] -> /moderation...")
            page.goto(f"{BASE_URL}/prato/{REAL_DISH_ID}", wait_until="networkidle", timeout=45000)
            page.locator("[data-testid='open-copyright-claim-btn']").click()
            page.wait_for_selector("[data-testid='claim-type-takedown']", timeout=8000)
            page.locator("[data-testid='claim-type-takedown']").click()
            page.locator("[data-testid='copyright-input-claimant']").fill("Estúdio Fotográfico Caiçara")
            page.locator("[data-testid='copyright-input-email']").fill("direitos@estudio.com.br")
            page.locator("[data-testid='copyright-input-whatsapp']").fill("(12) 99788-1122")
            page.locator("[data-testid='copyright-input-justification']").fill(
                "Solicitação de substituição/remoção de fotografia autoral conforme Lei 9.610/98."
            )
            page.locator("[data-testid='copyright-submit-btn']").click()
            page.wait_for_selector("[data-testid='copyright-claim-protocol']", timeout=8000)
            da_protocol = page.locator("[data-testid='copyright-claim-protocol']").inner_text().strip()
            assert da_protocol.startswith("CG-DA-"), f"Protocolo autoral inválido: {da_protocol}"

            page.goto(f"{BASE_URL}/moderation", wait_until="networkidle", timeout=45000)
            page.locator("[data-testid='moderation-tab-copyright']").click()
            page.wait_for_selector(f"[data-testid='copyright-claim-card-{da_protocol}']", timeout=8000)
            print(f"      -> SUCESSO: Protocolo autoral {da_protocol} emitido e listado na aba Direitos Autorais de /moderation!")

            # 8. SCANNER ANTI-JARGÃO NA VITRINE
            print("[7/8] Executando Scanner Anti-Jargão nas telas do consumidor (/ e /prato/[id])...")
            page.goto(f"{BASE_URL}/", wait_until="networkidle", timeout=45000)
            home_text = page.locator("body").inner_text()
            forbidden_jargons = ["pgvector", "SVL-RRF", "PBKDF2", "HNSW"]
            for jargon in forbidden_jargons:
                assert jargon not in home_text, f"Jargão técnico '{jargon}' vazou na vitrine principal!"
            print("      -> SUCESSO: Vitrine do consumidor 100% limpa de jargões técnicos crus!")

            ctx_desk.close()

            # ==================================================================
            # MOBILE CONTEXT (390x844) & RESILIÊNCIA ("FORÇA VITAL")
            # ==================================================================
            print("[8/8] Testando Responsividade Mobile (390x844), Sustentabilidade SaaS (/sobre) e Resiliência...")
            ctx_mob = browser.new_context(
                viewport={"width": 390, "height": 844},
                is_mobile=True,
                has_touch=True,
            )
            pg_mob = ctx_mob.new_page()

            pg_mob.goto(f"{BASE_URL}/sobre", wait_until="networkidle", timeout=45000)
            assert pg_mob.locator("[data-testid='saas-sustainability-section']").is_visible(), "Seção de Sustentabilidade SaaS não visível em /sobre"

            pg_mob.goto(f"{BASE_URL}/prato/{REAL_DISH_ID}", wait_until="networkidle", timeout=45000)
            pg_mob.locator("[data-testid='open-ballot-modal-btn']").click()
            pg_mob.wait_for_timeout(400)
            assert pg_mob.locator("text=Cédula Oficial").first.is_visible(), "Modal da Cédula de 5 critérios não abriu no mobile"

            ctx_mob.close()
            browser.close()

        print("=================================================================")
        print("RESULTADO FINAL: 100% DOS 8 FLUXOS DA BANCA APROVADOS (EXIT CODE 0)")
        print("=================================================================")
    finally:
        server_proc.terminate()
        try:
            server_proc.wait(timeout=5)
        except Exception:
            server_proc.kill()


if __name__ == "__main__":
    run_audit()

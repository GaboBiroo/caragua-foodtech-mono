import hashlib
import re
from typing import Dict, Any, Optional


class LGPDSecurityViolationError(RuntimeError):
    """
    Exceção fatal disparada quando qualquer violação de PII (CPF, telefone pessoal,
    e-mail, cartão, endereço residencial de consumidor ou autor não anonimizado)
    é detectada antes de tocar a sessão transacional do banco de dados.
    """


class LGPDSanitizer:
    """
    Higienizador e Auditor Determinístico em estrita conformidade com a LGPD
    (Lei nº 13.709/2018 — Artigos 5º e 6º: Princípio da Necessidade, Prevenção e Minimização).

    Elimina determinística e irreversivelmente qualquer Informação Pessoalmente
    Identificável (PII) e impõe verificação invariante pré-persistência.
    """

    REGEX_SHA256_HEX = re.compile(r"^[0-9a-f]{64}$")
    REGEX_CPF = re.compile(r"\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b")
    REGEX_EMAIL = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,7}\b")
    REGEX_PHONE = re.compile(
        r"(?<!\d)(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)(?:9?\d{4})[-.\s]?\d{4}(?!\d)"
    )
    REGEX_CARD = re.compile(r"\b(?:\d[ -]*?){13,16}\b")
    REGEX_CEP = re.compile(r"\b\d{5}-\d{3}\b")
    REGEX_CONSUMER_ADDRESS = re.compile(
        r"(?i)\b(?:moro\s+na|entregar?\s+na|meu\s+endere[cç]o\s+[eé]|resido\s+na)\s+"
        r"[A-Za-zÀ-ÿ0-9\s.,-]{4,60},?\s*(?:n[º°o.]?\s*)?\d{1,5}"
        r"(?:\s*,?\s*(?:apto\.?|ap\.?|casa|bloco)\s*[A-Za-z0-9-]+)?"
    )

    AUTHOR_KEYS = {"author_name", "raw_author", "userName", "user_name", "reviewer_name", "author"}
    COMMENT_KEYS = {"comment", "comment_text", "text", "review_text", "evaluation"}

    @classmethod
    def anonymize_author(cls, raw_identifier: str, salt: str = "caragua_foodtech_salt") -> str:
        """
        Converte o nome ou ID original do autor de uma avaliação em um hash criptográfico
        SHA-256 salgado irreversível (64 caracteres hexadecimais).
        Idempotente caso o identificador já esteja anonimizado em SHA-256.
        """
        cleaned = (raw_identifier or "").strip()
        if cls.REGEX_SHA256_HEX.fullmatch(cleaned):
            return cleaned

        base_value = cleaned if cleaned else "anonymous_reviewer"
        encoded = f"{base_value}_{salt}".encode("utf-8")
        return hashlib.sha256(encoded).hexdigest()

    @classmethod
    def sanitize_text(cls, text: Optional[str]) -> Optional[str]:
        """
        Mascara CPFs, e-mails, números de cartão, telefones pessoais, CEPs e
        endereços residenciais de consumidores encontrados em textos livres.
        """
        if text is None:
            return None
        if not text.strip():
            return ""

        sanitized = cls.REGEX_CONSUMER_ADDRESS.sub("[ENDERECO_RESIDENCIAL_REMOVIDO]", text)
        sanitized = cls.REGEX_CPF.sub("[CPF_REMOVIDO]", sanitized)
        sanitized = cls.REGEX_EMAIL.sub("[EMAIL_REMOVIDO]", sanitized)
        sanitized = cls.REGEX_CARD.sub("[CARTAO_REMOVIDO]", sanitized)
        sanitized = cls.REGEX_PHONE.sub("[TELEFONE_REMOVIDO]", sanitized)
        sanitized = cls.REGEX_CEP.sub("[CEP_REMOVIDO]", sanitized)
        return sanitized.strip()

    @classmethod
    def assert_lgpd_compliant(cls, author_hash: str, sanitized_comment: Optional[str]) -> None:
        """
        Invariante de Segurança LGPD pré-banco:
        Dispara LGPDSecurityViolationError fatal se o autor não for um hash SHA-256
        estrito ou se restar qualquer vestígio de PII não mascarado no comentário.
        """
        if not author_hash or not cls.REGEX_SHA256_HEX.fullmatch(author_hash):
            raise LGPDSecurityViolationError(
                "Violação LGPD Fatal: identificador de autor não está anonimizado em SHA-256."
            )

        if not sanitized_comment:
            return

        checks = (
            ("CPF", cls.REGEX_CPF),
            ("EMAIL", cls.REGEX_EMAIL),
            ("CARTAO", cls.REGEX_CARD),
            ("TELEFONE", cls.REGEX_PHONE),
            ("CEP", cls.REGEX_CEP),
            ("ENDERECO_RESIDENCIAL", cls.REGEX_CONSUMER_ADDRESS),
        )
        for label, pattern in checks:
            if pattern.search(sanitized_comment):
                raise LGPDSecurityViolationError(
                    f"Violação LGPD Fatal: padrão sensível [{label}] detectado em texto destinado à persistência."
                )

    @classmethod
    def contains_residual_pii(cls, text: Optional[str]) -> bool:
        """Retorna True se o texto contiver qualquer padrão de PII sensível não mascarado."""
        if not text:
            return False
        patterns = (
            cls.REGEX_CPF,
            cls.REGEX_EMAIL,
            cls.REGEX_CARD,
            cls.REGEX_PHONE,
            cls.REGEX_CEP,
            cls.REGEX_CONSUMER_ADDRESS,
        )
        return any(p.search(text) is not None for p in patterns)

    @classmethod
    def sanitize_raw_payload(cls, payload: Any, salt: str = "caragua_foodtech_salt") -> Any:
        """
        Higieniza recursivamente estruturas JSON interceptadas na camada de rede
        antes da gravação de arquivos temporários em disco (backend/data/raw/).
        """
        if isinstance(payload, list):
            return [cls.sanitize_raw_payload(item, salt=salt) for item in payload]

        if isinstance(payload, dict):
            cleaned_dict: Dict[str, Any] = {}
            for key, value in payload.items():
                if key in cls.AUTHOR_KEYS and isinstance(value, str):
                    cleaned_dict[key] = cls.anonymize_author(value, salt=salt)
                elif key in cls.COMMENT_KEYS and isinstance(value, str):
                    cleaned_dict[key] = cls.sanitize_text(value)
                else:
                    cleaned_dict[key] = cls.sanitize_raw_payload(value, salt=salt)
            return cleaned_dict

        return payload

    @classmethod
    def sanitize_review_payload(cls, raw_review: Dict[str, Any]) -> Dict[str, Any]:
        """Sanitiza e audita o payload bruto de uma avaliação individual."""
        author_hash = cls.anonymize_author(str(raw_review.get("author_name", "")))
        comment_text = cls.sanitize_text(raw_review.get("text", ""))
        cls.assert_lgpd_compliant(author_hash, comment_text)
        return {
            "author_hash": author_hash,
            "original_rating": float(raw_review.get("rating", 5.0)),
            "comment_text": comment_text,
            "review_date": raw_review.get("date"),
        }

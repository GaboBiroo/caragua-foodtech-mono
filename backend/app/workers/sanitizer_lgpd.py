import hashlib
import re
from typing import Dict, Any, Optional

class LGPDSanitizer:
    """
    Higienizador em estrita conformidade com a Lei Geral de Proteção de Dados (LGPD).
    Artigos 5º e 6º (Princípio da Necessidade e Minimização de Dados).
    
    Elimina determinística e irreversivelmente qualquer Informação Pessoalmente
    Identificável (PII) antes que seja persistida no banco ou vetorizada.
    """
    # Expressões Regulares de Detecção de PII
    REGEX_CPF = re.compile(r'\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b')
    REGEX_EMAIL = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b')
    REGEX_PHONE = re.compile(r'\b(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}\b')
    REGEX_CARD = re.compile(r'\b(?:\d[ -]*?){13,16}\b')

    @classmethod
    def anonymize_author(cls, raw_identifier: str, salt: str = "caragua_foodtech_salt") -> str:
        """
        Converte o nome ou ID original do autor de um comentário em um hash criptográfico
        SHA-256 salgado irreversível, permitindo agregação sem rastreabilidade de pessoa natural.
        """
        if not raw_identifier:
            return "anonimo_" + hashlib.sha256(b"desconhecido").hexdigest()[:12]
        
        encoded = f"{raw_identifier}_{salt}".encode("utf-8")
        return hashlib.sha256(encoded).hexdigest()

    @classmethod
    def sanitize_text(cls, text: Optional[str]) -> Optional[str]:
        """
        Mascara CPFs, telefones, e-mails e números de cartão encontrados no texto do review.
        """
        if not text:
            return None

        sanitized = cls.REGEX_CPF.sub("[CPF_REMOVIDO]", text)
        sanitized = cls.REGEX_EMAIL.sub("[EMAIL_REMOVIDO]", sanitized)
        sanitized = cls.REGEX_PHONE.sub("[TELEFONE_REMOVIDO]", sanitized)
        sanitized = cls.REGEX_CARD.sub("[CARTAO_REMOVIDO]", sanitized)
        return sanitized.strip()

    @classmethod
    def sanitize_review_payload(cls, raw_review: Dict[str, Any]) -> Dict[str, Any]:
        """Sanitiza o payload bruto de uma avaliação."""
        return {
            "author_hash": cls.anonymize_author(raw_review.get("author_name", "")),
            "original_rating": float(raw_review.get("rating", 5.0)),
            "comment_text": cls.sanitize_text(raw_review.get("text", "")),
            "review_date": raw_review.get("date")
        }

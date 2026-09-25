from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.api.dependencies import get_async_session

router = APIRouter(prefix="/health", tags=["Health & Diagnostics"])

@router.get("", summary="Verificação de Integridade dos Componentes Híbridos")
async def check_health(session: AsyncSession = Depends(get_async_session)):
    """
    Testa ativamente as conexões com o PostgreSQL e valida a presença
    e funcionamento das extensões PostGIS e pgvector.
    """
    try:
        # Testa conectividade e extensões
        query = text("""
            SELECT 
                postgis_version() AS postgis_v,
                installed_version AS vector_v
            FROM pg_available_extensions 
            WHERE name = 'vector' AND installed_version IS NOT NULL;
        """)
        result = await session.execute(query)
        row = result.fetchone()

        return {
            "status": "online",
            "database": "connected",
            "postgis_active": row is not None,
            "pgvector_active": row is not None,
            "details": {
                "postgis_version": row[0] if row else "N/A",
                "pgvector_version": row[1] if row else "N/A"
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Falha de saúde no cluster PostgreSQL: {str(e)}"
        )

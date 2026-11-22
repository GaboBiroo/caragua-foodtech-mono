export type ImageSourceType =
  | 'merchant_uploaded'
  | 'creative_commons_verified'
  | 'public_catalog_reference';

export type CopyrightStatus = 'verified' | 'pending_claim' | 'takedown_removed';

export type CopyrightClaimType =
  | 'claim_ownership'
  | 'replace_media'
  | 'takedown_request';

export interface CopyrightClaim {
  protocol: string; // Formato CG-DA-XXXXXX
  claimType: CopyrightClaimType;
  restaurantName: string;
  dishId?: string;
  dishName?: string;
  claimantName: string;
  claimantRole: string;
  email: string;
  whatsapp: string;
  justification: string;
  replacementImageUrl?: string;
  status:
    | 'Em Análise Prioritária'
    | 'Aprovado e Atualizado'
    | 'Mídia Removida';
  createdAt: string;
}

export interface SectionDef {
  id: string;
  title: string;
  description: string;
  is_header?: boolean;
  is_footer?: boolean;
  roles?: string[];
}

export interface PageDef {
  id: string;
  name: string;
  route: string;
  parentId?: string;
  roles?: string[];
  sections: SectionDef[];
}

export interface UniversalSitemap {
  project_name: string;
  pages: PageDef[];
}

export interface BrandingProfile {
  identity: {
    name: string;
    purpose: string;
    slogan: string;
    personality: string;
  };
  visuals: {
    primaryHex: string;
    secondaryHex: string;
    accentHex: string;
    backgroundHex: string;
    headingFont: string;
    bodyFont: string;
    numberFont: string;
    imageStyle: string;
  };
  layout_rules: {
    navbar_style: 'minimal' | 'sticky' | 'transparent';
    footer_style: 'standard' | 'minimal' | 'detailed';
  };
  voice: {
    tone: string;
    prohibited_words: string[];
    slang_allowed: boolean;
  };
  restrictions: {
    no_go_list: string[];
  };
}

export interface SitemapBrandingState {
    sitemap: UniversalSitemap;
    branding: BrandingProfile;
}

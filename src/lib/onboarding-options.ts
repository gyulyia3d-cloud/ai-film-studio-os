export type Choice = { value: string; label: string };

export const OBJETIVO_OPTIONS: Choice[] = [
  { value: "reflexao", label: "Reflexão / provocação artística" },
  { value: "conscientizacao", label: "Conscientização / educação" },
  { value: "campanha", label: "Campanha de marca" },
  { value: "portfolio", label: "Portfólio pessoal" },
  { value: "entretenimento", label: "Entretenimento" },
  { value: "denuncia", label: "Denúncia / ativismo" },
];

export const FORMATO_OPTIONS: Choice[] = [
  { value: "curta", label: "Curta-metragem" },
  { value: "ensaio", label: "Vídeo-ensaio / documentário" },
  { value: "serie", label: "Série" },
  { value: "publicidade", label: "Publicidade" },
  { value: "reels", label: "Conteúdo para redes sociais / Reels" },
  { value: "animacao", label: "Animação" },
  { value: "videoclipe", label: "Videoclipe" },
  { value: "videomapping", label: "Videomapping / DOOH" },
  { value: "instalacao", label: "Instalação imersiva" },
  { value: "ia", label: "Vídeo gerado por IA" },
  { value: "producao_virtual", label: "Produção virtual" },
];

export const FAIXA_ETARIA_OPTIONS: Choice[] = [
  { value: "13-17", label: "13–17 anos" },
  { value: "18-24", label: "18–24 anos" },
  { value: "25-34", label: "25–34 anos" },
  { value: "35-44", label: "35–44 anos" },
  { value: "45-54", label: "45–54 anos" },
  { value: "55+", label: "55+ anos" },
  { value: "todas", label: "Todas as idades" },
];

export const INTERESSE_OPTIONS: Choice[] = [
  { value: "tecnologia", label: "Tecnologia" },
  { value: "feminismo", label: "Feminismo / ativismo" },
  { value: "arte", label: "Arte & cultura" },
  { value: "cinema", label: "Cinema" },
  { value: "ciencia", label: "Ciência" },
  { value: "negocios", label: "Negócios" },
  { value: "geral", label: "Público geral / amplo" },
];

export const ORCAMENTO_OPTIONS: Choice[] = [
  { value: "zero", label: "Zero / DIY" },
  { value: "baixo", label: "Baixo (até R$ 1 mil)" },
  { value: "medio", label: "Médio (R$ 1 mil a R$ 10 mil)" },
  { value: "alto", label: "Alto (acima de R$ 10 mil)" },
  { value: "indefinido", label: "Ainda não sei" },
];

export const PRAZO_OPTIONS: Choice[] = [
  { value: "1semana", label: "1 semana" },
  { value: "2semanas", label: "2 semanas" },
  { value: "1mes", label: "1 mês" },
  { value: "2-3meses", label: "2–3 meses" },
  { value: "indefinido", label: "Sem prazo definido" },
];

export const IDIOMA_OPTIONS: Choice[] = [
  { value: "pt-br", label: "Português (BR)" },
  { value: "pt-pt", label: "Português (PT)" },
  { value: "en", label: "Inglês" },
  { value: "es", label: "Espanhol" },
];

export const ESTILO_OPTIONS: Choice[] = [
  { value: "poetico", label: "Poético / contemplativo" },
  { value: "jornalistico", label: "Jornalístico / investigativo" },
  { value: "provocador", label: "Provocador / irônico" },
  { value: "minimalista", label: "Minimalista" },
  { value: "found_footage", label: "Found footage / collage" },
  { value: "cinematico", label: "Cinemático / épico" },
];

export const RECURSOS_OPTIONS: Choice[] = [
  { value: "smartphone", label: "Celular / smartphone" },
  { value: "camera", label: "Câmera DSLR / mirrorless" },
  { value: "sem_aparecer", label: "Prefiro não aparecer em câmera" },
  { value: "elenco", label: "Atores / elenco disponível" },
  { value: "locacao", label: "Estúdio ou locação própria" },
  { value: "arquivo", label: "Found footage / material de arquivo" },
  { value: "nenhum", label: "Nenhum equipamento próprio" },
];

export const PIPELINE_OPTIONS: Choice[] = [
  { value: "tradicional", label: "Filmagem tradicional" },
  { value: "ia_generativa", label: "IA generativa (imagem/vídeo)" },
  { value: "hibrido", label: "Híbrido (filmagem + IA)" },
  { value: "producao_virtual", label: "Produção virtual / Unreal Engine" },
  { value: "animacao_2d3d", label: "Animação 2D/3D" },
  { value: "found_footage", label: "Found footage / collage" },
];

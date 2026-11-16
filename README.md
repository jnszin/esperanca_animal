# 🐾 Projeto Esperança Animal

> **Plataforma web full-stack de alto impacto social voltada ao resgate, acolhimento, triagem de adoção responsável e controle populacional (castração e vacinação) de animais em situação de vulnerabilidade na Grande Vitória - ES.**

<p align="center">
  <a href="https://projetoesperancaanimal.com.br" target="_blank">
    <img src="https://img.shields.io/badge/Status-Produção%20Ativa-success?style=for-the-badge&logo=vercel&logoColor=white" alt="Status Produção" />
  </a>
  <img src="https://img.shields.io/badge/Next.js%2015-App%20Router-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/React%2019-Server%20Components-blue?style=for-the-badge&logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript%205-Strict-blue?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind%20CSS%20v4-Modern%20UI-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/Prisma%206-PostgreSQL-3982CE?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma ORM" />
  <img src="https://img.shields.io/badge/Cloudflare%20R2-S3%20Storage-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Cloudflare R2" />
  <img src="https://img.shields.io/badge/Auth.js%20v5-JWT%20Edge-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Auth.js v5" />
</p>

---

## 🌐 Acesso em Produção
* **Website Oficial:** [https://projetoesperancaanimal.com.br](https://projetoesperancaanimal.com.br)
* **Desenvolvido e mantido por:** [Pachyx Soluções Digitais](https://pachyx.com.br) como projeto de impacto social e responsabilidade comunitária.

---

## 📖 Visão Geral & O Desafio

O **Projeto Esperança Animal** nasceu da necessidade de modernizar e centralizar as operações de proteção animal independente lideradas pela protetora Daniela no Espírito Santo. 

Antes da plataforma, a organização de resgates, filas de espera de castração e triagem de adotantes dependia de trocas dispersas de mensagens no WhatsApp e anotações manuais, gerando sobrecarga operacional, risco de perda de dados e dificuldade no acompanhamento público por parte dos tutores.

### 🎯 Objetivos de Negócio & Engenharia
1. **Vitrine Digital Otimizada:** Apresentação clara dos animais resgatados disponíveis para adoção, com histórico de saúde, exigências e galeria de fotos em alta performance.
2. **Triagem Inteligente de Adoção:** Formulário multi-etapas que coleta o perfil do adotante, estrutura residencial e concordância com os termos éticos e legais (LGPD).
3. **Gestão de Castração & Vacinação:** Portal público onde o tutor registra seu animal e recebe um código de protocolo único (ex: `CAS-2026-4812`), podendo consultar em tempo real a evolução na fila, clínica agendada e orientações pré-operatórias.
4. **Central de Resgates & Guia Metropolitano:** Integração informativa dos canais oficiais dos 4 municípios prioritários da Grande Vitória (**Vitória 156**, **Vila Velha 162**, **Serra 24h/WhatsApp**, **Cariacica 162/24h**) orientando o cidadão a gerar o protocolo público municipal antes ou em conjunto com o registro no projeto.
5. **Rede de Apoio & Voluntariado:** Captação segmentada de voluntários para passeios, lar temporário (LT) e apoios personalizados.
6. **Backoffice Operacional Seguro (RBAC):** Painel administrativo unificado para triagem, despacho de mensagens personalizadas no WhatsApp com um clique e controle de permissões em múltiplos níveis (`ADMIN` e `VOLUNTARIO`).

---

## 🏗️ Arquitetura de Software & Decisões Técnicas

```mermaid
flowchart TD
    subgraph Client ["🖥️ Camada do Cliente (React 19)"]
        UI["Landing Page / Vitrine / Formulários"]
        AdminUI["Backoffice Administrativo (/dashboard)"]
    end

    subgraph Edge ["⚡ Edge Runtime (Middleware)"]
        MW["Next.js Middleware<br/>• Proteção de Rotas RBAC<br/>• Verificação JWT sem query SQL"]
    end

    subgraph Backend ["⚙️ Servidor Next.js 15 (Node.js)"]
        SA["Server Actions<br/>• Zod Schema Validation<br/>• RequireAuth / RequireAdmin"]
        SharpEng["Sharp Image Pipeline<br/>• Resize Max 1600px<br/>• WebP Q80 in-memory"]
    end

    subgraph Storage ["☁️ Nuvem & Armazenamento"]
        R2["Cloudflare R2 (S3-Compatible)<br/>Zero VPS Disk Storage"]
    end

    subgraph Database ["🗄️ Persistência de Dados"]
        Postgres["PostgreSQL 16 (VPS Hostinger)<br/>Prisma ORM • Connection Pooling"]
    end

    UI -->|Público| SA
    AdminUI -->|Requer Sessão| MW
    MW -->|Autorizado| SA
    SA --> SharpEng
    SharpEng -->|Despacho de Bytes| R2
    SA -->|Prisma Client| Postgres
```

### 🔑 Principais Destaques de Engenharia:

* **React 19 & Next.js 15 App Router:** Uso intensivo de **Server Components (RSC)** para garantir First Contentful Paint (FCP) ultrarrápido e SEO impecável nas páginas públicas, mantendo o consumo de JavaScript no cliente restrito aos componentes interativos.
* **Autenticação em Borda (Edge Auth) com Defesa em Profundidade:**
  * O `middleware.ts` valida as credenciais JWT do `Auth.js v5` diretamente na memória da borda, garantindo **zero requisições ao PostgreSQL** em acessos bloqueados.
  * Todas as Server Actions administrativas invocam internamente `requireAuth()` e `requireAdmin()`, impossibilitando a execução de ações indevidas mesmo em caso de requisições diretas de API.
* **Pipeline de Mídia Otimizado (Zero Armazenamento Local na VPS):**
  * O envio de fotos de animais e resgates é processado **em memória (Buffer)** usando **Sharp**, redimensionando para o limite de 1600px e convertendo automaticamente para formato moderno `.webp` (qualidade 80).
  * O upload é despachado via `@aws-sdk/client-s3` para o **Cloudflare R2**, reduzindo o custo de armazenamento a zero, acelerando o carregamento global via CDN e evitando lotação de disco na VPS.
* **Validação Ponta a Ponta com Zod:** Todos os formulários públicos e payloads de Server Actions passam por validação estrita com esquemas Zod centralizados em `src/schemas/`.
* **Privacidade & Conformidade com a LGPD:**
  * A consulta pública de protocolos expõe apenas o primeiro nome do tutor e dados técnicos do animal, ocultando endereço completo, telefone e documentos pessoais.
  * Termos explícitos de consentimento registrados com timestamp no banco de dados.
* **Acessibilidade & Boas Práticas (WCAG):** Labels devidamente vinculados via `htmlFor`/`id`, atributos `aria-labelledby`, `role="dialog"` e suporte completo a navegação por teclado.

---

## 📦 Módulos da Aplicação

### 1. Vitrine de Adoção Responsável (`/animais`)
* Catálogo dinâmico com esteira infinita de destaque na home page.
* Filtros por faixa etária (filhote, adulto, idoso), porte (pequeno, médio, grande) e espécie.
* Ficha técnica com badges de castração, vacinação, vermifugação e exigência de telas de proteção.
* Formulário de adoção multi-etapas com questionário de perfil residencial e familiar.

### 2. Gestão de Castração & Vacinação (`/castracao`)
* Solicitação pública com peso em kg (fundamental para cálculo anestésico), raça/SRD e observações de saúde.
* Gerador inteligente de protocolos únicos anti-colisão (ex: `CAS-2026-4812`).
* Aba de acompanhamento público em tempo real sem necessidade de login.
* Gatilhos de formatação de mensagens padronizadas prontas para envio no WhatsApp oficial do tutor.

### 3. Plantão de Resgates Comunitários (`/chamados`)
* Guia com números verificados e regras de recolhimento das 4 prefeituras da Grande Vitória.
* Formulário de acolhimento com upload de foto do animal ferido/abandonado, ponto de referência e campo para protocolo municipal prévio.
* Painel de plantão no dashboard com despacho de status: *Em Deslocamento*, *Resgatado* ou *Encaminhado*.

### 4. Portal "Como Ajudar" & Voluntários (`/ajude`)
* Inscrição categorizada para voluntários: Passeios recreativos, Lar Temporário (LT) ou Voluntariado Personalizado.
* Aba de doações com chave Pix e orientações para doação de ração, medicamentos e insumos veterinários.

### 5. Backoffice Administrativo (`/dashboard`)
* Painel com resumo dos chamados pendentes, fila de castração, solicitações de adoção recebidas e animais ativos.
* Gerenciador de animais com arquivamento lógico por motivo oficial (preservando o histórico para auditoria).
* Script CLI interativo (`npm run alterar-admin`) com criptografia `bcrypt` para redefinição segura de credenciais diretamente no banco e revogação de acessos anteriores sem necessidade de parada de serviço.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Motivação & Uso |
|---|---|---|
| **Frontend Framework** | Next.js 15.5 (App Router) | Renderização híbrida (RSC + SSR + Client Components) |
| **Biblioteca de UI** | React 19 | Server Actions, hooks modernos e alta performance |
| **Linguagem** | TypeScript 5 (Strict Mode) | Tipagem estática rigorosa para segurança em tempo de compilação |
| **Estilização** | Tailwind CSS v4 | Utilitários modernos, zero runtime CSS e responsividade fluida |
| **Ícones** | Lucide React | Biblioteca leve de ícones SVG consistentes |
| **Banco de Dados** | PostgreSQL 16 | Banco relacional robusto com enums e integridade referencial |
| **ORM** | Prisma ORM 6 | Schema declarativo, migrations seguras e tipagem de consultas |
| **Autenticação** | Auth.js v5 (NextAuth) | Sessões JWT criptografadas, RBAC e integração com Edge Middleware |
| **Armazenamento de Mídia**| Cloudflare R2 | Object Storage compatível com S3, sem taxas de egress (tráfego de saída) |
| **Processamento de Imagens** | Sharp | Otimização de imagens em memória (conversão WebP e resize) |
| **Validação** | Zod | Validação declarativa de schemas no cliente e no servidor |
| **Criptografia** | BcryptJS | Hashing seguro de senhas com salt rounds |
| **Servidor & Deploy** | VPS Linux (Hostinger) | Nginx (Proxy Reverso), PM2 (Process Manager) e Certbot (SSL HTTPS) |

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
* **Node.js** `>= 20.x`
* **PostgreSQL** rodando localmente ou via container Docker
* Gerenciador de pacotes **npm** ou **pnpm**

### 1. Clonar o repositório
```bash
git clone https://github.com/jnszin/esperanca_animal.git
cd esperanca_animal
```

### 2. Configurar as Variáveis de Ambiente
Copie o arquivo de exemplo:
```bash
cp .env.example .env
```
Edite o arquivo `.env` com suas credenciais:
```env
# Banco de Dados PostgreSQL
DATABASE_URL="postgresql://usuario:senha@localhost:5432/esperanca_db?schema=public"

# Autenticação (NextAuth / Auth.js v5)
AUTH_SECRET="gere_uma_chave_segura_com_openssl_rand_base64_32"
AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Segurança de Webhooks
WEBHOOK_SECRET="segredo_para_validacao_de_webhooks"

# Cloudflare R2 (Opcional no ambiente local - possui fallback mock automático)
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET_NAME="esperanca-animal"
R2_PUBLIC_URL="https://pub-exemplo.r2.dev"
```

### 3. Instalar Dependências & Sincronizar o Banco
```bash
npm install
npx prisma generate
npx prisma db push
```

### 4. Popular o Banco com Dados Iniciais (Seed)
```bash
npm run seed
```

### 5. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```
Acesse `http://localhost:3000` no seu navegador. O painel administrativo estará acessível em `http://localhost:3000/admin`.

---

## 🔒 Gerenciamento de Acesso Administrativo

A plataforma inclui um utilitário CLI exclusivo para criação ou alteração das credenciais do administrador de forma interativa e com revogação imediata de credenciais de teste antigas:

```bash
npm run alterar-admin
```
O script solicitará o novo e-mail, senha e nome do administrador, aplicando criptografia `bcrypt` e salvando diretamente no banco sem necessidade de parar o servidor ou refazer o build.

---

## 🚢 Deploy em Produção (VPS Linux + Nginx + PM2)

A aplicação está homologada e rodando em ambiente de produção em uma VPS Linux com **Nginx** como proxy reverso e **PM2** como gerenciador de processos:

```bash
# 1. Puxar alterações do repositório
git pull origin main

# 2. Sincronizar schema do banco e gerar build
npx prisma generate
npx prisma db push
npm run build

# 3. Reiniciar processo com variáveis de ambiente atualizadas
pm2 restart all --update-env
```

---

## 👨‍💻 Autor & Créditos

Este projeto foi idealizado e implementado com orgulho pela **[Pachyx Soluções Digitais](https://pachyx.com.br)** em apoio voluntário à causa animal e à liderança do **Projeto Esperança Animal**.

* **Website da Pachyx:** [pachyx.com.br](https://pachyx.com.br)
* **Desenvolvedor:** Jonas ([@jnszin](https://github.com/jnszin))
* **Contato para Projetos:** [contato@pachyx.com.br](mailto:contato@pachyx.com.br)

---

<p align="center">
  <sub>Construído com tecnologia de ponta para proteger quem não pode falar por si mesmo. 🐾❤️</sub>
</p>

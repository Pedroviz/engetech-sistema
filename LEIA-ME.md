# Dashboard Engetech: arquivos desta entrega

Copie cada arquivo para o mesmo caminho dentro do projeto.

Novos:
- lib/dashboard/status.ts: status de obra e de orçamento, com rótulos e cores
- lib/dashboard/queries.ts: consultas do dashboard, todas com tenantId

Substituídos:
- app/(dashboard)/dashboard/page.tsx: redireciona para /login se o token for inválido
- app/(dashboard)/dashboard/DashboardClient.tsx: 4 KPIs, orçado vs realizado, distribuição de gastos, fluxo de caixa 6 meses, pipeline de orçamentos, situação das obras, pagamentos pendentes e cards de obras
- app/(dashboard)/dashboard/dashboard.module.css: estilos glass e animações, claro e escuro
- app/(dashboard)/layout.tsx: menu com as 10 abas da tela antiga

Alterados (diff pequeno):
- lib/schemas.ts: obraSchema usa STATUS_OBRA
- app/api/obras/[id]/route.ts: PUT valida o status e responde 400 se for inválido

Não testado aqui: build do Next, typecheck completo e banco de dados. Só a sintaxe foi verificada.

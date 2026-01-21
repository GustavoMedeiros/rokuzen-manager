# Velora Manager 🧘‍♀️📊

Sistema completo de **gestão de atendimentos, clientes, profissionais e recursos**, desenvolvido para clínicas de bem-estar, estética e terapias, com foco em **organização, visual moderno e produtividade**.

---

## ✨ Visão Geral

O **Velora Manager** é uma aplicação **Full Stack** construída com **Spring Boot + React**, que permite:

- Gerenciar clientes, massagistas e equipamentos
- Criar e visualizar agendamentos em grade diária
- Consultar histórico por cliente com métricas financeiras
- Visualizar dashboards e relatórios com gráficos
- Autenticação segura via JWT
- Interface moderna, responsiva e profissional

---

## 🧱 Arquitetura

### 🔹 Backend
- Java 17
- Spring Boot
- Spring Security + JWT
- Spring Data JPA (Hibernate)
- MySQL
- Springdoc OpenAPI (Swagger)

### 🔹 Frontend
- React
- React Router
- Axios
- Recharts
- CSS Modules
- Design System próprio

---

## 🔐 Autenticação

- Login com JWT
- Token armazenado no `localStorage`
- Interceptor Axios injeta `Authorization: Bearer <token>`
- Rotas protegidas com `ProtectedRoute`

---

## 📅 Funcionalidades

### ✔️ Agendamentos
- Grade horária diária
- Validação de conflitos
- Modal de criação e detalhes
- Remoção controlada

### ✔️ Clientes
- CRUD completo
- Modal de detalhes
- Histórico e métricas financeiras

### ✔️ Massagistas
- CRUD completo
- Observações
- Controle de status

### ✔️ Equipamentos
- CRUD completo
- Disponibilidade
- Observações

### ✔️ Dashboard
- Indicadores gerais
- Equipamentos disponíveis
- Ações rápidas

### ✔️ Relatórios
- Filtro por período
- Gráficos com Recharts
- Indicadores financeiros

---

## 📊 API – Documentação

Swagger disponível em:
```
http://localhost:8080/swagger-ui.html
```

---

## ⚙️ Configuração de Ambiente

Utiliza profiles `dev` e `prod` com variáveis de ambiente.

---

## 🚀 Executando o Projeto

### Backend
```bash
./mvnw spring-boot:run
```

### Frontend
```bash
npm install
npm run dev
```

---

## 📁 Estrutura

```
backend/
frontend/
```

---

## 👨‍💻 Autor

Desenvolvido por **Gustavo Medeiros**  
Projeto de portfólio profissional.

---

import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ProjectProvider } from './context/ProjectContext';

// --------- Layouts de Revelación Progresiva ---------
import { PublicLayout } from './layouts/PublicLayout';
import { GlobalLayout } from './layouts/GlobalLayout';
import { FocusLayout } from './layouts/FocusLayout';

// --------- Vistas Públicas ---------
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import FormInjectableView from './pages/public/FormInjectableView';
import ClientPortal from './pages/client/ClientPortal';
import { PublicLeadForm } from './pages/public/PublicLeadForm';

// --------- Vistas de Negocio (Global) ---------
import CrmDashboard from './pages/crm/CrmDashboard';
import TeamManagement from './pages/team/TeamManagement';
import Dashboard from './pages/dashboard/Dashboard';
import ProjectsList from './pages/projects/ProjectsList';
import Vault from './pages/vault/Vault';
import Portfolio from './pages/portfolio/Portfolio';
import { PromptLibrary } from './pages/vault/PromptLibrary';
import { FormLibrary } from './pages/vault/FormLibrary';
import { StandardLibrary } from './pages/vault/StandardLibrary';

// --------- Vistas del Taller (Fases) ---------
import Phase0Feasibility from './pages/projects/Phase0Feasibility';
import Phase1Requirements from './pages/projects/Phase1Requirements';
import Phase2Design from './pages/projects/Phase2Design';
import Phase3Implementation from './pages/projects/Phase3Implementation';
import Phase4Testing from './pages/projects/Phase4Testing';
import Phase5Deployment from './pages/projects/Phase5Deployment';
import ProjectDashboard from './pages/projects/ProjectDashboard';

export default function App() {
  return (
    <ProjectProvider>
      <BrowserRouter>
        <Routes>
          {/* --- 1. Rutas Públicas (Sin Sidebar, Estilo Minimalista) --- */}
          <Route element={<Outlet />}>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/form/:template_id" element={<FormInjectableView />} />
            <Route path="/public-form/:tenantId" element={<PublicLeadForm />} />
            <Route path="/public/lead/:projectId" element={<PublicLeadForm />} />
            <Route path="/client/:magic_token" element={<ClientPortal />} />
          </Route>

          {/* --- 2. Rutas del Ecosistema Global (Con Sidebar Persistente) --- */}
          <Route element={<GlobalLayout children={<Outlet />} />}>
            <Route path="/app/dashboard" element={<Dashboard />} />
            <Route path="/app/projects" element={<ProjectsList />} />
            <Route path="/app/crm/leads" element={<CrmDashboard />} />
            <Route path="/app/crm/clients" element={<CrmDashboard />} />
            <Route path="/app/team" element={<TeamManagement />} />
            <Route path="/app/vault" element={<Vault />} />
            <Route path="/app/vault/prompts" element={<PromptLibrary />} />
            <Route path="/app/vault/forms" element={<FormLibrary />} />
            <Route path="/app/vault/standards" element={<StandardLibrary />} />
            <Route path="/app/portfolio" element={<Portfolio />} />
          </Route>

          {/* --- 3. Rutas del Taller (Modo Enfoque con Phase Stepper) --- */}
          {/* Usamos un wrapper funcional para inyectar el título de fase dinámicamente si fuera necesario, 
              o dejamos que el layout lo gestione */}
          <Route path="/projects/:id" element={<FocusLayout phaseTitle="Context Hub" children={<ProjectDashboard />} />} />
          
          <Route path="/projects/:id/phase-0-feasibility" element={<FocusLayout phaseTitle="ADN" children={<Phase0Feasibility />} />} />
          <Route path="/projects/:id/phase-1-requirements" element={<FocusLayout phaseTitle="Requisitos" children={<Phase1Requirements />} />} />
          <Route path="/projects/:id/phase-2-design" element={<FocusLayout phaseTitle="Diseño" children={<Phase2Design />} />} />
          <Route path="/projects/:id/phase-3-implementation" element={<FocusLayout phaseTitle="Desarrollo" children={<Phase3Implementation />} />} />
          <Route path="/projects/:id/phase-4-testing" element={<FocusLayout phaseTitle="Testing" children={<Phase4Testing />} />} />
          <Route path="/projects/:id/phase-5-deploy" element={<FocusLayout phaseTitle="Cosecha" children={<Phase5Deployment />} />} />

          {/* Fallback General */}
          <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ProjectProvider>
  );
}

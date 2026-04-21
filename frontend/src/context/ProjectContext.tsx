import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface ProjectContextType {
  projectId: string | null;
  tenantId: string | null;
  projectName: string | null;
  setProject: (id: string, name: string) => void;
  setTenant: (id: string) => void;
  isLoading: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(localStorage.getItem('mc_current_tenant'));
  const [projectName, setProjectName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Usamos el ID del usuario como tenantId por defecto si no hay uno persistido
        const currentTenant = localStorage.getItem('mc_current_tenant') || session.user.id;
        setTenantId(currentTenant);
        localStorage.setItem('mc_current_tenant', currentTenant);
      }
      setIsLoading(false);
    };

    fetchSession();
  }, []);

  const setProject = (id: string, name: string) => {
    setProjectId(id);
    setProjectName(name);
  };

  const setTenant = (id: string) => {
    setTenantId(id);
    localStorage.setItem('mc_current_tenant', id);
    // Al cambiar de espacio, limpiamos el proyecto actual
    setProjectId(null);
    setProjectName(null);
  };

  return (
    <ProjectContext.Provider value={{ projectId, tenantId, projectName, setProject, setTenant, isLoading }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

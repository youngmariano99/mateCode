import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface ProjectContextType {
  projectId: string | null;
  tenantId: string | null;
  projectName: string | null;
  setProject: (id: string, name: string) => void;
  isLoading: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // En un entorno multi-tenant real, el tenant_id vendría en el metadata del usuario o una tabla de perfiles.
        // Simulamos la extracción del tenant_id asociado al usuario.
        const userTenantId = session.user.user_metadata?.tenant_id || "8226487e-d4eb-48b5-bf27-f4728562725e";
        setTenantId(userTenantId);
      }
      setIsLoading(false);
    };

    fetchSession();
  }, []);

  const setProject = (id: string, name: string) => {
    setProjectId(id);
    setProjectName(name);
  };

  return (
    <ProjectContext.Provider value={{ projectId, tenantId, projectName, setProject, isLoading }}>
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

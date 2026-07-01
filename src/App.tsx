import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/ui/Layout';
import { LoginPortal } from './components/ui/LoginPortal';
import { DashboardModule } from './features/dashboard/DashboardModule';
import { ClientsModule } from './features/clients/ClientsModule';
import { CatalogModule } from './features/catalog/CatalogModule';
import { QuotationsModule } from './features/quotations/QuotationsModule';
import { InvoicesModule } from './features/invoices/InvoicesModule';
import { JobsModule } from './features/jobs/JobsModule';
import { ProjectsModule } from './features/projects/ProjectsModule';
import { SelfTestsModule } from './features/selftests/SelfTestsModule';
import { SettingsModule } from './features/settings/SettingsModule';

function AppContent() {
  const { isLoggedOut, activeTab, setActiveTab } = useApp();

  if (isLoggedOut) {
    return <LoginPortal />;
  }

  const renderActiveModule = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardModule />;
      case 'clients':
        return <ClientsModule />;
      case 'catalog':
        return <CatalogModule />;
      case 'quotations':
        return <QuotationsModule />;
      case 'invoices':
        return <InvoicesModule />;
      case 'jobs':
        return <JobsModule />;
      case 'projects':
        return <ProjectsModule />;
      case 'selftests':
        return <SelfTestsModule />;
      case 'settings':
        return <SettingsModule />;
      default:
        return <DashboardModule />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderActiveModule()}
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

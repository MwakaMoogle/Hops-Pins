import React from 'react';
import Layout from './Layout';

type TemplateProps = {
  children: React.ReactNode;
  title?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  headerRight?: React.ReactNode;
  contentStyle?: object;
};

/**
 * Thin wrapper around Layout so screens import TemplateScreen.
 * Keeps a single place to extend or swap the app template later.
 */
const TemplateScreen: React.FC<TemplateProps> = ({ children, ...layoutProps }) => {
  return <Layout {...layoutProps}>{children}</Layout>;
};

export default TemplateScreen;
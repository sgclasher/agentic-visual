'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import Link from 'next/link';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load the AgentFlow component to improve initial page load
const AgentFlow = dynamic(() => import('./components/AgentFlow'), {
  ssr: false, // Disable SSR since ReactFlow doesn't support it well
  loading: () => <div className="h-64 flex items-center justify-center bg-gray-100 rounded-lg">Loading visualization...</div>
});

// Animation variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function Home() {
  // Feature cards data
  const featureCards = [
    {
      title: "Executive View",
      description: "Business-focused visualization of agentic workflows showing process flow and impact metrics.",
      href: "/executive-view",
      icon: "📊"
    },
    {
      title: "Use Case Comparison",
      description: "Compare multiple use cases side by side to analyze agent capabilities and requirements.",
      href: "/use-case-comparison",
      icon: "🔍"
    },
    {
      title: "Detailed Diagrams",
      description: "Visualize individual use cases with their agents, tools, triggers and relationships.",
      href: "/use-case-view",
      icon: "🔗"
    }
  ];

  return (
    <ErrorBoundary>
      <main className="flex min-h-screen flex-col p-6 md:p-12">
        <div className="max-w-5xl mx-auto w-full">
          <motion.section 
            className="mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-blue-800">
              ServiceNow<br/>
              <span className="text-3xl md:text-4xl">Agentic AI Visualization</span>
            </h1>
            
            <p className="text-lg md:text-xl mb-8 text-gray-700 max-w-3xl">
              Visualize and explore ServiceNow Agentic AI workflows, including agents, tools, capabilities, and process flows.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/dashboard" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors"
              >
                Go to Dashboard
              </Link>
              
              <Link 
                href="/config" 
                className="border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 px-6 rounded-lg text-center transition-colors"
              >
                Configure Connection
              </Link>
            </div>
          </motion.section>
          
          <motion.section 
            className="grid md:grid-cols-3 gap-6 mb-12"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {featureCards.map((card, index) => (
              <motion.div 
                key={card.title}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                variants={itemVariants}
              >
                <div className="text-3xl mb-3">{card.icon}</div>
                <h2 className="text-xl font-semibold mb-3 text-blue-700">{card.title}</h2>
                <p className="text-gray-600 mb-4">
                  {card.description}
                </p>
                <Link 
                  href={card.href} 
                  className="text-blue-600 font-medium hover:underline inline-flex items-center"
                >
                  View {card.title} <span className="ml-1">→</span>
                </Link>
              </motion.div>
            ))}
          </motion.section>
          
          <motion.section 
            className="bg-blue-50 rounded-lg p-6 mb-12"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <h2 className="text-xl font-semibold mb-3 text-blue-700">About This Tool</h2>
            <p className="text-gray-700 mb-4">
              This visualization tool helps you understand ServiceNow's Agentic AI capabilities, including:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>AI Agents - The core autonomous workers that execute specific tasks</li>
              <li>Agent Tools - The capabilities each agent can use to complete tasks</li>
              <li>Use Cases - Specific business scenarios where Agentic AI is applied</li>
              <li>Triggers - The conditions that initiate agent execution</li>
              <li>GenAI Config - The LLM configurations associated with agent capabilities</li>
            </ul>
            <p className="text-gray-700">
              To get started, click "Go to Dashboard" and fetch the latest Agentic AI data from your ServiceNow instance.
            </p>
          </motion.section>
        </div>
      </main>
    </ErrorBoundary>
  );
} 
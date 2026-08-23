import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function TermsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="w-full grow z-10 relative pt-32 pb-24 md:pt-48 md:pb-32 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-5xl md:text-7xl font-medium tracking-tight mb-16 text-text-primary">
            Terms of Service
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="prose prose-lg dark:prose-invert prose-headings:font-medium prose-a:text-amber-600 dark:prose-a:text-[#E8BA35] text-text-secondary max-w-none"
        >
          <p className="lead text-xl md:text-2xl mb-12 text-text-primary font-light">
            Welcome to Mitra. These Terms of Service outline the rules and regulations for the use of our application and services.
          </p>

          <h2 className="text-2xl mt-12 mb-4 text-text-primary">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the Mitra app, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the service.
          </p>

          <h2 className="text-2xl mt-12 mb-4 text-text-primary">2. User Responsibilities</h2>
          <p>
            You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password. You agree not to disclose your password to any third party.
          </p>
          <p>
            You may not use the service for any illegal or unauthorized purpose nor may you, in the use of the service, violate any laws in your jurisdiction.
          </p>

          <h2 className="text-2xl mt-12 mb-4 text-text-primary">3. Intellectual Property</h2>
          <p>
            The service and its original content, features, and functionality are and will remain the exclusive property of Mitra AI and its licensors. The service is protected by copyright, trademark, and other laws of both the United States and foreign countries.
          </p>

          <h2 className="text-2xl mt-12 mb-4 text-text-primary">4. Termination</h2>
          <p>
            We may terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
          </p>

          <h2 className="text-2xl mt-12 mb-4 text-text-primary">5. Limitation of Liability</h2>
          <p>
            In no event shall Mitra AI, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
          </p>

          <div className="mt-20 pt-8 border-t border-border">
            <p className="text-sm">
              If you have any questions about these Terms, please contact us at <a href="mailto:legal@mitra.ai">legal@mitra.ai</a>.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

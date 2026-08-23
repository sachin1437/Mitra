import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="prose prose-lg dark:prose-invert prose-headings:font-medium prose-a:text-amber-600 dark:prose-a:text-[#E8BA35] text-text-secondary max-w-none"
        >
          <p className="lead text-xl md:text-2xl mb-12 text-text-primary font-light">
            At Mitra, we believe your data is yours alone. Our architecture is designed to protect your privacy by default, ensuring your conversations remain confidential.
          </p>

          <h2 className="text-2xl mt-12 mb-4 text-text-primary">1. Information We Collect</h2>
          <p>
            When you use Mitra, we collect minimal information necessary to provide you with our services. This includes basic account information (such as your email address) and the conversations you have with Mitra.
          </p>
          <p>
            Unlike traditional platforms, Mitra employs local processing where possible, meaning a significant portion of your interactions never leaves your device.
          </p>

          <h2 className="text-2xl mt-12 mb-4 text-text-primary">2. How We Use Your Data</h2>
          <p>
            The data we collect is used exclusively to improve your experience with Mitra. We do not sell, rent, or trade your personal information or conversation history to third parties for advertising or any other purposes.
          </p>
          
          <h2 className="text-2xl mt-12 mb-4 text-text-primary">3. Data Security and Encryption</h2>
          <p>
            All data transmitted between your device and our servers is secured using industry-standard encryption protocols. We utilize robust security measures to prevent unauthorized access to your account and personal data.
          </p>

          <h2 className="text-2xl mt-12 mb-4 text-text-primary">4. Your Rights</h2>
          <p>
            You have full control over your data. You can export your conversation history, request deletion of your account, or opt-out of optional data collection directly from the settings menu within the Mitra app.
          </p>

          <h2 className="text-2xl mt-12 mb-4 text-text-primary">5. Changes to This Policy</h2>
          <p>
            We may update our Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any significant changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </p>

          <div className="mt-20 pt-8 border-t border-border">
            <p className="text-sm">
              If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@mitra.ai">privacy@mitra.ai</a>.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout';

const sections = [
    {
        title: '1. Acceptance of Terms',
        content: `By accessing or using Quick Staff Hiring Portal, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this platform.`
    },
    {
        title: '2. Use of Services',
        content: `Our platform connects clients seeking temporary or gig workers with individuals offering their services. You agree to:
    • Provide accurate and complete information when creating an account
    • Maintain the security of your account credentials
    • Use the platform only for lawful purposes
    • Not misrepresent your identity, skills, or qualifications
    • Comply with all applicable laws and regulations`
    },
    {
        title: '3. User Accounts',
        content: `You are responsible for maintaining the confidentiality of your account and password. You agree to:
    • Accept responsibility for all activities that occur under your account
    • Notify us immediately of any unauthorized use
    • Not share your account with others
    • Keep your profile information current and accurate`
    },
    {
        title: '4. Worker Responsibilities',
        content: `If you register as a worker, you agree to:
    • Provide accurate information about your skills and experience
    • Complete accepted jobs to the best of your ability
    • Communicate professionally with clients
    • Arrive on time for scheduled work
    • Follow all safety guidelines and client instructions
    • Report any issues or concerns promptly`
    },
    {
        title: '5. Client Responsibilities',
        content: `If you register as a client, you agree to:
    • Provide accurate job descriptions and requirements
    • Offer fair compensation for work performed
    • Provide a safe working environment
    • Pay workers promptly through our platform
    • Treat workers with respect and professionalism
    • Report any issues or concerns promptly`
    },
    {
        title: '6. Payments and Fees',
        content: `All payments are processed through our secure platform:
    • Workers receive payment after job completion confirmation
    • A service fee is deducted from transactions
    • Payment disputes must be reported within 48 hours
    • We are not responsible for tax obligations
    • Refunds are handled on a case-by-case basis`
    },
    {
        title: '7. Prohibited Activities',
        content: `Users may not:
    • Circumvent the platform to avoid fees
    • Engage in fraudulent or deceptive practices
    • Harass, threaten, or discriminate against others
    • Post false, misleading, or defamatory content
    • Violate intellectual property rights
    • Attempt to hack or disrupt the platform
    • Use the platform for illegal activities`
    },
    {
        title: '8. Intellectual Property',
        content: `The Quick Staff Hiring Portal name, logo, and all related content are protected by intellectual property laws. You may not use, copy, or distribute our content without written permission.`
    },
    {
        title: '9. Limitation of Liability',
        content: `Quick Staff Hiring Portal is not liable for:
    • Actions or conduct of users on the platform
    • Quality of work performed by workers
    • Disputes between workers and clients
    • Loss of data or service interruptions
    • Any indirect, incidental, or consequential damages

    We act as a platform to connect users and are not a party to agreements between workers and clients.`
    },
    {
        title: '10. Termination',
        content: `We reserve the right to suspend or terminate your account at any time for violations of these terms or for any other reason at our discretion. Upon termination, your right to use the platform ceases immediately.`
    },
    {
        title: '11. Changes to Terms',
        content: `We may modify these Terms of Service at any time. We will notify users of significant changes via email or platform notification. Continued use of the platform after changes constitutes acceptance of the new terms.`
    },
    {
        title: '12. Governing Law',
        content: `These terms are governed by the laws of the State of New York, without regard to conflict of law principles. Any disputes shall be resolved in the courts of New York County, New York.`
    },
];

export default function TermsOfServicePage() {
    return (
        <PublicLayout>
            <div className="flex flex-col min-h-screen bg-background-light text-text-light font-display">

                {/* Hero Section */}
                <section className="relative bg-background-dark py-20 px-4 sm:px-6 lg:px-8 text-white overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#005a9c] to-[#003d6b] opacity-90"></div>
                    </div>
                    <div className="relative z-10 max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 mt-16">
                            Terms of Service
                        </h1>
                        <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
                            Please read these terms carefully before using Quick Staff Hiring Portal.
                        </p>
                        <p className="text-blue-200 text-sm mt-6">Effective Date: December 10, 2024</p>
                    </div>
                </section>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16">

                    {/* Terms Sections */}
                    <div className="space-y-6">
                        {sections.map((section, index) => (
                            <div key={index} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                                <h2 className="text-xl font-bold mb-4 text-primary">{section.title}</h2>
                                <div className="text-subtle-light leading-relaxed whitespace-pre-line">
                                    {section.content}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Contact Section */}
                    <div className="mt-12 bg-primary/5 rounded-2xl p-8 border border-primary/10">
                        <h2 className="text-xl font-bold mb-4">Questions About These Terms?</h2>
                        <p className="text-subtle-light mb-4">
                            If you have any questions about these Terms of Service, please contact our legal team:
                        </p>
                        <ul className="text-subtle-light space-y-2">
                            <li>Email: legal@quickstaff.com</li>
                            <li>Address: 123 Business Avenue, New York, NY 10001</li>
                        </ul>
                        <Link
                            to="/contact"
                            className="inline-flex items-center justify-center px-6 py-3 mt-6 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            Contact Us
                        </Link>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}

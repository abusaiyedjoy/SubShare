"use client";

import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        product: [
            { label: "Features", href: "/features" },
            { label: "Pricing", href: "/pricing" },
            { label: "How it Works", href: "/how-it-works" },
            { label: "FAQ", href: "/faq" },
        ],
        company: [
            { label: "About Us", href: "/about" },
            { label: "Blog", href: "/blog" },
            { label: "Careers", href: "/careers" },
            { label: "Contact", href: "/contact" },
        ],
        legal: [
            { label: "Privacy Policy", href: "/privacy" },
            { label: "Terms of Service", href: "/terms" },
            { label: "Cookie Policy", href: "/cookies" },
            { label: "Refund Policy", href: "/refund" },
        ],
        support: [
            { label: "Help Center", href: "/help-center" },
            { label: "Community", href: "/community" },
            { label: "Report Issue", href: "/report" },
            { label: "Status", href: "/status" },
        ],
    };

    const socialLinks = [
        { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
        { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
        { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
        { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
    ];

    return (
        <footer className="border-t border-white/5 bg-[#0A1628]/80 backdrop-blur-lg">
            <div className="container mx-auto px-4 py-12 lg:px-8">
                {/* Main Footer Content */}
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-6">
                    {/* Brand Section */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="flex items-center space-x-2 mb-4 group">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary transition-transform group-hover:scale-110">
                                <span className="text-xl font-bold text-[#0A1628]">S</span>
                            </div>
                            <span className="text-xl font-bold text-white">ShareIt</span>
                        </Link>
                        <p className="mb-4 text-sm text-gray-400 max-w-sm">
                            Share and access premium subscription services at a fraction of the cost. Join thousands of users saving money together.
                        </p>

                        {/* Contact Info */}
                        <div className="space-y-2 text-sm text-gray-400">
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-[#00D9B4]" />
                                <a href="mailto:support@shareit.com" className="hover:text-[#00D9B4] transition-colors">
                                    support@shareit.com
                                </a>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-[#00D9B4]" />
                                <a href="tel:+1234567890" className="hover:text-[#00D9B4] transition-colors">
                                    +1 (234) 567-890
                                </a>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-[#00D9B4]" />
                                <span>San Francisco, CA</span>
                            </div>
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold text-white uppercase tracking-wider">Product</h3>
                        <ul className="space-y-2">
                            {footerLinks.product.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-gray-400 hover:text-[#00D9B4] transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold text-white uppercase tracking-wider">Company</h3>
                        <ul className="space-y-2">
                            {footerLinks.company.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-gray-400 hover:text-[#00D9B4] transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold text-white uppercase tracking-wider">Legal</h3>
                        <ul className="space-y-2">
                            {footerLinks.legal.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-gray-400 hover:text-[#00D9B4] transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support Links */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold text-white uppercase tracking-wider">Support</h3>
                        <ul className="space-y-2">
                            {footerLinks.support.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-gray-400 hover:text-[#00D9B4] transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Newsletter Section */}
                <div className="mt-12 border-t border-white/5 pt-8">
                    <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                        <div className="text-center md:text-left">
                            <h3 className="mb-2 text-lg font-semibold text-white">Stay Updated</h3>
                            <p className="text-sm text-gray-400">Subscribe to our newsletter for the latest updates and offers.</p>
                        </div>
                        <div className="flex w-full max-w-md gap-2">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="h-10 flex-1 rounded-lg bg-white/5 px-4 text-sm text-white placeholder-gray-400 border border-white/10 focus:bg-white/10 focus:border-[#00D9B4] transition-all"
                            />
                            <button className="rounded-lg gradient-primary px-6 py-2 text-sm font-semibold text-[#0A1628] transition-all hover:shadow-glow-primary hover:scale-105">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-8 border-t border-white/5 pt-8">
                    <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                        {/* Copyright */}
                        <p className="text-sm text-gray-400">
                            &copy; {currentYear} ShareIt. All rights reserved.
                        </p>

                        {/* Social Links */}
                        <div className="flex items-center gap-4">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-gray-400 transition-all hover:bg-[#00D9B4]/20 hover:text-[#00D9B4] border border-white/10"
                                    aria-label={social.label}
                                >
                                    <social.icon className="h-4 w-4" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
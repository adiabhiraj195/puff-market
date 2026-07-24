import React from "react";

const Footer: React.FC = () => {
    return (
        <footer className="bg-black text-white py-10 w-full border-t border-gray-500">
            <div className="container mx-auto">
                <div className="flex flex-col md:flex-row justify-between">
                    {/* Logo and About */}
                    <div className="mb-6 md:mb-0">
                        <h2 className="text-xl font-bold mb-4">Puff Market</h2>
                        <p className="text-gray-400">
                            Discover, buy, and sell exclusive digital assets on the leading NFT marketplace.
                        </p>
                    </div>

                    {/* Navigation Links */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Company</h3>
                            <ul>
                                <li className="mb-2">
                                    <a href="/about" className="text-gray-400 hover:text-white">
                                        About Us
                                    </a>
                                </li>
                                <li className="mb-2">
                                    <a href="/blog" className="text-gray-400 hover:text-white">
                                        Blog
                                    </a>
                                </li>
                                <li className="mb-2">
                                    <a href="/careers" className="text-gray-400 hover:text-white">
                                        Careers
                                    </a>
                                </li>
                                <li>
                                    <a href="/contact" className="text-gray-400 hover:text-white">
                                        Contact Us
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-4">Support</h3>
                            <ul>
                                <li className="mb-2">
                                    <a href="/help" className="text-gray-400 hover:text-white">
                                        Help Center
                                    </a>
                                </li>
                                <li className="mb-2">
                                    <a href="/faq" className="text-gray-400 hover:text-white">
                                        FAQ
                                    </a>
                                </li>
                                <li className="mb-2">
                                    <a href="/guides" className="text-gray-400 hover:text-white">
                                        Guides
                                    </a>
                                </li>
                                <li>
                                    <a href="/privacy" className="text-gray-400 hover:text-white">
                                        Privacy Policy
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-4">Community</h3>
                            <ul>
                                <li className="mb-2">
                                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                                        Twitter
                                    </a>
                                </li>
                                <li className="mb-2">
                                    <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                                        Discord
                                    </a>
                                </li>
                                <li className="mb-2">
                                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                                        Instagram
                                    </a>
                                </li>
                                <li>
                                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                                        LinkedIn
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="mt-8 border-t border-gray-700 pt-6 text-center text-sm text-gray-400">
                    <p>&copy; {new Date().getFullYear()} Puff Market. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
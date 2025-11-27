"use client";

import { useState, useEffect, useRef } from "react";
import { X, Phone, Mail, User, Sparkles, TabletSmartphone, CheckCircle } from "lucide-react";
import { toast } from "sonner";

// Global flag to prevent multiple popup instances
let globalIsOpen = false;

export function DiscountPopup() {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        device: "",
        issue: "Discount Inquiry",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Sync local state with global flag
    useEffect(() => {
        if (isOpen) {
            globalIsOpen = true;
        } else {
            globalIsOpen = false;
        }
    }, [isOpen]);

    // Prevent multiple instances by checking global flag on mount
    useEffect(() => {

        // Check if user has already submitted
        const hasSubmitted = localStorage.getItem("discount_submitted");

        if (hasSubmitted) {
            return; // Don't show popup if already submitted
        }


        // Show popup initially after 5 seconds
        const initialTimeout = setTimeout(() => {
            if (!globalIsOpen) {
                setIsOpen(true);
            } else {
            }
        }, 5000);

        return () => {
            clearTimeout(initialTimeout);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        globalIsOpen = false;

        // Clear any existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        // Check if user has already submitted
        const hasSubmitted = localStorage.getItem("discount_submitted");
        if (hasSubmitted) {
            return; // Don't show popup again if already submitted
        }

        // Show popup again after 5 seconds
        timeoutRef.current = setTimeout(() => {
            if (!globalIsOpen) {
                setIsOpen(true);
            }
            timeoutRef.current = null;
        }, 5000); // 5 seconds
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    message: `Discount inquiry for ${formData.device}`,
                }),
            });

            if (response.ok) {
                // Show success animation
                setShowSuccess(true);
                toast.success("Thank you! We'll contact you soon with exclusive discount details.");
                
                // Mark as submitted in localStorage
                localStorage.setItem("discount_submitted", "true");
                
                // Close popup after success animation (2 seconds)
                setTimeout(() => {
                    setIsOpen(false);
                    globalIsOpen = false;
                    setShowSuccess(false);
                    setFormData({ name: "", email: "", phone: "", device: "", issue: "Discount Inquiry" });
                }, 2000);
            } else {
                toast.error("Something went wrong. Please try again.");
            }
        } catch (error) {
            toast.error("Failed to submit. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] animate-in fade-in duration-200"
                onClick={handleClose}
            />

            {/* Popup - Compact Horizontal Design */}
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-8 pointer-events-none">
                <div
                    className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl pointer-events-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex flex-col md:flex-row">
                        {/* Left Section - Green Banner */}
                        <div className="relative bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 text-white p-6 md:p-8 md:w-2/5 flex flex-col justify-center">
                            <button
                                onClick={handleClose}
                                type="button"
                                className="absolute top-3 right-3 p-1.5 hover:bg-white/20 rounded-full transition-colors"
                                aria-label="Close popup"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2.5 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <Sparkles className="h-7 w-7" />
                                </div>
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-bold leading-tight">Special Offer!</h2>
                                </div>
                            </div>

                            <div className="space-y-2 mt-2">
                                <p className="text-lg md:text-xl font-semibold">
                                    Get Better Discount Offers
                                </p>
                                <p className="text-white/90 text-sm leading-relaxed">
                                    Fill out the form and receive exclusive discount codes for your mobile repair. Save more on quality service!
                                </p>
                            </div>

                            {/* Decorative Elements */}
                            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full -mb-16 -mr-16"></div>
                            <div className="absolute top-0 left-0 w-24 h-24 bg-white/5 rounded-full -mt-12 -ml-12"></div>
                        </div>

                        {/* Right Section - Form or Success */}
                        {showSuccess ? (
                            <div className="p-6 md:p-8 md:w-3/5 flex flex-col items-center justify-center space-y-6 text-center">
                                {/* Success Animation */}
                                <div className="relative">
                                    <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center animate-bounce">
                                        <svg
                                            className="w-10 h-10 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={3}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </div>
                                    {/* Success particles/rings */}
                                    <div className="absolute inset-0 rounded-full border-4 border-emerald-400 animate-ping opacity-20"></div>
                                    <div className="absolute inset-2 rounded-full border-2 border-emerald-300 animate-ping opacity-40 animation-delay-100"></div>
                                </div>

                                {/* Success Message */}
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2">
                                        <CheckCircle className="h-8 w-8 text-emerald-600" />
                                        Success!
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        Your discount inquiry has been submitted successfully!
                                    </p>
                                    <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                                        We'll contact you soon with exclusive offers.
                                    </p>
                                </div>

                                {/* Closing countdown */}
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Closing in a moment...
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="p-6 md:p-8 md:w-3/5 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Name Field */}
                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="name"
                                        className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 uppercase tracking-wide"
                                    >
                                        <User className="h-3.5 w-3.5 text-emerald-600" />
                                        Your Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="John Doe"
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                                    />
                                </div>

                                {/* Email Field */}
                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="email"
                                        className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 uppercase tracking-wide"
                                    >
                                        <Mail className="h-3.5 w-3.5 text-emerald-600" />
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="john@example.com"
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                                    />
                                </div>

                                {/* Phone Field */}
                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="phone"
                                        className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 uppercase tracking-wide"
                                    >
                                        <Phone className="h-3.5 w-3.5 text-emerald-600" />
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        placeholder="+1 (555) 000-0000"
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                                    />
                                </div>

                                {/* Device Field */}
                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="device"
                                        className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 uppercase tracking-wide"
                                    >
                                        <TabletSmartphone className="h-3.5 w-3.5 text-emerald-600" />
                                        Device Model
                                    </label>
                                    <input
                                        type="text"
                                        id="device"
                                        name="device"
                                        value={formData.device}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g., iPhone 14 Pro"
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-gradient-to-r from-emerald-500 via-green-600 to-teal-600 hover:from-emerald-600 hover:via-green-700 hover:to-teal-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg
                                            className="animate-spin h-4 w-4"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                        Sending...
                                    </span>
                                ) : (
                                    "Claim Your Discount Now!"
                                )}
                            </button>

                            {/* Privacy Note */}
                            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">
                                We respect your privacy. Your information will only be used to send you exclusive discount offers.
                            </p>
                        </form>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

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

            {/* Popup - Vertical Centered Design */}
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-8 pointer-events-none">
                <div
                    className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header Section */}
                    <div className="relative bg-[#15A349] text-white p-5 flex flex-col items-center text-center">
                        <button
                            onClick={handleClose}
                            type="button"
                            className="absolute top-3 right-3 p-1.5 hover:bg-white/20 rounded-full transition-colors"
                            aria-label="Close popup"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-2 bg-white/20 rounded-full">
                                <Sparkles className="h-6 w-6" />
                            </div>
                            <h2 className="text-2xl font-bold">Special Offer!</h2>
                        </div>

                        <div className="space-y-1">
                            <p className="text-lg font-semibold">Get Better Discounts</p>
                            <p className="text-white/90 text-sm leading-tight max-w-xs">
                                Submit your details for exclusive mobile repair discount codes.
                            </p>
                        </div>
                    </div>

                    {/* Form or Success Section */}
                    {showSuccess ? (
                        <div className="p-6 flex flex-col items-center justify-center space-y-4 text-center">
                            {/* Success Animation */}
                            <div className="relative">
                                <div className="w-16 h-16 bg-[#15A349] rounded-full flex items-center justify-center animate-pulse">
                                    <CheckCircle className="h-8 w-8 text-white" />
                                </div>
                                <div className="absolute inset-0 rounded-full border-2 border-[#15A349] animate-ping opacity-30"></div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Success!
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm">
                                    Your inquiry is submitted. Expect exclusive offers soon!
                                </p>
                                <p className="text-xs text-[#15A349] font-medium">
                                    We'll reach out via email or phone.
                                </p>
                            </div>

                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                Closing soon...
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="p-5 space-y-3">
                            {/* Name & Email Row */}
                            <div className="grid grid-cols-1 gap-3">
                                <div className="space-y-1">
                                    <label htmlFor="name" className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                        <User className="h-3 w-3 text-[#15A349]" />
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Sarah Thompson"
                                        className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-[#15A349] focus:border-transparent transition-all"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label htmlFor="email" className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                        <Mail className="h-3 w-3 text-[#15A349]" />
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="sarah.thompson@gmail.com"
                                        className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-[#15A349] focus:border-transparent transition-all"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label htmlFor="phone" className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                        <Phone className="h-3 w-3 text-[#15A349]" />
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        placeholder="+1 (555) 123-4567"
                                        className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-[#15A349] focus:border-transparent transition-all"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label htmlFor="device" className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                        <TabletSmartphone className="h-3 w-3 text-[#15A349]" />
                                        Device
                                    </label>
                                    <input
                                        type="text"
                                        id="device"
                                        name="device"
                                        value={formData.device}
                                        onChange={handleChange}
                                        required
                                        placeholder="iPhone 14 Pro"
                                        className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-[#15A349] focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-[#15A349] hover:bg-[#0F8B3A] text-white font-semibold py-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg text-sm"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Sending...
                                    </span>
                                ) : (
                                    "Claim Discount!"
                                )}
                            </button>

                            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                                Privacy assured. Info used only for discount offers.
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
}
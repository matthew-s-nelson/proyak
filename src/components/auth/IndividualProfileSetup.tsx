import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";

interface ProfileFormData {
    bio: string;
    location: string;
    phoneNumber: string;
    workPreference: string[];
    workTime: string[];
    experienceLevel: string;
    desiredSalary: string;
    availability: string;
}

const IndividualProfileSetup: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<ProfileFormData>({
        bio: "",
        location: "",
        phoneNumber: "",
        workPreference: [],
        workTime: [],
        experienceLevel: "",
        desiredSalary: "",
        availability: "",
    });

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Generic checkbox handler for both workPreference and workTime
    const handleCheckboxChange = (
        field: keyof Pick<ProfileFormData, "workPreference" | "workTime">,
        value: string
    ) => {
        setFormData((prev) => {
            const current = prev[field] as string[];
            const updated = current.includes(value)
                ? current.filter((item) => item !== value)
                : [...current, value];

            return {
                ...prev,
                [field]: updated,
            } as ProfileFormData;
        });
    };

    const handleNextStep = () => {
        if (currentStep < 3) setCurrentStep(currentStep + 1);
    };

    const handlePrevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // Save profile data to Supabase
            const { error: updateError } = await supabase
                .from("profiles")
                .upsert(
                    {
                        user_id: user?.id,
                        bio: formData.bio,
                        location: formData.location,
                        phone_number: formData.phoneNumber,
                        work_preference: formData.workPreference,
                        work_time: formData.workTime,
                        experience_level: formData.experienceLevel,
                        desired_salary: formData.desiredSalary,
                        availability: formData.availability,
                        updated_at: new Date().toISOString(),
                    },
                    {
                        onConflict: "user_id", //added this for testing purposes. will overwrite existing profile if user_id already exists
                    }
                );

            if (updateError) throw updateError;

            // Redirect to dashboard or home
            navigate("/");
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to save profile"
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "2rem",
            }}
        >
            <div
                style={{
                    backgroundColor: "white",
                    borderRadius: "12px",
                    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                    maxWidth: "700px",
                    width: "100%",
                    overflow: "hidden",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "white",
                        padding: "2.5rem 2rem",
                        textAlign: "center",
                    }}
                >
                    <h1
                        style={{
                            fontSize: "2rem",
                            fontWeight: "700",
                            margin: "0 0 0.5rem 0",
                        }}
                    >
                        Tell us about yourself!
                    </h1>
                    <p
                        style={{
                            fontSize: "1rem",
                            opacity: 0.95,
                            margin: 0,
                            lineHeight: "1.5",
                        }}
                    >
                        Help employers connect to a new you. We're really
                        excited to learn more about your professional journey!
                        Let's set up your profile so we can match you with the
                        perfect job opportunities that fit your skills and
                        goals.
                    </p>
                </div>

                {/* Progress Steps */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        padding: "2rem 2rem 0",
                        gap: "1rem",
                    }}
                >
                    {[1, 2, 3].map((step) => (
                        <div
                            key={step}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                            }}
                        >
                            <div
                                style={{
                                    width: "32px",
                                    height: "32px",
                                    borderRadius: "50%",
                                    backgroundColor:
                                        currentStep >= step
                                            ? "#667eea"
                                            : "#e5e7eb",
                                    color:
                                        currentStep >= step
                                            ? "white"
                                            : "#9ca3af",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: "600",
                                    fontSize: "14px",
                                    transition: "all 0.3s",
                                }}
                            >
                                {step}
                            </div>
                            {step < 3 && (
                                <div
                                    style={{
                                        width: "60px",
                                        height: "2px",
                                        backgroundColor:
                                            currentStep > step
                                                ? "#667eea"
                                                : "#e5e7eb",
                                        transition: "all 0.3s",
                                    }}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} style={{ padding: "2rem" }}>
                    {error && (
                        <div
                            style={{
                                backgroundColor: "#fee2e2",
                                color: "#dc2626",
                                padding: "0.875rem",
                                borderRadius: "8px",
                                marginBottom: "1.5rem",
                                fontSize: "14px",
                            }}
                        >
                            {error}
                        </div>
                    )}

                    {/* Step 1: Basic Info */}
                    {currentStep === 1 && (
                        <div>
                            <h3
                                style={{
                                    marginBottom: "1.5rem",
                                    color: "#1f2937",
                                }}
                            >
                                Basic Information
                            </h3>

                            <div style={{ marginBottom: "1.25rem" }}>
                                <label
                                    style={{
                                        display: "block",
                                        marginBottom: "0.5rem",
                                        color: "#374151",
                                        fontSize: "14px",
                                        fontWeight: "600",
                                    }}
                                >
                                    Bio
                                </label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    placeholder="Tell us about yourself, your experience, and what you're looking for..."
                                    rows={4}
                                    style={{
                                        width: "100%",
                                        padding: "0.75rem",
                                        border: "2px solid #e5e7eb",
                                        borderRadius: "8px",
                                        fontSize: "15px",
                                        fontFamily: "inherit",
                                        outline: "none",
                                        boxSizing: "border-box",
                                        resize: "vertical",
                                    }}
                                    onFocus={(e) =>
                                        (e.target.style.borderColor = "#667eea")
                                    }
                                    onBlur={(e) =>
                                        (e.target.style.borderColor = "#e5e7eb")
                                    }
                                />
                            </div>

                            <div style={{ marginBottom: "1.25rem" }}>
                                <label
                                    style={{
                                        display: "block",
                                        marginBottom: "0.5rem",
                                        color: "#374151",
                                        fontSize: "14px",
                                        fontWeight: "600",
                                    }}
                                >
                                    Location
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    placeholder="City, State"
                                    style={{
                                        width: "100%",
                                        padding: "0.75rem",
                                        border: "2px solid #e5e7eb",
                                        borderRadius: "8px",
                                        fontSize: "15px",
                                        outline: "none",
                                        boxSizing: "border-box",
                                    }}
                                    onFocus={(e) =>
                                        (e.target.style.borderColor = "#667eea")
                                    }
                                    onBlur={(e) =>
                                        (e.target.style.borderColor = "#e5e7eb")
                                    }
                                />
                            </div>

                            <div style={{ marginBottom: "1.25rem" }}>
                                <label
                                    style={{
                                        display: "block",
                                        marginBottom: "0.5rem",
                                        color: "#374151",
                                        fontSize: "14px",
                                        fontWeight: "600",
                                    }}
                                >
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                    placeholder="(555) 123-4567"
                                    style={{
                                        width: "100%",
                                        padding: "0.75rem",
                                        border: "2px solid #e5e7eb",
                                        borderRadius: "8px",
                                        fontSize: "15px",
                                        outline: "none",
                                        boxSizing: "border-box",
                                    }}
                                    onFocus={(e) =>
                                        (e.target.style.borderColor = "#667eea")
                                    }
                                    onBlur={(e) =>
                                        (e.target.style.borderColor = "#e5e7eb")
                                    }
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Work Preferences */}
                    {currentStep === 2 && (
                        <div>
                            <h3
                                style={{
                                    marginBottom: "1.5rem",
                                    color: "#1f2937",
                                }}
                            >
                                Work Preferences
                            </h3>

                            <div style={{ marginBottom: "1.5rem" }}>
                                <label
                                    style={{
                                        display: "block",
                                        marginBottom: "0.75rem",
                                        color: "#374151",
                                        fontSize: "14px",
                                        fontWeight: "600",
                                    }}
                                >
                                    Work Type Preference
                                </label>
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "0.75rem",
                                    }}
                                >
                                    {["Remote", "Hybrid", "On-site"].map(
                                        (type) => (
                                            <label
                                                key={type}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "0.5rem",
                                                    cursor: "pointer",
                                                    padding: "0.75rem",
                                                    border: "2px solid #e5e7eb",
                                                    borderRadius: "8px",
                                                    backgroundColor:
                                                        formData.workPreference.includes(
                                                            type
                                                        )
                                                            ? "#ede9fe"
                                                            : "white",
                                                    borderColor:
                                                        formData.workPreference.includes(
                                                            type
                                                        )
                                                            ? "#667eea"
                                                            : "#e5e7eb",
                                                    transition: "all 0.2s",
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.workPreference.includes(
                                                        type
                                                    )}
                                                    onChange={() =>
                                                        handleCheckboxChange(
                                                            "workPreference",
                                                            type
                                                        )
                                                    }
                                                    style={{
                                                        width: "18px",
                                                        height: "18px",
                                                        cursor: "pointer",
                                                    }}
                                                />
                                                <span
                                                    style={{
                                                        fontSize: "15px",
                                                        color: "#1f2937",
                                                    }}
                                                >
                                                    {type}
                                                </span>
                                            </label>
                                        )
                                    )}
                                </div>

                                <label
                                    style={{
                                        display: "block",
                                        marginBottom: "0.75rem",
                                        color: "#374151",
                                        fontSize: "14px",
                                        fontWeight: "600",
                                        marginTop: "0.5rem",
                                    }}
                                >
                                    Work Time
                                </label>
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "0.75rem",
                                    }}
                                >
                                    {[
                                        "Full-time",
                                        "Part-time",
                                        "Flex-time",
                                        "Seasonal",
                                        "Variable",
                                    ].map((type) => (
                                        <label
                                            key={type}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "0.5rem",
                                                cursor: "pointer",
                                                padding: "0.75rem",
                                                border: "2px solid #e5e7eb",
                                                borderRadius: "8px",
                                                backgroundColor:
                                                    formData.workTime.includes(
                                                        type
                                                    )
                                                        ? "#ede9fe"
                                                        : "white",
                                                borderColor:
                                                    formData.workTime.includes(
                                                        type
                                                    )
                                                        ? "#667eea"
                                                        : "#e5e7eb",
                                                transition: "all 0.2s",
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={formData.workTime.includes(
                                                    type
                                                )}
                                                onChange={() =>
                                                    handleCheckboxChange(
                                                        "workTime",
                                                        type
                                                    )
                                                }
                                                style={{
                                                    width: "18px",
                                                    height: "18px",
                                                    cursor: "pointer",
                                                }}
                                            />
                                            <span
                                                style={{
                                                    fontSize: "15px",
                                                    color: "#1f2937",
                                                }}
                                            >
                                                {type}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginBottom: "1.25rem" }}>
                                <label
                                    style={{
                                        display: "block",
                                        marginBottom: "0.5rem",
                                        color: "#374151",
                                        fontSize: "14px",
                                        fontWeight: "600",
                                    }}
                                >
                                    Experience Level
                                </label>
                                <select
                                    name="experienceLevel"
                                    value={formData.experienceLevel}
                                    onChange={handleInputChange}
                                    style={{
                                        width: "100%",
                                        padding: "0.75rem",
                                        border: "2px solid #e5e7eb",
                                        borderRadius: "8px",
                                        fontSize: "15px",
                                        outline: "none",
                                        boxSizing: "border-box",
                                        cursor: "pointer",
                                        backgroundColor: "white",
                                    }}
                                    onFocus={(e) =>
                                        (e.target.style.borderColor = "#667eea")
                                    }
                                    onBlur={(e) =>
                                        (e.target.style.borderColor = "#e5e7eb")
                                    }
                                >
                                    <option value="">
                                        Select experience level
                                    </option>
                                    <option value="entry">
                                        Entry Level (0-2 years)
                                    </option>
                                    <option value="mid">
                                        Mid Level (3-5 years)
                                    </option>
                                    <option value="senior">
                                        Senior Level (6-10 years)
                                    </option>
                                    <option value="lead">
                                        Lead/Principal (10+ years)
                                    </option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Expectations */}
                    {currentStep === 3 && (
                        <div>
                            <h3
                                style={{
                                    marginBottom: "1.5rem",
                                    color: "#1f2937",
                                }}
                            >
                                Job Expectations
                            </h3>

                            <div style={{ marginBottom: "1.25rem" }}>
                                <label
                                    style={{
                                        display: "block",
                                        marginBottom: "0.5rem",
                                        color: "#374151",
                                        fontSize: "14px",
                                        fontWeight: "600",
                                    }}
                                >
                                    Desired Salary Range
                                </label>
                                <select
                                    name="desiredSalary"
                                    value={formData.desiredSalary}
                                    onChange={handleInputChange}
                                    style={{
                                        width: "100%",
                                        padding: "0.75rem",
                                        border: "2px solid #e5e7eb",
                                        borderRadius: "8px",
                                        fontSize: "15px",
                                        outline: "none",
                                        boxSizing: "border-box",
                                        cursor: "pointer",
                                        backgroundColor: "white",
                                    }}
                                    onFocus={(e) =>
                                        (e.target.style.borderColor = "#667eea")
                                    }
                                    onBlur={(e) =>
                                        (e.target.style.borderColor = "#e5e7eb")
                                    }
                                >
                                    <option value="">
                                        Select salary range
                                    </option>
                                    <option value="30-50k">
                                        $30,000 - $50,000
                                    </option>
                                    <option value="50-75k">
                                        $50,000 - $75,000
                                    </option>
                                    <option value="75-100k">
                                        $75,000 - $100,000
                                    </option>
                                    <option value="100-150k">
                                        $100,000 - $150,000
                                    </option>
                                    <option value="150k+">$150,000+</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: "1.25rem" }}>
                                <label
                                    style={{
                                        display: "block",
                                        marginBottom: "0.5rem",
                                        color: "#374151",
                                        fontSize: "14px",
                                        fontWeight: "600",
                                    }}
                                >
                                    Availability
                                </label>
                                <select
                                    name="availability"
                                    value={formData.availability}
                                    onChange={handleInputChange}
                                    style={{
                                        width: "100%",
                                        padding: "0.75rem",
                                        border: "2px solid #e5e7eb",
                                        borderRadius: "8px",
                                        fontSize: "15px",
                                        outline: "none",
                                        boxSizing: "border-box",
                                        cursor: "pointer",
                                        backgroundColor: "white",
                                    }}
                                    onFocus={(e) =>
                                        (e.target.style.borderColor = "#667eea")
                                    }
                                    onBlur={(e) =>
                                        (e.target.style.borderColor = "#e5e7eb")
                                    }
                                >
                                    <option value="">
                                        Select availability
                                    </option>
                                    <option value="immediate">Immediate</option>
                                    <option value="2weeks">
                                        2 Weeks Notice
                                    </option>
                                    <option value="1month">1 Month</option>
                                    <option value="flexible">Flexible</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginTop: "2rem",
                            gap: "1rem",
                        }}
                    >
                        <button
                            type="button"
                            onClick={handlePrevStep}
                            disabled={currentStep === 1}
                            style={{
                                flex: 1,
                                padding: "0.875rem",
                                border: "2px solid #e5e7eb",
                                borderRadius: "8px",
                                fontSize: "16px",
                                fontWeight: "600",
                                cursor:
                                    currentStep === 1
                                        ? "not-allowed"
                                        : "pointer",
                                backgroundColor: "white",
                                color:
                                    currentStep === 1 ? "#9ca3af" : "#374151",
                                opacity: currentStep === 1 ? 0.5 : 1,
                            }}
                        >
                            Previous
                        </button>

                        {currentStep < 3 ? (
                            <button
                                type="button"
                                onClick={handleNextStep}
                                style={{
                                    flex: 1,
                                    padding: "0.875rem",
                                    background:
                                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "8px",
                                    fontSize: "16px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                }}
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={isLoading}
                                style={{
                                    flex: 1,
                                    padding: "0.875rem",
                                    background: isLoading
                                        ? "#9ca3af"
                                        : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "8px",
                                    fontSize: "16px",
                                    fontWeight: "600",
                                    cursor: isLoading
                                        ? "not-allowed"
                                        : "pointer",
                                }}
                            >
                                {isLoading ? "Saving..." : "Complete Profile"}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default IndividualProfileSetup;

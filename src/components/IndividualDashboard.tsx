import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { Briefcase, MapPin, DollarSign, Clock } from "lucide-react";

interface Profile {
    bio: string;
    location: string;
    phone_number: string;
    work_preference: string[];
    work_time: string[];
    experience_level: string;
    desired_salary: string;
    availability: string;
}

interface Application {
    id: string;
    job_posting_id: string;
    status: string;
    applied_at: string;
    job_postings: {
        title: string;
        company_name: string;
        location: string;
        work_type: string;
    };
}

const IndividualDashboard: React.FC = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadDashboardData();
        }
    }, [user]);

    const loadDashboardData = async () => {
        try {
            // Load profile
            const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .select("*")
                .eq("user_id", user?.id)
                .single();

            if (profileError && profileError.code !== "PGRST116") {
                console.error("Error loading profile:", profileError);
            } else {
                setProfile(profileData);
            }

            // Load applications
            const { data: appsData, error: appsError } = await supabase
                .from("applications")
                .select(
                    `
          *,
          job_postings (
            title,
            location,
            work_type
          )
        `
                )
                .eq("applicant_id", user?.id)
                .order("applied_at", { ascending: false });

            if (appsError) {
                console.error("Error loading applications:", appsError);
            } else {
                setApplications(appsData || []);
            }
        } catch (err) {
            console.error("Error loading dashboard:", err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "accepted":
                return "#22c55e";
            case "reviewing":
                return "#3b82f6";
            case "shortlisted":
                return "#f59e0b";
            case "rejected":
                return "#ef4444";
            default:
                return "#6b7280";
        }
    };

    const getStatusLabel = (status: string) => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    if (loading) {
        return (
            <div
                style={{
                    minHeight: "80vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <div className="loading-spinner">Loading your dashboard...</div>
            </div>
        );
    }

    const userName =
        user?.user_metadata?.first_name || user?.email?.split("@")[0] || "User";

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#f8fafc",
                padding: "2rem 0",
            }}
        >
            <div
                className="container"
                style={{
                    maxWidth: "1200px",
                    margin: "0 auto",
                    padding: "0 2rem",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        marginBottom: "2rem",
                    }}
                >
                    <h1
                        style={{
                            fontSize: "2.5rem",
                            fontWeight: "700",
                            color: "#1f2937",
                            marginBottom: "0.5rem",
                        }}
                    >
                        Welcome back, {userName}!
                    </h1>
                    <p
                        style={{
                            fontSize: "1.1rem",
                            color: "#6b7280",
                        }}
                    >
                        Here's your job search overview
                    </p>
                </div>

                {/* Profile Summary Card */}
                {profile ? (
                    <div
                        style={{
                            backgroundColor: "white",
                            borderRadius: "12px",
                            padding: "2rem",
                            marginBottom: "2rem",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        }}
                    >
                        <h2
                            style={{
                                fontSize: "1.5rem",
                                fontWeight: "700",
                                color: "#1f2937",
                                marginBottom: "1.5rem",
                            }}
                        >
                            Your Profile
                        </h2>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(auto-fit, minmax(250px, 1fr))",
                                gap: "1.5rem",
                            }}
                        >
                            {profile.location && (
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: "0.75rem",
                                    }}
                                >
                                    <MapPin size={20} color="#667eea" />
                                    <div>
                                        <div
                                            style={{
                                                fontSize: "0.875rem",
                                                color: "#6b7280",
                                                marginBottom: "0.25rem",
                                            }}
                                        >
                                            Location
                                        </div>
                                        <div
                                            style={{
                                                fontWeight: "600",
                                                color: "#1f2937",
                                            }}
                                        >
                                            {profile.location}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {profile.experience_level && (
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: "0.75rem",
                                    }}
                                >
                                    <Briefcase size={20} color="#667eea" />
                                    <div>
                                        <div
                                            style={{
                                                fontSize: "0.875rem",
                                                color: "#6b7280",
                                                marginBottom: "0.25rem",
                                            }}
                                        >
                                            Experience Level
                                        </div>
                                        <div
                                            style={{
                                                fontWeight: "600",
                                                color: "#1f2937",
                                                textTransform: "capitalize",
                                            }}
                                        >
                                            {profile.experience_level}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {profile.desired_salary && (
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: "0.75rem",
                                    }}
                                >
                                    <DollarSign size={20} color="#667eea" />
                                    <div>
                                        <div
                                            style={{
                                                fontSize: "0.875rem",
                                                color: "#6b7280",
                                                marginBottom: "0.25rem",
                                            }}
                                        >
                                            Desired Salary
                                        </div>
                                        <div
                                            style={{
                                                fontWeight: "600",
                                                color: "#1f2937",
                                            }}
                                        >
                                            {profile.desired_salary}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {profile.availability && (
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: "0.75rem",
                                    }}
                                >
                                    <Clock size={20} color="#667eea" />
                                    <div>
                                        <div
                                            style={{
                                                fontSize: "0.875rem",
                                                color: "#6b7280",
                                                marginBottom: "0.25rem",
                                            }}
                                        >
                                            Availability
                                        </div>
                                        <div
                                            style={{
                                                fontWeight: "600",
                                                color: "#1f2937",
                                                textTransform: "capitalize",
                                            }}
                                        >
                                            {profile.availability}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ marginTop: "1.5rem", display: "flex", gap: "2rem" }}>
                            {profile.work_preference && profile.work_preference.length > 0 && (
                                <div>
                                    <div
                                        style={{
                                            fontSize: "0.875rem",
                                            color: "#6b7280",
                                            marginBottom: "0.5rem",
                                        }}
                                    >
                                        Work Preferences
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: "0.5rem",
                                            flexWrap: "wrap",
                                        }}
                                    >
                                        {profile.work_preference.map((pref, index) => (
                                            <span
                                                key={index}
                                                style={{
                                                    padding: "0.375rem 0.75rem",
                                                    backgroundColor: "#ede9fe",
                                                    color: "#667eea",
                                                    borderRadius: "6px",
                                                    fontSize: "0.875rem",
                                                    fontWeight: "500",
                                                }}
                                            >
                                                {pref}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {profile.work_time && profile.work_time.length > 0 && (
                                <div>
                                    <div
                                        style={{
                                            fontSize: "0.875rem",
                                            color: "#6b7280",
                                            marginBottom: "0.5rem",
                                        }}
                                    >
                                        Work Time
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: "0.5rem",
                                            flexWrap: "wrap",
                                        }}
                                    >
                                        {profile.work_time.map((time, index) => (
                                            <span
                                                key={index}
                                                style={{
                                                    padding: "0.375rem 0.75rem",
                                                    backgroundColor: "#ede9fe",
                                                    color: "#667eea",
                                                    borderRadius: "6px",
                                                    fontSize: "0.875rem",
                                                    fontWeight: "500",
                                                }}
                                            >
                                                {time}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div
                        style={{
                            backgroundColor: "#fef3c7",
                            border: "1px solid #fbbf24",
                            borderRadius: "12px",
                            padding: "1.5rem",
                            marginBottom: "2rem",
                        }}
                    >
                        <p style={{ color: "#92400e", margin: 0 }}>
                            You haven't completed your profile yet.{" "}
                            <a
                                href="/#/individual-profile-setup"
                                style={{ color: "#d97706", fontWeight: "600" }}
                            >
                                Complete it now
                            </a>
                        </p>
                    </div>
                )}

                {/* Applications Section */}
                <div
                    style={{
                        backgroundColor: "white",
                        borderRadius: "12px",
                        padding: "2rem",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }}
                >
                    <h2
                        style={{
                            fontSize: "1.5rem",
                            fontWeight: "700",
                            color: "#1f2937",
                            marginBottom: "1.5rem",
                        }}
                    >
                        Your Applications
                    </h2>

                    {applications.length > 0 ? (
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "1rem",
                            }}
                        >
                            {applications.map((app) => (
                                <div
                                    key={app.id}
                                    style={{
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "8px",
                                        padding: "1.25rem",
                                        transition: "box-shadow 0.2s",
                                        cursor: "pointer",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.boxShadow =
                                            "0 4px 12px rgba(0,0,0,0.1)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.boxShadow =
                                            "none";
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "flex-start",
                                            marginBottom: "0.75rem",
                                        }}
                                    >
                                        <div>
                                            <h3
                                                style={{
                                                    fontSize: "1.125rem",
                                                    fontWeight: "600",
                                                    color: "#1f2937",
                                                    margin: "0 0 0.25rem 0",
                                                }}
                                            >
                                                {app.job_postings?.title ||
                                                    "Job Title"}
                                            </h3>
                                            <p
                                                style={{
                                                    fontSize: "0.875rem",
                                                    color: "#6b7280",
                                                    margin: 0,
                                                }}
                                            >
                                                {app.job_postings?.location ||
                                                    "Location not specified"}
                                            </p>
                                        </div>
                                        <span
                                            style={{
                                                padding: "0.375rem 0.875rem",
                                                backgroundColor:
                                                    getStatusColor(app.status) +
                                                    "20",
                                                color: getStatusColor(
                                                    app.status
                                                ),
                                                borderRadius: "6px",
                                                fontSize: "0.875rem",
                                                fontWeight: "600",
                                            }}
                                        >
                                            {getStatusLabel(app.status)}
                                        </span>
                                    </div>

                                    <div
                                        style={{
                                            fontSize: "0.875rem",
                                            color: "#6b7280",
                                        }}
                                    >
                                        Applied{" "}
                                        {new Date(
                                            app.applied_at
                                        ).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div
                            style={{
                                textAlign: "center",
                                padding: "3rem 1rem",
                                color: "#6b7280",
                            }}
                        >
                            <Briefcase
                                size={48}
                                color="#d1d5db"
                                style={{ margin: "0 auto 1rem" }}
                            />
                            <p
                                style={{
                                    fontSize: "1.125rem",
                                    marginBottom: "0.5rem",
                                }}
                            >
                                No applications yet
                            </p>
                            <p style={{ fontSize: "0.875rem", margin: 0 }}>
                                Start browsing jobs and apply to opportunities
                                that match your skills
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IndividualDashboard;

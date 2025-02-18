import React, { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import * as XLSX from "xlsx"; // Import SheetJS for Excel export

interface Role {
  title?: string;
  dateRange?: string;
  location?: string;
  description?: string[];
}

interface Experience {
  company: string;
  roles?: Role[];
  dateRange?: string;
  description?: string[];
  location?: string;
  title?: string;
  skills?: string;
}

interface Education {
  institution: string;
  degree: string;
  date: string;
  details: string[];
}

interface Evaluation {
  personal_information: {
    score: number;
    explanation: string;
  };
  education: {
    score: number;
    explanation: string;
  };
  work_experience: {
    score: number;
    explanation: string;
  };
  overall_score: number;
  actionable_insights: string[];
}

interface Profile {
  name?: string;
  location?: string;
  profile_url?: string;
  title?: string;
  experiences?: Experience[];
  education?: Education[];
  evaluation?: Evaluation;
}

function App() {
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [sessionCookie, setSessionCookie] = useState("");
  const [maxProfiles, setMaxProfiles] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  // For carousel navigation: track the current profile index
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkedinUrl || !sessionCookie) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsRunning(true);
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/linkedin/scrape_by_url",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: linkedinUrl,
            session_cookie: sessionCookie,
            limit: maxProfiles,
          }),
        }
      );

      const data = await response.json();
      console.log(data);

      if (data.error) {
        toast.error(data.error);
      } else {
        // Reset carousel index when new profiles are loaded
        setProfiles(
          Array.isArray(data.profile) ? data.profile : [data.profile]
        );
        setCurrentProfileIndex(0);
        toast.success("Profiles scraped successfully!");
      }
    } catch (error) {
      toast.error("Failed to scrape profiles");
      console.error(error);
    } finally {
      setIsRunning(false);
    }
  };

  // Navigation functions for the carousel
  const goToPrevious = () => {
    setCurrentProfileIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : prevIndex
    );
  };

  const goToNext = () => {
    setCurrentProfileIndex((prevIndex) =>
      prevIndex < profiles.length - 1 ? prevIndex + 1 : prevIndex
    );
  };

  // Export function: exports only the top-level keys (ignoring nested structures)
  const exportToExcel = () => {
    if (profiles.length === 0) {
      toast.error("No profiles to export");
      return;
    }
    const exportData = profiles.map((profile) => ({
      name: profile.name || "",
      profile_url: profile.profile_url || "",
      title: profile.title || "",
      location: profile.location || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Profiles");
    XLSX.writeFile(workbook, "profiles.xlsx");
  };

  // Get the current profile to display in the carousel
  const currentProfile = profiles[currentProfileIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            LinkedIn Search Export
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Form Section */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* LinkedIn Search URL */}
              <div>
                <label
                  htmlFor="linkedinUrl"
                  className="block text-sm font-medium text-gray-700"
                >
                  LinkedIn Search URL *
                </label>
                <div className="mt-1">
                  <input
                    type="url"
                    id="linkedinUrl"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="https://www.linkedin.com/search/results/people/..."
                    required
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Paste the full LinkedIn search URL here
                </p>
              </div>

              {/* Session Cookie */}
              <div>
                <label
                  htmlFor="sessionCookie"
                  className="block text-sm font-medium text-gray-700"
                >
                  LinkedIn Session Cookie *
                </label>
                <div className="mt-1">
                  <textarea
                    id="sessionCookie"
                    value={sessionCookie}
                    onChange={(e) => setSessionCookie(e.target.value)}
                    rows={3}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Paste your li_at session cookie here..."
                    required
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Your LinkedIn session cookie is required for authentication
                </p>
              </div>

              {/* Max Profiles */}
              <div>
                <label
                  htmlFor="maxProfiles"
                  className="block text-sm font-medium text-gray-700"
                >
                  Maximum Number of Profiles
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    id="maxProfiles"
                    value={maxProfiles}
                    onChange={(e) => setMaxProfiles(Number(e.target.value))}
                    min="1"
                    max="5"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Number of profiles to extract (maximum 5)
                </p>
              </div>

              {/* Info Box */}
              <div className="rounded-md bg-blue-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <InformationCircleIcon
                      className="h-5 w-5 text-blue-400"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-3 flex-1 md:flex md:justify-between">
                    <p className="text-sm text-blue-700">
                      This will scrape LinkedIn profiles from the provided
                      search URL and display them below.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isRunning}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                    ${
                      isRunning
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    }`}
                >
                  {isRunning ? "Processing..." : "Start Export"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Export to Excel Button */}
        {profiles.length > 0 && (
          <div className="flex justify-end mt-4">
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Export to Excel
            </button>
          </div>
        )}

        {/* Carousel Section */}
        {profiles.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 text-center mb-4">
              Scraped Profiles Carousel
            </h2>
            <div className="relative bg-white shadow rounded-lg overflow-hidden">
              {/* Previous Button */}
              <button
                onClick={goToPrevious}
                disabled={currentProfileIndex === 0}
                className="absolute left-0 top-4 bg-gray-200 hover:bg-gray-300 p-2 rounded-full focus:outline-none"
              >
                &lt;
              </button>

              {/* Display Current Profile */}
              <div className="px-6 py-4">
                {/* Header Section */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      {currentProfile.name}
                      {currentProfile.profile_url && (
                        <a
                          href={currentProfile.profile_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-sm text-blue-600 hover:text-blue-800"
                        >
                          View Profile ↗
                        </a>
                      )}
                    </h3>
                    {currentProfile.title && (
                      <p className="text-md text-gray-700">
                        {currentProfile.title}
                      </p>
                    )}
                    {currentProfile.location && (
                      <p className="text-sm text-gray-600">
                        {currentProfile.location}
                      </p>
                    )}
                  </div>
                </div>

                {/* Content Section */}
                <div className="px-6 py-4 space-y-6">
                  {/* Experience Section */}
                  {currentProfile.experiences &&
                    currentProfile.experiences.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                          Experience
                        </h4>
                        <div className="space-y-6">
                          {currentProfile.experiences.map((exp, expIndex) => (
                            <div
                              key={expIndex}
                              className="border-l-2 border-gray-200 pl-4"
                            >
                              <div className="space-y-2">
                                <h5 className="font-medium text-gray-900">
                                  {exp.company}
                                </h5>
                                {exp.roles ? (
                                  // Multiple roles at the same company
                                  <div className="space-y-4 mt-2">
                                    {exp.roles.map((role, roleIndex) => (
                                      <div key={roleIndex} className="ml-4">
                                        <p className="font-medium text-gray-800">
                                          {role.title}
                                        </p>
                                        {role.dateRange && (
                                          <p className="text-sm text-gray-600">
                                            {role.dateRange}
                                          </p>
                                        )}
                                        {role.location && (
                                          <p className="text-sm text-gray-600">
                                            {role.location}
                                          </p>
                                        )}
                                        {role.description &&
                                          role.description.length > 0 && (
                                            <ul className="mt-2 list-disc list-inside text-sm text-gray-600 space-y-1">
                                              {role.description.map(
                                                (desc, descIndex) => (
                                                  <li key={descIndex}>
                                                    {desc}
                                                  </li>
                                                )
                                              )}
                                            </ul>
                                          )}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  // Single role
                                  <div>
                                    {exp.title && (
                                      <p className="font-medium text-gray-800">
                                        {exp.title}
                                      </p>
                                    )}
                                    {exp.dateRange && (
                                      <p className="text-sm text-gray-600">
                                        {exp.dateRange}
                                      </p>
                                    )}
                                    {exp.location && (
                                      <p className="text-sm text-gray-600">
                                        {exp.location}
                                      </p>
                                    )}
                                    {exp.description &&
                                      exp.description.length > 0 && (
                                        <ul className="mt-2 list-disc list-inside text-sm text-gray-600 space-y-1">
                                          {exp.description.map(
                                            (desc, descIndex) => (
                                              <li key={descIndex}>{desc}</li>
                                            )
                                          )}
                                        </ul>
                                      )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Education Section */}
                  {currentProfile.education &&
                    currentProfile.education.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                          Education
                        </h4>
                        <div className="space-y-4">
                          {currentProfile.education.map((edu, eduIndex) => (
                            <div
                              key={eduIndex}
                              className="border-l-2 border-gray-200 pl-4"
                            >
                              <h5 className="font-medium text-gray-900">
                                {edu.institution}
                              </h5>
                              <p className="text-gray-800">{edu.degree}</p>
                              {edu.date && (
                                <p className="text-sm text-gray-600">
                                  {edu.date}
                                </p>
                              )}
                              {edu.details && edu.details.length > 0 && (
                                <ul className="mt-2 list-disc list-inside text-sm text-gray-600 space-y-1">
                                  {edu.details.map((detail, detailIndex) => (
                                    <li key={detailIndex}>{detail}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Evaluation Section */}
                  {currentProfile.evaluation && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Evaluation
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <h5 className="font-medium text-gray-900">
                            Personal Information
                          </h5>
                          <p className="text-sm text-gray-600">
                            Score:{" "}
                            {
                              currentProfile.evaluation.personal_information
                                .score
                            }
                          </p>
                          <p className="text-sm text-gray-600">
                            {
                              currentProfile.evaluation.personal_information
                                .explanation
                            }
                          </p>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">
                            Education
                          </h5>
                          <p className="text-sm text-gray-600">
                            Score: {currentProfile.evaluation.education.score}
                          </p>
                          <p className="text-sm text-gray-600">
                            {currentProfile.evaluation.education.explanation}
                          </p>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">
                            Work Experience
                          </h5>
                          <p className="text-sm text-gray-600">
                            Score:{" "}
                            {currentProfile.evaluation.work_experience.score}
                          </p>
                          <p className="text-sm text-gray-600">
                            {
                              currentProfile.evaluation.work_experience
                                .explanation
                            }
                          </p>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">
                            Overall Score
                          </h5>
                          <p className="text-sm text-gray-600">
                            {currentProfile.evaluation.overall_score}
                          </p>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">
                            Actionable Insights
                          </h5>
                          <ul className="mt-2 list-disc list-inside text-sm text-gray-600 space-y-1">
                            {currentProfile.evaluation.actionable_insights.map(
                              (insight, index) => (
                                <li key={index}>{insight}</li>
                              )
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Next Button */}
              <button
                onClick={goToNext}
                disabled={currentProfileIndex === profiles.length - 1}
                className="absolute right-0 top-4 bg-gray-200 hover:bg-gray-300 p-2 rounded-full focus:outline-none"
              >
                &gt;
              </button>
            </div>
            <p className="text-center mt-2">
              {currentProfileIndex + 1} of {profiles.length}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

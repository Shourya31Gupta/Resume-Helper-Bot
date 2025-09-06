import { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";

export default function CreateResume() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    professionalSummary: "",
    jobTitle: "",
    yearsOfExperience: "",
    skills: "",
    workExperience: "",
    education: "",
    certifications: "",
    additionalInfo: ""
  });
  
  const [generatedResume, setGeneratedResume] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setGeneratedResume("");

    try {
      const response = await axios.post("/api/create-resume", formData);
      setGeneratedResume(response.data.resume);
      setLoading(false);
    } catch (err) {
      console.error("Error creating resume:", err);
      alert("Failed to create resume. Please try again.");
      setLoading(false);
    }
  };

  const downloadResume = async () => {
    try {
      const convertMarkdownToWord = (markdown) => {
        const lines = markdown.split('\n');
        const paragraphs = [];
        
        lines.forEach((line, index) => {
          const trimmedLine = line.trim();
          
          if (trimmedLine === '') {
            paragraphs.push(
              new Paragraph({
                children: [new TextRun({ text: "", break: 1 })],
                spacing: { after: 200 },
              })
            );
          } else if (trimmedLine.startsWith('#')) {
            const level = trimmedLine.match(/^#+/)[0].length;
            const text = trimmedLine.replace(/^#+\s*/, '');
            
            let headingLevel;
            switch (level) {
              case 1: headingLevel = HeadingLevel.HEADING_1; break;
              case 2: headingLevel = HeadingLevel.HEADING_2; break;
              case 3: headingLevel = HeadingLevel.HEADING_3; break;
              default: headingLevel = HeadingLevel.HEADING_4;
            }
            
            paragraphs.push(
              new Paragraph({
                text: text,
                heading: headingLevel,
                spacing: { after: 200, before: 300 },
              })
            );
          } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
            const text = trimmedLine.replace(/^[-*]\s*/, '');
            paragraphs.push(
              new Paragraph({
                text: text,
                bullet: { level: 0 },
                spacing: { after: 100 },
              })
            );
          } else if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
            const text = trimmedLine.replace(/\*\*/g, '');
            paragraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: text,
                    bold: true,
                    size: 24,
                  }),
                ],
                spacing: { after: 200 },
              })
            );
          } else if (trimmedLine.includes('**')) {
            const parts = trimmedLine.split(/(\*\*.*?\*\*)/);
            const children = parts.map(part => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return new TextRun({
                  text: part.replace(/\*\*/g, ''),
                  bold: true,
                  size: 24,
                });
              } else if (part.trim()) {
                return new TextRun({
                  text: part,
                  size: 24,
                });
              }
              return null;
            }).filter(Boolean);
            
            if (children.length > 0) {
              paragraphs.push(
                new Paragraph({
                  children: children,
                  spacing: { after: 200 },
                })
              );
            }
          } else {
            paragraphs.push(
              new Paragraph({
                text: trimmedLine,
                spacing: { after: 200 },
              })
            );
          }
        });
        
        return paragraphs;
      };
      
      const doc = new Document({
        sections: [{
          properties: {},
          children: convertMarkdownToWord(generatedResume),
        }],
      });
      
      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${formData.fullName || 'resume'}-resume.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating Word document:', error);
      alert('Failed to generate Word document. Please try again.');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-900">Personal Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-900">Professional Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Professional Summary
                </label>
                <textarea
                  name="professionalSummary"
                  value={formData.professionalSummary}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Briefly describe your professional background and career goals..."
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Target Job Title *
                  </label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Years of Experience
                  </label>
                  <select
                    name="yearsOfExperience"
                    value={formData.yearsOfExperience}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select experience level</option>
                    <option value="0-1">0-1 years</option>
                    <option value="2-3">2-3 years</option>
                    <option value="4-6">4-6 years</option>
                    <option value="7-10">7-10 years</option>
                    <option value="10+">10+ years</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Skills (comma-separated)
                </label>
                <textarea
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., JavaScript, React, Python, Project Management, Leadership..."
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-900">Work Experience</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Work Experience
                </label>
                <textarea
                  name="workExperience"
                  value={formData.workExperience}
                  onChange={handleInputChange}
                  rows={8}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="List your work experience in this format:&#10;Company Name - Job Title (Start Date - End Date)&#10;• Key achievement or responsibility&#10;• Another key achievement&#10;&#10;Previous Company - Previous Title (Start Date - End Date)&#10;• Key achievement or responsibility"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-900">Education & Additional Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Education
                </label>
                <textarea
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Bachelor of Science in Computer Science, University Name, 2020"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Certifications
                </label>
                <textarea
                  name="certifications"
                  value={formData.certifications}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., AWS Certified Solutions Architect, Google Analytics Certified..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Additional Information
                </label>
                <textarea
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any additional information you'd like to include (languages, volunteer work, etc.)"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 animate-fade-in-up">
        <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl">
          Create Your Resume with AI
        </h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
          Build a professional resume tailored to your experience and career goals using advanced AI technology
        </p>
      </div>

      {/* Progress Bar */}
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-slate-600">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm font-medium text-slate-600">
            {Math.round((currentStep / totalSteps) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-xl p-8 shadow-lg border border-slate-200">
            {renderStep()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                currentStep === 1
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }`}
            >
              Previous
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                  loading
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700"
                }`}
              >
                {loading ? "Creating Resume..." : "Generate Resume"}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="max-w-2xl mx-auto text-center animate-fade-in-up">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
            <div className="flex items-center justify-center space-x-3 text-blue-600">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="font-medium">AI is creating your resume...</span>
            </div>
            <p className="text-slate-600 mt-2">This may take a few moments</p>
          </div>
        </div>
      )}

      {/* Generated Resume */}
      {generatedResume && !loading && (
        <div className="max-w-4xl mx-auto animate-fade-in-up">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-slate-900">Your AI-Generated Resume</h2>
              </div>
              <button
                onClick={downloadResume}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Download Word</span>
              </button>
            </div>
            <div className="prose prose-slate max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {generatedResume}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {/* Features Section */}
      <div className="bg-white rounded-xl p-8 shadow-lg border border-slate-200 animate-fade-in-up">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
          Why Use Our AI Resume Creator?
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center space-y-3 hover-lift p-4 rounded-lg transition-all duration-200">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900">AI-Powered</h3>
            <p className="text-slate-600 text-sm">Advanced AI creates professional, ATS-friendly resumes</p>
          </div>
          <div className="text-center space-y-3 hover-lift p-4 rounded-lg transition-all duration-200">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900">Professional Format</h3>
            <p className="text-slate-600 text-sm">Clean, modern design that impresses recruiters</p>
          </div>
          <div className="text-center space-y-3 hover-lift p-4 rounded-lg transition-all duration-200">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900">Easy Download</h3>
            <p className="text-slate-600 text-sm">Download as Word document ready for applications</p>
          </div>
        </div>
      </div>
    </div>
  );
}
